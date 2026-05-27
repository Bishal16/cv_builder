package com.cvbuilder.service;

import com.cvbuilder.entity.User;
import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.repository.CvRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.Media;
import com.microsoft.playwright.options.WaitUntilState;
import java.util.UUID;

@Service
public class PdfService {

    private static final Logger log = LoggerFactory.getLogger(PdfService.class);

    private final CvRepository cvRepository;
    private final String frontendBaseUrl;

    public PdfService(
            CvRepository cvRepository,
            @Value("${cvbuilder.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.cvRepository = cvRepository;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public byte[] generatePdf(UUID cvId, String jwtToken) {
        // Verify the user owns this CV before launching the browser.
        cvRepository.findByIdAndUser(cvId, getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found or access denied"));

        String printUrl = buildPrintUrl(cvId);
        log.info("Generating PDF for CV {} via {}", cvId, printUrl);

        try (Playwright playwright = Playwright.create()) {
            BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                    .setHeadless(true);

            try (Browser browser = playwright.chromium().launch(launchOptions)) {
                Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
                        .setViewportSize(794, 1123)
                        .setDeviceScaleFactor(1.0);

                try (BrowserContext context = browser.newContext(contextOptions)) {

                    // Inject the JWT into the headless browser's localStorage before any
                    // page script runs. This lets the Zustand authStore hydrate with a
                    // valid token so CvPrintView can fetch the CV from the API.
                    if (jwtToken != null) {
                        String authStorageValue = String.format(
                                "{\"state\":{\"token\":\"%s\",\"isAuthenticated\":true,\"user\":null},\"version\":0}",
                                jwtToken
                        );
                        // addInitScript runs before page scripts — guaranteed before Zustand reads localStorage.
                        context.addInitScript(
                                "localStorage.setItem('auth-storage', '" + authStorageValue + "')"
                        );
                    }

                    Page page = context.newPage();
                    page.navigate(printUrl, new Page.NavigateOptions()
                            .setWaitUntil(WaitUntilState.NETWORKIDLE));

                    // Wait for CvPrintView to signal it has finished loading (data-print-ready="true").
                    page.waitForSelector("[data-print-ready='true']",
                            new Page.WaitForSelectorOptions().setTimeout(15_000));

                    page.emulateMedia(new Page.EmulateMediaOptions().setMedia(Media.SCREEN));
                    page.evaluate("() => document.fonts && document.fonts.ready");

                    Margin margins = new Margin()
                            .setTop("0")
                            .setRight("0")
                            .setBottom("0")
                            .setLeft("0");

                    Page.PdfOptions pdfOptions = new Page.PdfOptions()
                            .setFormat("A4")
                            .setPrintBackground(true)
                            .setMargin(margins)
                            .setPreferCSSPageSize(true);

                    return page.pdf(pdfOptions);
                }
            }
        } catch (PlaywrightException e) {
            throw new RuntimeException(
                    "Failed to generate PDF. Ensure the frontend is reachable at "
                            + frontendBaseUrl
                            + " and Playwright/Chromium is installed.",
                    e
            );
        }
    }

    private String buildPrintUrl(UUID cvId) {
        String base = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
        // Must match the React Router route definition: /print/:id
        return base + "/print/" + cvId;
    }
}
