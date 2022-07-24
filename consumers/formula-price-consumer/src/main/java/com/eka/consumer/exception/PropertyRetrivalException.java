package com.eka.consumer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class PropertyRetrivalException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String message = "Error in getting property : ";

	public PropertyRetrivalException(String propertyURL) {
		super(message + propertyURL);
	}

	public PropertyRetrivalException(String propertyURL, Throwable ex) {
		super(message + propertyURL, ex);
	}

}
