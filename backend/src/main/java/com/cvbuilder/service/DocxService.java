package com.cvbuilder.service;

import com.cvbuilder.entity.*;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.repository.CvRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Produces a clean, single-column, ATS-grade .docx from the CV model.
 * Deliberately plain (Calibri, no tables/columns/images) so applicant
 * tracking systems parse it reliably — not a visual clone of the templates.
 */
@Service
@RequiredArgsConstructor
public class DocxService {

    private final CvRepository cvRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public byte[] generateDocx(UUID cvId) {
        Cv cv = cvRepository.findByIdAndUser(cvId, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));

        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            setDefaultMargins(doc);

            PersonalInfo pi = cv.getPersonalInfo();
            if (pi != null) {
                writeHeader(doc, pi);
            }

            if (pi != null && notBlank(pi.getSummary())) {
                writeSectionTitle(doc, "Summary");
                for (Line line : htmlToLines(pi.getSummary())) {
                    writeParagraph(doc, line.text, line.bullet);
                }
            }

            writeExperience(doc, cv);
            writeEducation(doc, cv);
            writeSkills(doc, cv);
            writeProjects(doc, cv);
            writeCertifications(doc, cv);
            writeLanguages(doc, cv);
            writeAwards(doc, cv);

            doc.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate DOCX", e);
        }
    }

    /* ── Sections ─────────────────────────────────────────────────────── */

    private void writeHeader(XWPFDocument doc, PersonalInfo pi) {
        XWPFParagraph name = doc.createParagraph();
        name.setAlignment(ParagraphAlignment.CENTER);
        name.setSpacingAfter(40);
        XWPFRun nameRun = name.createRun();
        nameRun.setText(notBlank(pi.getName()) ? pi.getName() : "Your Name");
        nameRun.setBold(true);
        nameRun.setFontSize(20);
        nameRun.setFontFamily("Calibri");

        List<String> contact = new ArrayList<>();
        if (notBlank(pi.getEmail())) contact.add(pi.getEmail());
        if (notBlank(pi.getPhone())) contact.add(pi.getPhone());
        if (notBlank(pi.getLocation())) contact.add(pi.getLocation());
        if (notBlank(pi.getLinkedinUrl())) contact.add(pi.getLinkedinUrl());
        if (notBlank(pi.getGithubUrl())) contact.add(pi.getGithubUrl());

        if (!contact.isEmpty()) {
            XWPFParagraph c = doc.createParagraph();
            c.setAlignment(ParagraphAlignment.CENTER);
            c.setSpacingAfter(120);
            XWPFRun cr = c.createRun();
            cr.setText(String.join("  |  ", contact));
            cr.setFontSize(10);
            cr.setFontFamily("Calibri");
            cr.setColor("444444");
        }
    }

    private void writeExperience(XWPFDocument doc, Cv cv) {
        if (cv.getExperiences().isEmpty()) return;
        writeSectionTitle(doc, "Experience");
        for (Experience e : cv.getExperiences()) {
            XWPFParagraph head = doc.createParagraph();
            head.setSpacingBefore(80);
            head.setSpacingAfter(0);
            XWPFRun role = head.createRun();
            role.setBold(true);
            role.setFontSize(11);
            role.setFontFamily("Calibri");
            String roleCompany = joinNonBlank(" — ", e.getRole(), e.getCompany());
            role.setText(roleCompany);

            String dates = joinNonBlank(" – ", e.getStartDate(), e.getEndDate());
            if (notBlank(dates)) {
                XWPFRun d = head.createRun();
                d.setText("    " + dates);
                d.setItalic(true);
                d.setFontSize(10);
                d.setColor("666666");
                d.setFontFamily("Calibri");
            }
            for (Line line : htmlToLines(e.getDescription())) {
                writeParagraph(doc, line.text, line.bullet);
            }
        }
    }

    private void writeEducation(XWPFDocument doc, Cv cv) {
        if (cv.getEducations().isEmpty()) return;
        writeSectionTitle(doc, "Education");
        for (Education e : cv.getEducations()) {
            XWPFParagraph p = doc.createParagraph();
            p.setSpacingBefore(60);
            p.setSpacingAfter(0);
            XWPFRun r = p.createRun();
            r.setBold(true);
            r.setFontSize(11);
            r.setFontFamily("Calibri");
            r.setText(joinNonBlank(", ", e.getDegree(), e.getField()));

            XWPFParagraph sub = doc.createParagraph();
            XWPFRun sr = sub.createRun();
            sr.setFontSize(10);
            sr.setColor("444444");
            sr.setFontFamily("Calibri");
            String inst = e.getInstitution() == null ? "" : e.getInstitution();
            String year = e.getGraduationYear() != null ? String.valueOf(e.getGraduationYear()) : "";
            sr.setText(joinNonBlank("  ·  ", inst, year));
        }
    }

    private void writeSkills(XWPFDocument doc, Cv cv) {
        if (cv.getSkills().isEmpty()) return;
        writeSectionTitle(doc, "Skills");
        String csv = cv.getSkills().stream()
                .map(Skill::getName)
                .filter(this::notBlank)
                .collect(Collectors.joining(", "));
        writeParagraph(doc, csv, false);
    }

    private void writeProjects(XWPFDocument doc, Cv cv) {
        if (cv.getProjects().isEmpty()) return;
        writeSectionTitle(doc, "Projects");
        for (Project p : cv.getProjects()) {
            XWPFParagraph head = doc.createParagraph();
            head.setSpacingBefore(60);
            head.setSpacingAfter(0);
            XWPFRun r = head.createRun();
            r.setBold(true);
            r.setFontSize(11);
            r.setFontFamily("Calibri");
            r.setText(p.getName() == null ? "" : p.getName());
            if (notBlank(p.getUrl())) {
                XWPFRun u = head.createRun();
                u.setText("    " + p.getUrl());
                u.setItalic(true);
                u.setFontSize(9);
                u.setColor("666666");
                u.setFontFamily("Calibri");
            }
            for (Line line : htmlToLines(p.getDescription())) {
                writeParagraph(doc, line.text, line.bullet);
            }
        }
    }

    private void writeCertifications(XWPFDocument doc, Cv cv) {
        if (cv.getCertifications().isEmpty()) return;
        writeSectionTitle(doc, "Certifications");
        for (Certification c : cv.getCertifications()) {
            String dates = joinNonBlank(" – ", c.getIssueDate(), c.getExpiryDate());
            String text = joinNonBlank(" — ", c.getName(), c.getIssuer());
            if (notBlank(dates)) text = text + " (" + dates + ")";
            writeParagraph(doc, text, true);
        }
    }

    private void writeLanguages(XWPFDocument doc, Cv cv) {
        if (cv.getLanguages().isEmpty()) return;
        writeSectionTitle(doc, "Languages");
        String csv = cv.getLanguages().stream()
                .map(l -> notBlank(l.getProficiency()) ? l.getName() + " (" + l.getProficiency() + ")" : l.getName())
                .filter(this::notBlank)
                .collect(Collectors.joining(", "));
        writeParagraph(doc, csv, false);
    }

    private void writeAwards(XWPFDocument doc, Cv cv) {
        if (cv.getAwards().isEmpty()) return;
        writeSectionTitle(doc, "Awards");
        for (Award a : cv.getAwards()) {
            String text = joinNonBlank(" — ", a.getTitle(), a.getIssuer());
            if (notBlank(a.getDate())) text = text + " (" + a.getDate() + ")";
            writeParagraph(doc, text, true);
            if (notBlank(a.getDescription())) {
                for (Line line : htmlToLines(a.getDescription())) {
                    writeParagraph(doc, line.text, line.bullet);
                }
            }
        }
    }

    /* ── Primitives ───────────────────────────────────────────────────── */

    private void writeSectionTitle(XWPFDocument doc, String title) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(200);
        p.setSpacingAfter(40);
        p.setBorderBottom(Borders.SINGLE);
        XWPFRun r = p.createRun();
        r.setText(title.toUpperCase());
        r.setBold(true);
        r.setFontSize(12);
        r.setFontFamily("Calibri");
        r.setColor("222222");
    }

    private void writeParagraph(XWPFDocument doc, String text, boolean bullet) {
        if (!notBlank(text)) return;
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingAfter(20);
        if (bullet) {
            p.setIndentationLeft(360);
            p.setIndentationHanging(180);
        }
        XWPFRun r = p.createRun();
        r.setText((bullet ? "•  " : "") + text);
        r.setFontSize(10);
        r.setFontFamily("Calibri");
        r.setColor("333333");
    }

    private void setDefaultMargins(XWPFDocument doc) {
        var sectPr = doc.getDocument().getBody().addNewSectPr();
        var pgMar = sectPr.addNewPgMar();
        BigInteger margin = BigInteger.valueOf(1080); // ~0.75 inch
        pgMar.setTop(margin);
        pgMar.setBottom(margin);
        pgMar.setLeft(margin);
        pgMar.setRight(margin);
    }

    /* ── HTML helpers ─────────────────────────────────────────────────── */

    private record Line(String text, boolean bullet) {}

    /**
     * Convert react-quill HTML into a list of plain-text lines, treating
     * &lt;li&gt; as bullets and &lt;p&gt;/&lt;br&gt; as line breaks.
     */
    private List<Line> htmlToLines(String html) {
        List<Line> lines = new ArrayList<>();
        if (!notBlank(html)) return lines;

        // Split into list-items first (bullets)
        String working = html.replaceAll("(?i)</p>", "\n")
                .replaceAll("(?i)<br\\s*/?>", "\n");

        java.util.regex.Matcher li = java.util.regex.Pattern
                .compile("(?is)<li[^>]*>(.*?)</li>").matcher(working);
        StringBuilder nonList = new StringBuilder(working);
        boolean anyBullet = false;
        while (li.find()) {
            anyBullet = true;
            String t = stripTags(li.group(1));
            if (notBlank(t)) lines.add(new Line(t, true));
        }

        if (anyBullet) return lines;

        // No bullets — split the stripped text on newlines into paragraphs
        for (String part : stripTags(nonList.toString()).split("\n")) {
            String t = part.strip();
            if (notBlank(t)) lines.add(new Line(t, false));
        }
        return lines;
    }

    private String stripTags(String s) {
        return s.replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replaceAll("[ \\t]+", " ")
                .strip();
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private String joinNonBlank(String sep, String... parts) {
        return java.util.Arrays.stream(parts)
                .filter(this::notBlank)
                .collect(Collectors.joining(sep));
    }
}
