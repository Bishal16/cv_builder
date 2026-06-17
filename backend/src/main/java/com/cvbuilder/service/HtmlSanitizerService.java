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
                    .toFactory())
            // Inline styles from the rich-text editor (font size + colors). Uses
            // OWASP's default CSS schema — a curated safe set that allows color
            // (incl. rgb()), font-size, etc. and strips anything dangerous. So
            // size/color survive and render in the preview + PDF.
            .and(new HtmlPolicyBuilder()
                    .allowElements("span", "p", "li", "ul", "ol", "strong", "em", "u", "br")
                    .allowStyling()
                    .toFactory());

    public String sanitize(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        return POLICY.sanitize(html);
    }
}
