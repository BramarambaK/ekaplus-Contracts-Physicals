package com.eka.physicalstrade.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class CTRMRestTemplateException extends RuntimeException {

	private static final long serialVersionUID = 1L;
	public static final String message = "Error in CTRM Api";
	private int itemNo;

	public CTRMRestTemplateException() {
		super(message);
	}
	
	public CTRMRestTemplateException(int itemNo) {
		super(message);
		this.itemNo = itemNo;
	}

	public CTRMRestTemplateException(String message) {
		super(message);
	}
	
	public CTRMRestTemplateException(String message,int itemNo) {
		super(message);
		this.itemNo = itemNo;
	}

	public CTRMRestTemplateException(Throwable ex) {
		super(message, ex);
	}

	public int getItemNo() {
		return itemNo;
	}

	public void setItemNo(int itemNo) {
		this.itemNo = itemNo;
	}

}
