package com.eka.physicals.dto;

import java.util.Map;

public class IntraCompantDealKeyMap {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Map<String, String> intraCompanyReqKeyValuesOnCreate = null;
	private Map<String, String> intraCompanyReqKeyValuesOnModify = null;
	private Map<String, String> intraCompanyReqKeyValuesOnDelete = null;
	private String intraCompString;

	public Map<String, String> getIntraCompanyReqKeyValuesOnCreate() {
		return intraCompanyReqKeyValuesOnCreate;
	}

	public void setIntraCompanyReqKeyValuesOnCreate(
			Map<String, String> intraCompanyReqKeyValuesOnCreate) {
		this.intraCompanyReqKeyValuesOnCreate = intraCompanyReqKeyValuesOnCreate;
	}

	public Map<String, String> getIntraCompanyReqKeyValuesOnModify() {
		return intraCompanyReqKeyValuesOnModify;
	}

	public void setIntraCompanyReqKeyValuesOnModify(
			Map<String, String> intraCompanyReqKeyValuesOnModify) {
		this.intraCompanyReqKeyValuesOnModify = intraCompanyReqKeyValuesOnModify;
	}

	public Map<String, String> getIntraCompanyReqKeyValuesOnDelete() {
		return intraCompanyReqKeyValuesOnDelete;
	}

	public void setIntraCompanyReqKeyValuesOnDelete(
			Map<String, String> intraCompanyReqKeyValuesOnDelete) {
		this.intraCompanyReqKeyValuesOnDelete = intraCompanyReqKeyValuesOnDelete;
	}

	public String getIntraCompString() {
		return intraCompString;
	}

	public void setIntraCompString(String intraCompString) {
		this.intraCompString = intraCompString;
	}
}
