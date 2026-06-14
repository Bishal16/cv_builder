package com.cvbuilder.service;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.stereotype.Service;

@Service
public class HtmlSanitizerService {

    private static final PolicyFactory POLICY = Sanitizers.FORMATTING
            .and(Sanitizers.BLOCKS)
            .and(new HtmlPolicyBuilder()
                    .allowElements("a")
                    .allowUrlProtocols("http", "https")
                    .allowAttributes("href").onElements("a")
                    .toFactory());

    public String sanitize(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        return POLICY.sanitize(html);
    }
}
