package com.cvbuilder.service;

import com.cvbuilder.entity.Cv;
import com.cvbuilder.entity.Education;
import com.cvbuilder.entity.Experience;
import com.cvbuilder.entity.PersonalInfo;
import com.cvbuilder.entity.Skill;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.repository.CvRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class PdfService {

    private final CvRepository cvRepository;

    public PdfService(CvRepository cvRepository) {
        this.cvRepository = cvRepository;
    }

    public byte[] generatePdf(UUID cvId) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + cvId));

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                float yPosition = 750;
                float margin = 50;

                PDType1Font titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font headerFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font normalFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                if (cv.getPersonalInfo() != null) {
                    PersonalInfo info = cv.getPersonalInfo();
                    writeText(contentStream, info.getName(), titleFont, 18, margin, yPosition);
                    yPosition -= 30;

                    if (info.getEmail() != null) {
                        writeText(contentStream, info.getEmail(), normalFont, 11, margin, yPosition);
                        yPosition -= 15;
                    }
                    if (info.getPhone() != null) {
                        writeText(contentStream, info.getPhone(), normalFont, 11, margin, yPosition);
                        yPosition -= 15;
                    }
                    if (info.getLocation() != null) {
                        writeText(contentStream, info.getLocation(), normalFont, 11, margin, yPosition);
                        yPosition -= 15;
                    }
                    yPosition -= 10;
                }

                if (cv.getPersonalInfo() != null && cv.getPersonalInfo().getSummary() != null) {
                    yPosition = writeSection(contentStream, "Summary", headerFont, margin, yPosition);
                    writeText(contentStream, cv.getPersonalInfo().getSummary(), normalFont, 11, margin, yPosition);
                    yPosition -= 20;
                }

                if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
                    yPosition = writeSection(contentStream, "Experience", headerFont, margin, yPosition);
                    for (Experience exp : cv.getExperiences()) {
                        String role = exp.getRole() != null ? exp.getRole() : "";
                        String company = exp.getCompany() != null ? exp.getCompany() : "";
                        writeText(contentStream, role + " at " + company, headerFont, 12, margin, yPosition);
                        yPosition -= 15;
                        if (exp.getStartDate() != null) {
                            String dates = exp.getStartDate().toString();
                            if (exp.getEndDate() != null) {
                                dates += " - " + exp.getEndDate().toString();
                            }
                            writeText(contentStream, dates, normalFont, 10, margin, yPosition);
                            yPosition -= 15;
                        }
                        if (exp.getDescription() != null) {
                            writeText(contentStream, exp.getDescription(), normalFont, 10, margin, yPosition);
                        }
                        yPosition -= 20;
                    }
                }

                if (cv.getEducations() != null && !cv.getEducations().isEmpty()) {
                    yPosition = writeSection(contentStream, "Education", headerFont, margin, yPosition);
                    for (Education edu : cv.getEducations()) {
                        String degree = edu.getDegree() != null ? edu.getDegree() : "";
                        String field = edu.getField() != null ? edu.getField() : "";
                        String institution = edu.getInstitution() != null ? edu.getInstitution() : "";
                        writeText(contentStream, degree + " in " + field + " - " + institution, normalFont, 11, margin, yPosition);
                        yPosition -= 15;
                        if (edu.getGraduationYear() != null) {
                            writeText(contentStream, "Graduated: " + edu.getGraduationYear(), normalFont, 10, margin, yPosition);
                        }
                        yPosition -= 15;
                    }
                }

                if (cv.getSkills() != null && !cv.getSkills().isEmpty()) {
                    yPosition = writeSection(contentStream, "Skills", headerFont, margin, yPosition);
                    String skillsList = cv.getSkills().stream()
                            .map(Skill::getName)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("");
                    writeText(contentStream, skillsList, normalFont, 11, margin, yPosition);
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private float writeSection(PDPageContentStream contentStream, String title, PDType1Font font, 
            float margin, float yPosition) throws IOException {
        writeText(contentStream, title, font, 14, margin, yPosition);
        return yPosition - 20;
    }

    private void writeText(PDPageContentStream contentStream, String text, PDType1Font font, 
            int fontSize, float margin, float yPosition) throws IOException {
        if (text == null) return;
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText(text);
        contentStream.endText();
    }
}