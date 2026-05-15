package com.cvbuilder.service;

import com.cvbuilder.exception.ResourceNotFoundException;
import com.cvbuilder.repository.CvRepository;
import org.springframework.beans.factory.annotation.Value;
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

    private final CvRepository cvRepository;
    private final String frontendBaseUrl;

    public PdfService(
            CvRepository cvRepository,
            @Value("${cvbuilder.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.cvRepository = cvRepository;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public byte[] generatePdf(UUID cvId) {
        // Fetch fresh from DB to avoid any persistence context issues
        cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found with id: " + cvId));

        String printUrl = buildPrintUrl(cvId);
        
        try (Playwright playwright = Playwright.create()) {
            BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                    .setHeadless(true);
            try (Browser browser = playwright.chromium().launch(launchOptions)) {
                Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
                        .setViewportSize(794, 1123)
                        .setDeviceScaleFactor(1.0);
                try (BrowserContext context = browser.newContext(contextOptions)) {
                    Page page = context.newPage();
                    page.navigate(printUrl, new Page.NavigateOptions()
                            .setWaitUntil(WaitUntilState.NETWORKIDLE));
                    page.waitForSelector("[data-print-ready='true']");
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
                    "Failed to generate PDF with Chromium. Ensure the frontend is reachable at "
                            + frontendBaseUrl
                            + " and Playwright browsers are installed: mvn -q org.codehaus.mojo:exec-maven-plugin:3.1.0:java -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args=\"install chromium\"",
                    e
            );
        }
    }

    private String buildPrintUrl(UUID cvId) {
        String baseUrl = frontendBaseUrl;
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + "/?print=1&cvId=" + cvId;
    }
}
