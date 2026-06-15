package com.cvbuilder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Single entry point for all LLM calls. The active provider is chosen by the
 * {@code llm.provider} property so every AI feature (suggestions, JD tailoring,
 * cover letters, grammar, resume import) can switch providers via config alone.
 *
 * Supported providers:
 *   - gemini   (default) — Google Gemini Flash, generous free tier
 *   - anthropic          — Claude (reuses the existing anthropic.api.key)
 *   - openai             — any OpenAI-compatible endpoint (Groq, OpenRouter, Ollama)
 */
@Component
public class LlmClient {

    @Value("${llm.provider:gemini}")
    private String provider;

    // ── Gemini ──
    @Value("${llm.gemini.api-key:${GEMINI_API_KEY:}}")
    private String geminiKey;
    @Value("${llm.gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    // ── Anthropic (reuses the existing property) ──
    @Value("${anthropic.api.key:}")
    private String anthropicKey;
    @Value("${llm.anthropic.model:claude-sonnet-4-6}")
    private String anthropicModel;

    // ── OpenAI-compatible (Groq / OpenRouter / Ollama) ──
    @Value("${llm.openai.base-url:}")
    private String openaiBaseUrl;
    @Value("${llm.openai.api-key:}")
    private String openaiKey;
    @Value("${llm.openai.model:}")
    private String openaiModel;

    private final RestClient restClient = RestClient.create();

    /** Send a single prompt and return the model's text. */
    public String complete(String prompt, int maxTokens) {
        String p = provider == null ? "gemini" : provider.toLowerCase().trim();
        return switch (p) {
            case "anthropic" -> anthropic(prompt, maxTokens);
            case "openai", "groq", "openrouter", "ollama" -> openAiCompatible(prompt, maxTokens);
            default -> gemini(prompt, maxTokens);
        };
    }

    /* ── Gemini ─────────────────────────────────────────────────────── */

    private String gemini(String prompt, int maxTokens) {
        if (geminiKey == null || geminiKey.isBlank()) {
            throw new IllegalStateException("AI features are not configured. Set GEMINI_API_KEY.");
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent";
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("maxOutputTokens", maxTokens)
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restClient.post()
                .uri(url)
                .header("x-goog-api-key", geminiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        return extractGemini(resp);
    }

    @SuppressWarnings("unchecked")
    private String extractGemini(Map<String, Object> resp) {
        if (resp == null) return "";
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) resp.get("candidates");
        if (candidates == null || candidates.isEmpty()) return "";
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return "";
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> part : parts) {
            Object t = part.get("text");
            if (t != null) sb.append(t);
        }
        return sb.toString();
    }

    /* ── Anthropic ──────────────────────────────────────────────────── */

    private String anthropic(String prompt, int maxTokens) {
        if (anthropicKey == null || anthropicKey.isBlank()) {
            throw new IllegalStateException("AI features are not configured. Set ANTHROPIC_API_KEY.");
        }
        Map<String, Object> body = Map.of(
                "model", anthropicModel,
                "max_tokens", maxTokens,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restClient.post()
                .uri("https://api.anthropic.com/v1/messages")
                .header("x-api-key", anthropicKey)
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (resp == null) return "";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) resp.get("content");
        if (content == null || content.isEmpty()) return "";
        return (String) content.get(0).getOrDefault("text", "");
    }

    /* ── OpenAI-compatible (Groq / OpenRouter / Ollama) ─────────────── */

    private String openAiCompatible(String prompt, int maxTokens) {
        if (openaiBaseUrl == null || openaiBaseUrl.isBlank() || openaiKey == null || openaiKey.isBlank()) {
            throw new IllegalStateException(
                    "AI features are not configured. Set LLM_OPENAI_BASE_URL and LLM_OPENAI_API_KEY.");
        }
        String base = openaiBaseUrl.endsWith("/")
                ? openaiBaseUrl.substring(0, openaiBaseUrl.length() - 1)
                : openaiBaseUrl;
        Map<String, Object> body = Map.of(
                "model", openaiModel,
                "max_tokens", maxTokens,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restClient.post()
                .uri(base + "/chat/completions")
                .header("Authorization", "Bearer " + openaiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (resp == null) return "";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices = (List<Map<String, Object>>) resp.get("choices");
        if (choices == null || choices.isEmpty()) return "";
        @SuppressWarnings("unchecked")
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        if (message == null) return "";
        Object c = message.get("content");
        return c == null ? "" : c.toString();
    }
}
