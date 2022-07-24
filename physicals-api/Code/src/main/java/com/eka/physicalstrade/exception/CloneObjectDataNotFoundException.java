package com.eka.physicalstrade.exception;

public class CloneObjectDataNotFoundException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private static final String OBJECT_NOT_FOUND = "Object data not found while cloning for ";

	public CloneObjectDataNotFoundException(String objectName) {
		super(OBJECT_NOT_FOUND + objectName);
	}

}
