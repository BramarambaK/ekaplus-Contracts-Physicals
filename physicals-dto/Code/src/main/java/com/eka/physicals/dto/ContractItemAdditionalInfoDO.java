package com.eka.physicals.dto;

import java.util.Date;

public class ContractItemAdditionalInfoDO {

	private ContractPricingDetailsDTO pricing;
	public Date lycanStartDate;
	public Date lycanEndDate;
	private String inspectionCompany;

	public Date getLycanStartDate() {
		return lycanStartDate;
	}

	public void setLycanStartDate(Date lycanStartDate) {
		this.lycanStartDate = lycanStartDate;
	}

	public Date getLycanEndDate() {
		return lycanEndDate;
	}

	public void setLycanEndDate(Date lycanEndDate) {
		this.lycanEndDate = lycanEndDate;
	}

	public String getInspectionCompany() {
		return inspectionCompany;
	}

	public void setInspectionCompany(String inspectionCompany) {
		this.inspectionCompany = inspectionCompany;
	}

	public ContractPricingDetailsDTO getPricing() {
		return pricing;
	}

	public void setPricing(ContractPricingDetailsDTO pricing) {
		this.pricing = pricing;
	}
}
