package com.cvbuilder.service;

import com.cvbuilder.dto.AiSuggestRequest;
import com.cvbuilder.dto.AiSuggestResponse;
import com.cvbuilder.dto.CoverLetterRequest;
import com.cvbuilder.dto.CoverLetterResponse;
import com.cvbuilder.dto.JdTailorRequest;
import com.cvbuilder.dto.JdTailorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final LlmClient llmClient;

    public AiSuggestResponse suggest(AiSuggestRequest request) {
        String prompt = buildPrompt(request);
        String rawText = llmClient.complete(prompt, 1024);
        List<String> suggestions = parseSuggestions(rawText);
        return new AiSuggestResponse(suggestions);
    }

    public JdTailorResponse tailorForJd(JdTailorRequest request) {
        String cvText = buildCvText(request);
        String prompt = """
            You are an expert ATS specialist and resume coach.

            Analyse the candidate's resume content against the job description below.

            RESUME:
            %s

            JOB DESCRIPTION:
            %s

            Return your response in EXACTLY this format (no extra text):

            MATCH_SCORE: <0-100 integer>

            PRESENT_KEYWORDS:
            <comma-separated list of important JD keywords/skills already in the resume>

            MISSING_KEYWORDS:
            <comma-separated list of important JD keywords/skills NOT in the resume>

            SUGGESTIONS:
            ### <One concrete suggestion to better align the resume with this JD>
            ### <Second concrete suggestion>
            ### <Third concrete suggestion>
            """.formatted(cvText, request.getJobDescription());

        String raw = llmClient.complete(prompt, 1024);
        return parseTailorResponse(raw);
    }

    public CoverLetterResponse generateCoverLetter(CoverLetterRequest request) {
        StringBuilder cv = new StringBuilder();
        if (request.getCandidateName() != null) cv.append("Name: ").append(request.getCandidateName()).append("\n");
        if (request.getCvSummary() != null && !request.getCvSummary().isBlank())
            cv.append("Summary: ").append(request.getCvSummary().replaceAll("<[^>]+>", " ")).append("\n");
        if (request.getSkills() != null && !request.getSkills().isEmpty())
            cv.append("Skills: ").append(String.join(", ", request.getSkills())).append("\n");
        if (request.getExperiences() != null) {
            for (CoverLetterRequest.ExperienceSnippet e : request.getExperiences()) {
                cv.append("- ").append(e.getRole()).append(" at ").append(e.getCompany());
                if (e.getDescription() != null)
                    cv.append(": ").append(e.getDescription().replaceAll("<[^>]+>", " "));
                cv.append("\n");
            }
        }

        String tone = switch (request.getTone() == null ? "professional" : request.getTone()) {
            case "enthusiastic" -> "warm and enthusiastic";
            case "concise" -> "concise and direct";
            default -> "professional and confident";
        };

        String prompt = """
            You are an expert career writer. Write a %s cover letter for this candidate.

            CANDIDATE RESUME:
            %s

            TARGET ROLE: %s
            TARGET COMPANY: %s

            JOB DESCRIPTION:
            %s

            Rules:
            - 3 to 4 short paragraphs, under 320 words total
            - Open with genuine interest in the specific role/company
            - Highlight 2-3 most relevant achievements from the resume
            - Connect the candidate's strengths to what the job description asks for
            - Close with a clear call to action
            - Plain text only — no placeholders like [Your Name] or [Company]; use the real values provided, and if a value is missing, write naturally around it
            - Do not invent facts not present in the resume

            Output ONLY the cover letter body text.
            """.formatted(
                tone,
                cv.toString().isBlank() ? "(not provided)" : cv.toString(),
                blankToNa(request.getRoleTitle()),
                blankToNa(request.getCompanyName()),
                request.getJobDescription() == null || request.getJobDescription().isBlank()
                        ? "(not provided)" : request.getJobDescription()
            );

        return new CoverLetterResponse(llmClient.complete(prompt, 1024).strip());
    }

    private String blankToNa(String s) {
        return (s == null || s.isBlank()) ? "(not specified)" : s;
    }

    private String buildCvText(JdTailorRequest req) {
        StringBuilder sb = new StringBuilder();
        if (req.getCvSummary() != null && !req.getCvSummary().isBlank()) {
            sb.append("Summary: ").append(req.getCvSummary().replaceAll("<[^>]+>", " ")).append("\n\n");
        }
        if (req.getSkills() != null && !req.getSkills().isEmpty()) {
            sb.append("Skills: ").append(String.join(", ", req.getSkills())).append("\n\n");
        }
        if (req.getExperiences() != null) {
            for (JdTailorRequest.ExperienceSnippet exp : req.getExperiences()) {
                sb.append(exp.getRole()).append(" at ").append(exp.getCompany()).append("\n");
                if (exp.getDescription() != null) {
                    sb.append(exp.getDescription().replaceAll("<[^>]+>", " ")).append("\n");
                }
                sb.append("\n");
            }
        }
        return sb.toString().trim();
    }

    private JdTailorResponse parseTailorResponse(String raw) {
        int matchScore = 0;
        List<String> presentKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        Matcher scoreMatcher = Pattern.compile("MATCH_SCORE:\\s*(\\d+)").matcher(raw);
        if (scoreMatcher.find()) {
            matchScore = Math.min(100, Math.max(0, Integer.parseInt(scoreMatcher.group(1))));
        }

        Matcher presentMatcher = Pattern.compile("PRESENT_KEYWORDS:\\s*\\n([^\n]+)").matcher(raw);
        if (presentMatcher.find()) {
            presentKeywords = Arrays.stream(presentMatcher.group(1).split(","))
                    .map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList());
        }

        Matcher missingMatcher = Pattern.compile("MISSING_KEYWORDS:\\s*\\n([^\n]+)").matcher(raw);
        if (missingMatcher.find()) {
            missingKeywords = Arrays.stream(missingMatcher.group(1).split(","))
                    .map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList());
        }

        suggestions = parseSuggestions(raw);

        return new JdTailorResponse(matchScore, missingKeywords, presentKeywords, suggestions);
    }

    private String buildPrompt(AiSuggestRequest req) {
        String stripped = req.getContent().replaceAll("<[^>]+>", " ").replaceAll("&nbsp;", " ").replaceAll("\\s+", " ").trim();

        return switch (req.getType()) {
            case "summary" -> """
                You are a professional CV writer. Rewrite the following professional summary into 3 distinct alternatives.
                Each version should be concise (3–5 sentences), start with a strong action or identity statement, \
                highlight unique value, and use plain text (no HTML).

                Current summary:
                %s

                Output exactly 3 alternatives, each starting on a new line preceded by "### ". \
                No other text before or after.
                """.formatted(stripped);

            case "experience" -> """
                You are a professional CV writer. Rewrite the following job description into 3 distinct alternatives.
                Each version should use 3–5 bullet points, start each bullet with a strong action verb, \
                include quantified impact where possible, and use plain text only — no HTML, no markdown headers.
                Context (role / company): %s

                Current description:
                %s

                Output exactly 3 alternatives, each starting on a new line preceded by "### ". \
                Use "•" for bullet points. No other text before or after.
                """.formatted(req.getContext() != null ? req.getContext() : "not provided", stripped);

            case "project" -> """
                You are a professional CV writer. Rewrite the following project description into 3 distinct alternatives.
                Each version should be 2–4 sentences, highlight technical achievement and impact, \
                and use plain text (no HTML).

                Current description:
                %s

                Output exactly 3 alternatives, each starting on a new line preceded by "### ". \
                No other text before or after.
                """.formatted(stripped);

            default -> throw new IllegalArgumentException("Unknown type: " + req.getType());
        };
    }

    private List<String> parseSuggestions(String raw) {
        List<String> results = new ArrayList<>();
        Matcher m = Pattern.compile("###\\s*(.+?)(?=###|$)", Pattern.DOTALL).matcher(raw);
        while (m.find()) {
            String block = m.group(1).strip();
            if (!block.isBlank()) {
                results.add(block);
            }
        }
        // Fallback: if parsing failed, return the entire text as one suggestion
        if (results.isEmpty() && !raw.isBlank()) {
            results.add(raw.strip());
        }
        return results;
    }
}
