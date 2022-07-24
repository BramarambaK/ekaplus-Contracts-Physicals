package com.eka.physicalstrade.exception;

public class ContractNotFoundException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private static final String CONTRACT_NOT_FOUND = "Contract not found in system";

	public ContractNotFoundException() {
		super(CONTRACT_NOT_FOUND);
	}

	public ContractNotFoundException(String message) {
		super(message);
	}

}
