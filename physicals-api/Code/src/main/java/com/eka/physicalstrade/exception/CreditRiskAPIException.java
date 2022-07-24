package com.eka.physicalstrade.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class CreditRiskAPIException extends RuntimeException {

	private static final long serialVersionUID = 1L;
	public static final String message = "Error in checking credit check for CP - ";
	private String cpName;

	public CreditRiskAPIException() {
		super(message);
	}

	public CreditRiskAPIException(String cpName) {
		super(message + cpName);
		this.cpName = cpName;
	}

	public CreditRiskAPIException(String message, String cpName) {
		super(message);
		this.cpName = cpName;
	}

	public CreditRiskAPIException(Throwable ex) {
		super(message, ex);
	}

	public String getCpName() {
		return cpName;
	}

	public void setCpName(String cpName) {
		this.cpName = cpName;
	}

}
