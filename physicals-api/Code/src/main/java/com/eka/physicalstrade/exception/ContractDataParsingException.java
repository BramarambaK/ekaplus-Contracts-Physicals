package com.eka.physicalstrade.exception;

public class ContractDataParsingException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private static final String MESSAGE = "Contract data parsing exception";

	public ContractDataParsingException() {
		super(MESSAGE);
	}

	public ContractDataParsingException(Throwable e) {
		super(MESSAGE, e);
	}

}
