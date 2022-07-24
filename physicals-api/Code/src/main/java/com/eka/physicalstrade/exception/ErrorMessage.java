package com.eka.physicalstrade.exception;

public class ErrorMessage {
	private int code;
	private String description;
	private Object stackTrace;

	public ErrorMessage(int message, String details) {
		super();
		this.code = message;
		this.description = details;
	}

	public ErrorMessage(int message, String details, Object stackTrace) {
		super();
		this.code = message;
		this.description = details;
		this.stackTrace = stackTrace;
	}

	public ErrorMessage() {
		super();
	}

	public int getCode() {
		return code;
	}

	public void setCode(int message) {
		this.code = message;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String details) {
		this.description = details;
	}

	public Object getStackTrace() {
		return stackTrace;
	}

	public void setStackTrace(Object stackTrace) {
		this.stackTrace = stackTrace;
	}

}
