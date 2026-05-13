package com.cvbuilder.service;

import com.cvbuilder.entity.*;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.repository.CvRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

import java.io.ByteArrayOutputStream;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PdfService {

    private final CvRepository cvRepository;

    public PdfService(CvRepository cvRepository) {
        this.cvRepository = cvRepository;
    }

    public byte[] generatePdf(UUID cvId) {
        // Fetch fresh from DB to avoid any persistence context issues
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + cvId));

        String htmlContent = generateHtml(cv);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            
            Document doc = htmlToDocument(htmlContent);
            builder.withW3cDocument(doc, "/");
            builder.toStream(baos);
            builder.run();
            
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private Document htmlToDocument(String html) {
        org.jsoup.nodes.Document doc = Jsoup.parse(html, "UTF-8");
        doc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);
        return new W3CDom().fromJsoup(doc);
    }

    private String generateHtml(Cv cv) {
        String templateId = cv.getTemplateId() != null ? cv.getTemplateId().name() : "CLASSIC";
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.4; font-size: 10pt; }");
        html.append(".page { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; position: relative; }");
        html.append("h1, h2, h3 { margin: 0; padding: 0; }");
        html.append(".text-sm { font-size: 9pt; }");
        html.append(".text-gray { color: #666; }");
        html.append(".mb-1 { margin-bottom: 4px; }");
        html.append(".mb-2 { margin-bottom: 8px; }");
        html.append(".mb-4 { margin-bottom: 16px; }");
        html.append(".mt-1 { margin-top: 4px; }");
        html.append(".mt-4 { margin-top: 16px; }");
        html.append(".clearfix::after { content: ''; clear: both; display: table; }");
        html.append(".break-words { word-wrap: break-word; word-break: break-all; }");

        if ("MODERN".equals(templateId)) {
            appendModernStyles(html);
        } else if ("ATS".equals(templateId)) {
            appendAtsStyles(html);
        } else {
            appendClassicStyles(html);
        }

        html.append("</style></head><body><div class='page'>");

        if ("MODERN".equals(templateId)) {
            generateModernHtml(html, cv);
        } else if ("ATS".equals(templateId)) {
            generateAtsHtml(html, cv);
        } else {
            generateClassicHtml(html, cv);
        }

        html.append("</div></body></html>");
        return html.toString();
    }

    private void appendClassicStyles(StringBuilder html) {
        html.append(".page { padding: 15mm; }");
        html.append(".header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }");
        html.append(".name { font-size: 26pt; font-weight: bold; margin-bottom: 5px; color: #1a202c; }");
        html.append(".contact-info { color: #4a5568; font-size: 10pt; }");
        html.append(".content-wrapper { display: block; position: relative; }");
        html.append(".sidebar { float: left; width: 28%; border-right: 1px solid #e2e8f0; padding-right: 4mm; min-height: 200mm; }");
        html.append(".main-content { float: right; width: 68%; padding-left: 4mm; }");
        html.append(".section-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e0; margin-bottom: 10px; margin-top: 20px; padding-bottom: 3px; color: #2d3748; }");
    }

    private void generateClassicHtml(StringBuilder html, Cv cv) {
        PersonalInfo info = cv.getPersonalInfo();
        html.append("<div class='header'>");
        html.append("<div class='name'>").append(escapeHtml(info.getName())).append("</div>");
        html.append("<div class='contact-info'>")
            .append(escapeHtml(info.getEmail())).append(" &bull; ")
            .append(escapeHtml(info.getPhone())).append(" &bull; ")
            .append(escapeHtml(info.getLocation()))
            .append("</div></div>");

        html.append("<div class='content-wrapper clearfix'>");
        
        // Sidebar
        html.append("<div class='sidebar'>");
        if (cv.getSkills() != null && !cv.getSkills().isEmpty()) {
            html.append("<div class='section-title' style='margin-top:0;'>Skills</div>");
            for (Skill s : cv.getSkills()) {
                html.append("<div class='text-sm mb-1'><strong>").append(escapeHtml(s.getName())).append("</strong>");
                if (s.getLevel() != null && !s.getLevel().name().isEmpty()) {
                    html.append(" <span class='text-gray'>(").append(s.getLevel().name()).append(")</span>");
                }
                html.append("</div>");
            }
        }
        if (cv.getEducations() != null && !cv.getEducations().isEmpty()) {
            html.append("<div class='section-title'>Education</div>");
            for (Education edu : cv.getEducations()) {
                html.append("<div class='mb-4'>");
                html.append("<div style='font-weight:bold;'>").append(escapeHtml(edu.getInstitution())).append("</div>");
                html.append("<div class='text-sm'>").append(escapeHtml(edu.getDegree())).append("</div>");
                html.append("<div class='text-gray text-sm'>").append(edu.getGraduationYear()).append("</div>");
                html.append("</div>");
            }
        }
        html.append("</div>");

        // Main
        html.append("<div class='main-content'>");
        if (info.getSummary() != null && !info.getSummary().isEmpty()) {
            html.append("<div class='section-title' style='margin-top:0;'>Professional Summary</div>");
            html.append("<div>").append(info.getSummary()).append("</div>");
        }
        if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
            html.append("<div class='section-title'>Experience</div>");
            for (Experience exp : cv.getExperiences()) {
                html.append("<div class='mb-4'>");
                html.append("<div class='clearfix'>");
                html.append("<span style='float:left;'><strong>").append(escapeHtml(exp.getRole())).append("</strong></span>");
                html.append("<span style='float:right;' class='text-gray text-sm'>").append(escapeHtml(exp.getStartDate())).append(" - ").append(escapeHtml(exp.getEndDate())).append("</span>");
                html.append("</div>");
                html.append("<div style='color: #4a5568;'>").append(escapeHtml(exp.getCompany())).append("</div>");
                html.append("<div class='mt-1'>").append(exp.getDescription()).append("</div>");
                html.append("</div>");
            }
        }
        if (cv.getProjects() != null && !cv.getProjects().isEmpty()) {
            html.append("<div class='section-title'>Projects</div>");
            for (Project p : cv.getProjects()) {
                html.append("<div class='mb-4'>");
                html.append("<div style='font-weight:bold;'>").append(escapeHtml(p.getName())).append("</div>");
                if (p.getUrl() != null && !p.getUrl().isEmpty()) {
                    html.append("<div style='color: #3182ce; font-size: 9pt;'>").append(escapeHtml(p.getUrl())).append("</div>");
                }
                html.append("<div class='mt-1'>").append(p.getDescription()).append("</div>");
                html.append("</div>");
            }
        }
        html.append("</div></div>");
    }

    private void appendModernStyles(StringBuilder html) {
        html.append(".modern-header { background-color: #2563eb; color: white; padding: 30px 20mm; margin-bottom: 20px; }");
        html.append(".modern-name { font-size: 30pt; font-weight: bold; margin-bottom: 8px; }");
        html.append(".modern-contact { font-size: 10pt; opacity: 0.9; }");
        html.append(".modern-body { padding: 0 20mm 20mm 20mm; }");
        html.append(".modern-section-title { font-size: 14pt; font-weight: bold; color: #1e40af; border-bottom: 2px solid #3b82f6; margin-bottom: 12px; margin-top: 25px; padding-bottom: 4px; text-transform: uppercase; }");
        html.append(".modern-card { background: #f8fafc; padding: 15px; border-left: 5px solid #3b82f6; margin-bottom: 15px; }");
    }

    private void generateModernHtml(StringBuilder html, Cv cv) {
        PersonalInfo info = cv.getPersonalInfo();
        html.append("<div class='modern-header'>");
        html.append("<div class='modern-name'>").append(escapeHtml(info.getName())).append("</div>");
        html.append("<div class='modern-contact'>").append(escapeHtml(info.getEmail())).append(" &bull; ").append(escapeHtml(info.getPhone())).append(" &bull; ").append(escapeHtml(info.getLocation())).append("</div>");
        html.append("</div>");

        html.append("<div class='modern-body'>");
        if (info.getSummary() != null && !info.getSummary().isEmpty()) {
            html.append("<div class='modern-section-title' style='margin-top:0;'>About Me</div>");
            html.append("<div class='modern-card'>").append(info.getSummary()).append("</div>");
        }

        html.append("<div class='clearfix'>");
        html.append("<div style='float:left; width:62%;'>");
        if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
            html.append("<div class='modern-section-title'>Experience</div>");
            for (Experience exp : cv.getExperiences()) {
                html.append("<div class='mb-4'>");
                html.append("<strong>").append(escapeHtml(exp.getRole())).append("</strong> <span style='color:#3b82f6;'>@ ").append(escapeHtml(exp.getCompany())).append("</span><br/>");
                html.append("<div class='text-gray text-sm mb-1'>").append(escapeHtml(exp.getStartDate())).append(" - ").append(escapeHtml(exp.getEndDate())).append("</div>");
                html.append("<div>").append(exp.getDescription()).append("</div>");
                html.append("</div>");
            }
        }
        html.append("</div>");

        html.append("<div style='float:right; width:33%;'>");
        if (cv.getSkills() != null && !cv.getSkills().isEmpty()) {
            html.append("<div class='modern-section-title'>Skills</div>");
            for (Skill s : cv.getSkills()) {
                html.append("<div style='background:#f1f5f9; display:inline-block; padding:3px 10px; border-radius:6px; margin:3px; font-size:9pt; border:1px solid #e2e8f0;'>")
                    .append(escapeHtml(s.getName())).append("</div>");
            }
        }
        if (cv.getEducations() != null && !cv.getEducations().isEmpty()) {
            html.append("<div class='modern-section-title'>Education</div>");
            for (Education edu : cv.getEducations()) {
                html.append("<div class='mb-4'>");
                html.append("<strong>").append(escapeHtml(edu.getInstitution())).append("</strong><br/>");
                html.append("<span class='text-sm'>").append(escapeHtml(edu.getDegree())).append("</span>");
                html.append("</div>");
            }
        }
        html.append("</div></div></div>");
    }

    private void appendAtsStyles(StringBuilder html) {
        html.append(".page { padding: 20mm; }");
        html.append(".ats-header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid #000; padding-bottom: 10px; }");
        html.append(".ats-name { font-size: 20pt; font-weight: bold; text-transform: uppercase; }");
        html.append(".ats-section-title { font-size: 11pt; font-weight: bold; border-bottom: 1px solid black; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; }");
    }

    private void generateAtsHtml(StringBuilder html, Cv cv) {
        PersonalInfo info = cv.getPersonalInfo();
        html.append("<div class='ats-header'>");
        html.append("<div class='ats-name'>").append(escapeHtml(info.getName())).append("</div>");
        html.append("<div>").append(escapeHtml(info.getEmail())).append(" | ").append(escapeHtml(info.getPhone())).append(" | ").append(escapeHtml(info.getLocation())).append("</div>");
        html.append("</div>");

        if (info.getSummary() != null && !info.getSummary().isEmpty()) {
            html.append("<div class='ats-section-title'>Professional Summary</div>");
            html.append("<div>").append(info.getSummary()).append("</div>");
        }

        if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
            html.append("<div class='ats-section-title'>Experience</div>");
            for (Experience exp : cv.getExperiences()) {
                html.append("<div class='mb-2'>");
                html.append("<div class='clearfix'>");
                html.append("<span style='float:left;'><strong>").append(escapeHtml(exp.getRole())).append("</strong></span>");
                html.append("<span style='float:right;'>").append(escapeHtml(exp.getStartDate())).append(" - ").append(escapeHtml(exp.getEndDate())).append("</span>");
                html.append("</div>");
                html.append("<div style='font-style:italic;'>").append(escapeHtml(exp.getCompany())).append("</div>");
                html.append("<div>").append(exp.getDescription()).append("</div>");
                html.append("</div>");
            }
        }

        if (cv.getEducations() != null && !cv.getEducations().isEmpty()) {
            html.append("<div class='ats-section-title'>Education</div>");
            for (Education edu : cv.getEducations()) {
                html.append("<div class='clearfix'>");
                html.append("<span style='float:left;'><strong>").append(escapeHtml(edu.getInstitution())).append("</strong></span>");
                html.append("<span style='float:right;'>").append(edu.getGraduationYear()).append("</span>");
                html.append("</div>");
                html.append("<div>").append(escapeHtml(edu.getDegree())).append("</div>");
            }
        }

        if (cv.getSkills() != null && !cv.getSkills().isEmpty()) {
            html.append("<div class='ats-section-title'>Skills</div>");
            html.append("<div>").append(cv.getSkills().stream().map(s -> escapeHtml(s.getName())).collect(Collectors.joining(", "))).append("</div>");
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}