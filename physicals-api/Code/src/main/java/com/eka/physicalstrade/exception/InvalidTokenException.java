package com.eka.physicalstrade.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.UNAUTHORIZED, reason = "Your provided token information expired or not exists.")
public class InvalidTokenException extends RuntimeException {

	private static final long serialVersionUID = 1L;
	private static final String message = "Your provided token information expired or not exists.";

	public InvalidTokenException() {
		super(message);
	}

	public InvalidTokenException(Throwable ex) {
		super(message, ex);
	}

}
