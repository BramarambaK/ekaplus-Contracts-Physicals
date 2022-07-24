package com.eka.physicalstrade.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String message = "Bad request. Please check the input";

	public BadRequestException() {
		super();
	}

	public BadRequestException(Throwable ex) {
		super(message, ex);
	}

	public String getMessage() {
		return message;
	}

}
