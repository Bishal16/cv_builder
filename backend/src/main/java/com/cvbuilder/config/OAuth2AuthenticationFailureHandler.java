package com.cvbuilder.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${cvbuilder.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        String errorCode = "oauth_error";

        if (exception instanceof OAuth2AuthenticationException oauthEx) {
            String code = oauthEx.getError().getErrorCode();
            if ("email_not_found".equals(code) || "access_denied".equals(code)) {
                errorCode = code;
            }
        }

        String baseUrl = resolveFrontendBaseUrl(request);

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        String targetUrl = UriComponentsBuilder.fromUriString(baseUrl + "/auth")
            .queryParam("error", errorCode)
            .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /** Redirect back to the origin the user started from, falling back to the configured URL. */
    private String resolveFrontendBaseUrl(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object origin = session.getAttribute(OAuth2OriginCapturingFilter.SESSION_ATTR);
            if (origin instanceof String s && !s.isBlank()) {
                return s;
            }
        }
        return frontendBaseUrl;
    }
}
