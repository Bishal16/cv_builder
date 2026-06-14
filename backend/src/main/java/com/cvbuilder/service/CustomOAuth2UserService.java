package com.cvbuilder.service;

import com.cvbuilder.entity.User;
import com.cvbuilder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String providerId = oAuth2User.getName();

        String email = getAttrAsString(oAuth2User, "email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                new OAuth2Error("email_not_found"),
                "No public email found on your " + registrationId + " account. " +
                "Please make your email public in your account settings and try again."
            );
        }

        String firstName = extractFirstName(oAuth2User, registrationId);
        String lastName  = extractLastName(oAuth2User, registrationId);

        User user = userRepository.findByProviderAndProviderId(registrationId, providerId)
            .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

        if (user == null) {
            user = User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .provider(registrationId)
                .providerId(providerId)
                .emailVerified(true)
                .build();
        } else {
            if (user.getProviderId() == null) {
                user.setProvider(registrationId);
                user.setProviderId(providerId);
            }
            if (user.getFirstName() == null || user.getFirstName().isBlank()) {
                user.setFirstName(firstName);
            }
            if (user.getLastName() == null || user.getLastName().isBlank()) {
                user.setLastName(lastName);
            }
        }

        userRepository.save(user);
        return oAuth2User;
    }

    private String extractFirstName(OAuth2User user, String registrationId) {
        if ("google".equals(registrationId)) {
            String v = getAttrAsString(user, "given_name");
            return v != null ? v : "";
        }
        String name = getAttrAsString(user, "name");
        if (name == null || name.isBlank()) {
            name = getAttrAsString(user, "login");
        }
        if (name != null && name.contains(" ")) {
            return name.substring(0, name.indexOf(' '));
        }
        return name != null ? name : "";
    }

    private String extractLastName(OAuth2User user, String registrationId) {
        if ("google".equals(registrationId)) {
            String v = getAttrAsString(user, "family_name");
            return v != null ? v : "";
        }
        String name = getAttrAsString(user, "name");
        if (name != null && name.contains(" ")) {
            return name.substring(name.indexOf(' ') + 1);
        }
        return "";
    }

    private String getAttrAsString(OAuth2User user, String key) {
        Object v = user.getAttribute(key);
        return v != null ? v.toString() : null;
    }
}
