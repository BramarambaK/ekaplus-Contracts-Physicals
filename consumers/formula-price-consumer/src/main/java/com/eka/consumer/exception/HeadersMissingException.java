package com.eka.consumer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class HeadersMissingException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String message = "Headers missing for ";

	public HeadersMissingException(String propertyName) {
		super(message + propertyName);
	}

	public HeadersMissingException(String propertyName, Throwable ex) {
		super(message + propertyName, ex);
	}

}
