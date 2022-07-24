package com.eka.physicalstrade.exception;

public class ContractOperationNotAllowed extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private static final String CONTRACT_OPT_NOT_ALLOWED = "Second Leg Intercompany Contract not applicable for modification/clone";

	public ContractOperationNotAllowed() {
		super(CONTRACT_OPT_NOT_ALLOWED);
	}

	public ContractOperationNotAllowed(String message) {
		super(message);
	}

}
