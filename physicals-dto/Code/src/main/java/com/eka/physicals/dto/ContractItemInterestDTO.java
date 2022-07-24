package com.eka.physicals.dto;

public class ContractItemInterestDTO {

	private String physicalItemInterestId;
	// late payment
	private String interestRateType;
	private String variableType;
	private String variableTypeText;
	private double interestRate;
	// value Y or N
	private String isCompounding;
	private String frequency;

	public String getInterestRateType() {
		return interestRateType;
	}

	public void setInterestRateType(String interestRateType) {
		this.interestRateType = interestRateType;
	}

	public String getVariableType() {
		return variableType;
	}

	public void setVariableType(String variableType) {
		this.variableType = variableType;
	}

	public String getVariableTypeText() {
		return variableTypeText;
	}

	public void setVariableTypeText(String variableTypeText) {
		this.variableTypeText = variableTypeText;
	}

	public double getInterestRate() {
		return interestRate;
	}

	public void setInterestRate(double interestRate) {
		this.interestRate = interestRate;
	}

	public String getIsCompounding() {
		return isCompounding;
	}

	public void setIsCompounding(String isCompounding) {
		this.isCompounding = isCompounding;
	}

	public String getFrequency() {
		return frequency;
	}

	public void setFrequency(String frequency) {
		this.frequency = frequency;
	}

	public String getPhysicalItemInterestId() {
		return physicalItemInterestId;
	}

	public void setPhysicalItemInterestId(String physicalItemInterestId) {
		this.physicalItemInterestId = physicalItemInterestId;
	}

}
