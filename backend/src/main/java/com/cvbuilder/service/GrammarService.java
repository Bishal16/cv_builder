package com.cvbuilder.service;

import com.cvbuilder.dto.GrammarRequest;
import com.cvbuilder.dto.GrammarResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GrammarService {

    private final LlmClient llmClient;

    public GrammarResponse check(GrammarRequest request) {
        String stripped = request.getText()
                .replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("\\s+", " ")
                .trim();

        String prompt = """
            You are a meticulous professional proofreader.

            Proofread the text below. Fix spelling, grammar, punctuation, and clarity issues \
            while keeping the original meaning, tone, and language intact. Do not add new information.

            TEXT:
            %s

            Respond in EXACTLY this plain-text format (no markdown, no extra commentary):

            CORRECTED:
            <the full corrected text, on one or more lines, until the ISSUES: marker>
            ISSUES:
            ### <original phrase> :: <suggested replacement> :: <short explanation>
            ### <original phrase> :: <suggested replacement> :: <short explanation>

            Rules:
            - List one "### original :: suggestion :: explanation" line per distinct issue you fixed.
            - Keep each explanation short (a few words).
            - If there are no issues at all, output the corrected text (identical to the input) under CORRECTED: \
            and then output exactly "ISSUES:" with nothing after it.
            """.formatted(stripped);

        String raw = llmClient.complete(prompt, 1024);
        return parseResponse(raw);
    }

    private GrammarResponse parseResponse(String raw) {
        String correctedText = "";
        List<GrammarResponse.GrammarIssue> issues = new ArrayList<>();

        Matcher correctedMatcher = Pattern
                .compile("CORRECTED:\\s*(.*?)\\s*ISSUES:", Pattern.DOTALL)
                .matcher(raw);
        if (correctedMatcher.find()) {
            correctedText = correctedMatcher.group(1).strip();
        }

        // Issues section: everything after the ISSUES: marker
        String issuesBlock = "";
        Matcher issuesMatcher = Pattern
                .compile("ISSUES:\\s*(.*)", Pattern.DOTALL)
                .matcher(raw);
        if (issuesMatcher.find()) {
            issuesBlock = issuesMatcher.group(1);
        }

        Matcher itemMatcher = Pattern
                .compile("###\\s*(.+?)(?=###|$)", Pattern.DOTALL)
                .matcher(issuesBlock);
        while (itemMatcher.find()) {
            String block = itemMatcher.group(1).strip();
            if (block.isBlank()) continue;
            String[] parts = block.split("::", 3);
            String original = parts.length > 0 ? parts[0].strip() : "";
            String suggestion = parts.length > 1 ? parts[1].strip() : "";
            String explanation = parts.length > 2 ? parts[2].strip() : "";
            if (!original.isBlank() || !suggestion.isBlank()) {
                issues.add(new GrammarResponse.GrammarIssue(original, suggestion, explanation));
            }
        }

        // Defensive fallback: if we could not extract a corrected block, use the raw text.
        if (correctedText.isBlank()) {
            correctedText = raw.strip();
        }

        return new GrammarResponse(correctedText, issues);
    }
}
