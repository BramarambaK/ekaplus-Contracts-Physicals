package com.eka.physicalstrade.exception;

public class DuplicateRecordException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private static final String DUPLICATE_RECORD_FOUND = "Duplicate record found for contract";

	public DuplicateRecordException() {
		super(DUPLICATE_RECORD_FOUND);
	}

	public DuplicateRecordException(String message) {
		super(message);
	}

}
