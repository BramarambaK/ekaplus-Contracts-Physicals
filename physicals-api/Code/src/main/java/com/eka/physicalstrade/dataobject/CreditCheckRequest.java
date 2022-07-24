package com.eka.physicalstrade.dataobject;

import java.util.Date;
import java.util.List;

public class CreditCheckRequest {

	private String entityRefNo;
	private String requestRefNo;
	private String counterParty;
	private String paymentTerm;
	private String contractType;
	private String decisionRefNo;
	private String eventName;
	private String operationType;
	private List<CreditCheckItemDetail> itemDetails;

	public String getEntityRefNo() {
		return entityRefNo;
	}

	public void setEntityRefNo(String entityRefNo) {
		this.entityRefNo = entityRefNo;
	}

	public String getRequestRefNo() {
		return requestRefNo;
	}

	public void setRequestRefNo(String requestRefNo) {
		this.requestRefNo = requestRefNo;
	}

	public String getCounterParty() {
		return counterParty;
	}

	public void setCounterParty(String counterParty) {
		this.counterParty = counterParty;
	}

	public String getPaymentTerm() {
		return paymentTerm;
	}

	public void setPaymentTerm(String paymentTerm) {
		this.paymentTerm = paymentTerm;
	}

	public String getContractType() {
		return contractType;
	}

	public void setContractType(String contractType) {
		this.contractType = contractType;
	}

	public String getDecisionRefNo() {
		return decisionRefNo;
	}

	public void setDecisionRefNo(String decisionRefNo) {
		this.decisionRefNo = decisionRefNo;
	}

	public List<CreditCheckItemDetail> getItemDetails() {
		return itemDetails;
	}

	public void setItemDetails(List<CreditCheckItemDetail> itemDetails) {
		this.itemDetails = itemDetails;
	}

	public String getEventName() {
		return eventName;
	}

	public void setEventName(String eventName) {
		this.eventName = eventName;
	}

	public String getOperationType() {
		return operationType;
	}

	public void setOperationType(String operationType) {
		this.operationType = operationType;
	}

}
