package com.cvbuilder.exception;

/** Thrown when an unverified account attempts to log in. The client should
 *  prompt for the OTP that was (re)sent to the user's email. */
public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
