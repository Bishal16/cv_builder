package com.cvbuilder.service;

import com.cvbuilder.dto.CreateCvRequest;
import com.cvbuilder.dto.PersonalInfoDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-4-6";
    private static final String API_VERSION = "2023-06-01";

    @Value("${anthropic.api.key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper;

    public CreateCvRequest importFromFile(MultipartFile file) throws IOException {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Resume import requires ANTHROPIC_API_KEY to be configured.");
        }

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

        return parseWithClaude(text);
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
            doc.getParagraphs().forEach(p -> sb.append(p.getText()).append('\n'));
            doc.getTables().forEach(table -> table.getRows().forEach(row ->
                row.getTableCells().forEach(cell -> sb.append(cell.getText()).append(' '))));
            return sb.toString();
        }
    }

    private CreateCvRequest parseWithClaude(String resumeText) {
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
                { "id": "<uuid>", "company": "", "role": "", "startDate": "", "endDate": "", "description": "<plain text bullets>" }
              ],
              "educations": [
                { "id": "<uuid>", "institution": "", "degree": "", "field": "", "startYear": "", "endYear": "", "grade": "" }
              ],
              "skills": [
                { "id": "<uuid>", "name": "", "level": "Intermediate" }
              ],
              "projects": [
                { "id": "<uuid>", "name": "", "description": "", "technologies": "", "url": "" }
              ],
              "certifications": [
                { "id": "<uuid>", "name": "", "issuer": "", "issueDate": "", "expiryDate": "" }
              ],
              "languages": [
                { "id": "<uuid>", "name": "", "proficiency": "Fluent" }
              ],
              "awards": [],
              "sectionOrder": ["personal","experience","education","skills","projects","certifications","languages","awards"]
            }

            Rules:
            - Generate a random UUID v4 for each id field
            - Use empty string "" for missing fields — never null
            - summary: keep as plain text (no HTML tags)
            - description: plain text bullets separated by newlines
            - level must be one of: Beginner, Intermediate, Advanced, Expert
            - proficiency must be one of: Basic, Conversational, Fluent, Native
            - Include only sections that have real content — empty arrays are fine

            RESUME TEXT:
            %s
            """.formatted(resumeText.length() > 6000 ? resumeText.substring(0, 6000) : resumeText);

        Map<String, Object> body = Map.of(
            "model", MODEL,
            "max_tokens", 4096,
            "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
            .uri(ANTHROPIC_API_URL)
            .header("x-api-key", apiKey)
            .header("anthropic-version", API_VERSION)
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .body(Map.class);

        String rawText = extractText(response);

        // Strip any accidental markdown fences
        rawText = rawText.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();

        try {
            return objectMapper.readValue(rawText, CreateCvRequest.class);
        } catch (Exception e) {
            log.error("Failed to parse Claude response as CreateCvRequest: {}", e.getMessage());
            log.debug("Raw Claude response: {}", rawText);
            // Return a minimal request with whatever we got from the text
            return fallbackRequest(resumeText);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        if (content == null || content.isEmpty()) return "";
        return (String) content.get(0).getOrDefault("text", "");
    }

    private CreateCvRequest fallbackRequest(String rawText) {
        CreateCvRequest req = new CreateCvRequest();
        req.setTitle("Imported Resume");
        req.setTemplateId(com.cvbuilder.model.TemplateId.ATS);
        PersonalInfoDto pi = new PersonalInfoDto();
        pi.setSummary(rawText.length() > 500 ? rawText.substring(0, 500) : rawText);
        req.setPersonalInfo(pi);
        req.setExperiences(List.of());
        req.setEducations(List.of());
        req.setSkills(List.of());
        req.setProjects(List.of());
        req.setCertifications(List.of());
        req.setLanguages(List.of());
        req.setAwards(List.of());
        return req;
    }
}
