package com.eka.physicalstrade.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class PricingAPIException extends RuntimeException {

	private static final long serialVersionUID = 1L;
	public static final String message = "Error in getting formula price";
	private int itemNo;

	public PricingAPIException() {
		super(message);
	}
	
	public PricingAPIException(int itemNo) {
		super(message);
		this.itemNo = itemNo;
	}

	public PricingAPIException(String message) {
		super(message);
	}
	
	public PricingAPIException(String message,int itemNo) {
		super(message);
		this.itemNo = itemNo;
	}

	public PricingAPIException(Throwable ex) {
		super(message, ex);
	}

	public int getItemNo() {
		return itemNo;
	}

	public void setItemNo(int itemNo) {
		this.itemNo = itemNo;
	}

}
