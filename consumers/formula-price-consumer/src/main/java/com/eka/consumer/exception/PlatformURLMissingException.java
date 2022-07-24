package com.eka.consumer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class PlatformURLMissingException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String message = "Platform URL missing for tenant - ";

	public PlatformURLMissingException(String tenant) {
		super(message + tenant);
	}

	public PlatformURLMissingException(String tenant, Throwable ex) {
		super(message + tenant, ex);
	}

}
