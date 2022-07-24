package com.eka.consumer.exception;

public class CollectionUpdateFailureException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private static final String MESSAGE = "Formula Price Collection Update failed";

	public CollectionUpdateFailureException() {
		super(MESSAGE);
	}

	public CollectionUpdateFailureException(String message) {
		super(message);
	}

	public CollectionUpdateFailureException(String message, Throwable exp) {
		super(message, exp);
	}

	public CollectionUpdateFailureException(Throwable throwable) {
		super(throwable);
	}
}
