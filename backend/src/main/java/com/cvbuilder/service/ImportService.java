package com.cvbuilder.service;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.dto.PersonalInfoDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportService {

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    /** Full pipeline: extract text then parse with LLM. */
    public CreateCvRequest importFromFile(MultipartFile file) throws IOException {
        String text = extractText(file);
        return parseWithLlm(text);
    }

    /** Stage 1: extract raw text from the uploaded file. */
    public String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        String text;
        if (contentType.equals("application/pdf") || filename.endsWith(".pdf")) {
            text = extractPdfText(file);
        } else if (contentType.contains("wordprocessingml") || filename.endsWith(".docx")) {
            text = extractDocxText(file);
        } else {
            throw new IllegalArgumentException("Unsupported file type. Please upload a PDF or DOCX file.");
        }

        if (text.isBlank()) {
            throw new IllegalArgumentException("Could not extract text from the file. It may be image-based or protected.");
        }

        return text;
    }

    /** Stage 2: parse extracted text into a structured CV using the LLM. */
    public CreateCvRequest parseWithLlm(String resumeText) {
        String truncated = resumeText.length() > 12000 ? resumeText.substring(0, 12000) : resumeText;

        String prompt = """
            Parse the following resume text and return a JSON object that exactly matches this schema.
            Return ONLY the JSON — no markdown fences, no explanation, nothing else.

            Schema:
            {
              "title": "<resume title, e.g. 'John Doe - Software Engineer'>",
              "templateId": "ATS",
              "personalInfo": {
                "name": "", "email": "", "phone": "", "location": "",
                "linkedinUrl": "", "githubUrl": "", "summary": ""
              },
              "experiences": [
                { "id": "<uuid>", "company": "", "role": "", "startDate": "", "endDate": "", "description": "<ul><li>bullet 1</li><li>bullet 2</li></ul>" }
              ],
              "educations": [
                { "id": "<uuid>", "institution": "", "degree": "", "field": "", "graduationYear": "" }
              ],
              "skills": [
                { "id": "<uuid>", "name": "", "level": "Intermediate" }
              ],
              "projects": [
                { "id": "<uuid>", "name": "", "description": "<ul><li>bullet 1</li><li>bullet 2</li></ul>", "url": "" }
              ],
              "certifications": [
                { "id": "<uuid>", "name": "", "issuer": "", "issueDate": "", "expiryDate": "" }
              ],
              "languages": [
                { "id": "<uuid>", "name": "", "proficiency": "Fluent" }
              ],
              "awards": [
                { "id": "<uuid>", "title": "", "issuer": "", "date": "", "description": "" }
              ],
              "sectionOrder": ["personal","experience","education","skills","projects","certifications","languages","awards"]
            }

            Rules:
            - Generate a random UUID v4 for each id field
            - Use empty string "" for missing fields — never null
            - summary: keep as plain text (no HTML tags)
            - description (experience and project): format as HTML using <ul><li>...</li></ul> for bullet points — one <li> per achievement or responsibility. If there are no bullets, use a plain <p> tag.
            - level must be one of: Beginner, Intermediate, Advanced, Expert
            - proficiency must be one of: Basic, Conversational, Fluent, Native
            - Include only sections that have real content — empty arrays are fine

            RESUME TEXT:
            %s
            """.formatted(truncated);

        String rawText = llmClient.complete(prompt, 4096);
        rawText = rawText.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();

        try {
            return objectMapper.readValue(rawText, CreateCvRequest.class);
        } catch (Exception e) {
            log.warn("Primary LLM parse failed ({}), retrying with simplified prompt", e.getMessage());
            return retryWithSimplifiedPrompt(truncated);
        }
    }

    private String extractPdfText(MultipartFile file) throws IOException {
        try (PDDocument doc = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String extractDocxText(MultipartFile file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
            StringBuilder sb = new StringBuilder();
            doc.getParagraphs().forEach(p -> {
                String style = p.getStyle() != null ? p.getStyle() : "";
                String prefix = style.startsWith("Heading") ? "\n### " : "";
                sb.append(prefix).append(p.getText()).append('\n');
            });
            doc.getTables().forEach(table -> table.getRows().forEach(row ->
                row.getTableCells().forEach(cell -> sb.append(cell.getText()).append(' '))));
            return sb.toString();
        }
    }

    private CreateCvRequest retryWithSimplifiedPrompt(String resumeText) {
        String retryPrompt = """
            Extract key resume information and return ONLY valid JSON matching this minimal schema.
            No markdown, no explanation, just raw JSON.

            {
              "title": "<Name - Role>",
              "templateId": "ATS",
              "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedinUrl": "", "githubUrl": "", "summary": "" },
              "experiences": [{ "id": "<uuid>", "company": "", "role": "", "startDate": "", "endDate": "", "description": "" }],
              "educations": [{ "id": "<uuid>", "institution": "", "degree": "", "field": "", "graduationYear": "" }],
              "skills": [{ "id": "<uuid>", "name": "", "level": "Intermediate" }],
              "projects": [],
              "certifications": [],
              "languages": [],
              "awards": [],
              "sectionOrder": ["personal","experience","education","skills","projects","certifications","languages","awards"]
            }

            RESUME TEXT:
            %s
            """.formatted(resumeText.length() > 4000 ? resumeText.substring(0, 4000) : resumeText);

        try {
            String raw = llmClient.complete(retryPrompt, 2048);
            raw = raw.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();
            return objectMapper.readValue(raw, CreateCvRequest.class);
        } catch (Exception ex) {
            log.error("Simplified retry also failed: {}", ex.getMessage());
            throw new IllegalStateException("AI could not parse this resume. Please try a cleaner PDF or DOCX file.");
        }
    }
}
