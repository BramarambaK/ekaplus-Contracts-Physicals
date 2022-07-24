package com.eka.physicals.dto;

import java.math.BigDecimal;

import com.eka.physicals.enums.OperationType;

public class ContractItemEstimateDTO {

	private int secondaryCostId;
	private String internalAccrualId;
	private String costComponent;
	private String costType;
	private String cpName;
	private String rateType;
	private BigDecimal cost;
	private String costUnit;
	private BigDecimal fxToBase;
	private String comments;
	private OperationType operation;
	private String estimateFor;
	private String incExpense;

	public String getCostComponent() {
		return costComponent;
	}

	public void setCostComponent(String costComponent) {
		this.costComponent = costComponent;
	}

	public String getCostType() {
		return costType;
	}

	public void setCostType(String costType) {
		this.costType = costType;
	}

	public String getCpName() {
		return cpName;
	}

	public void setCpName(String cpName) {
		this.cpName = cpName;
	}

	public String getRateType() {
		return rateType;
	}

	public void setRateType(String rateType) {
		this.rateType = rateType;
	}

	public BigDecimal getCost() {
		return cost;
	}

	public void setCost(BigDecimal cost) {
		this.cost = cost;
	}

	public String getCostUnit() {
		return costUnit;
	}

	public void setCostUnit(String costUnit) {
		this.costUnit = costUnit;
	}

	public BigDecimal getFxToBase() {
		return fxToBase;
	}

	public void setFxToBase(BigDecimal fxToBase) {
		this.fxToBase = fxToBase;
	}

	public String getComments() {
		return comments;
	}

	public void setComments(String comments) {
		this.comments = comments;
	}

	public String getInternalAccrualId() {
		return internalAccrualId;
	}

	public void setInternalAccrualId(String internalAccrualId) {
		this.internalAccrualId = internalAccrualId;
	}

	public OperationType getOperation() {
		return operation;
	}

	public void setOperation(OperationType operation) {
		this.operation = operation;
	}

	public String getEstimateFor() {
		return estimateFor;
	}

	public void setEstimateFor(String estimateFor) {
		this.estimateFor = estimateFor;
	}

	public String getIncExpense() {
		return incExpense;
	}

	public void setIncExpense(String incExpense) {
		this.incExpense = incExpense;
	}

	public int getSecondaryCostId() {
		return secondaryCostId;
	}

	public void setSecondaryCostId(int secondaryCostId) {
		this.secondaryCostId = secondaryCostId;
	}

	public String getUniqueKey() {
		return this.costComponent;
	}
}
