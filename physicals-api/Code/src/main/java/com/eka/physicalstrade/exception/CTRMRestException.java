package com.eka.physicalstrade.exception;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.eka.physicalstrade.error.ConnectError;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CTRMRestException extends Exception{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private List<ConnectError> errors;

	public CTRMRestException() {
		super();
	}

	public CTRMRestException(List<ConnectError> errorResponce,
			String errorLocalizedMessage) {
		super(errorLocalizedMessage);
		this.setErrors(errorResponce);
	}

	public CTRMRestException(String message, Throwable cause) {
		super(message, cause);
	}

	public CTRMRestException(String message) {
		super(message);
	}

	public CTRMRestException(Throwable cause) {
		super(cause);
	}

	public CTRMRestException(List<ConnectError> errors2) {
		// TODO Auto-generated constructor stub
		this.setErrors(errors2);
	}

	public List<ConnectError> getErrors() {
		return errors;
	}

	public void setErrors(List<ConnectError> errors) {
		this.errors = errors;
	}


}
