package com.eka.physicalstrade.dataobject;

import java.util.List;

public class APIResponse {

	private String status = "success";
	private ContractDataResponse data;
	private List<String> errors;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public ContractDataResponse getData() {
		return data;
	}

	public void setData(ContractDataResponse data) {
		this.data = data;
	}

	public List<String> getErrors() {
		return errors;
	}

	public void setErrors(List<String> errors) {
		this.errors = errors;
	}

}
