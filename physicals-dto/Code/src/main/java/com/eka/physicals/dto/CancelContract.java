package com.eka.physicals.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public class CancelContract {

	private String internalContractRefNo;
	private String contractRefNo;
	private String cpName;
	private String cancellationDate;
	private String reasonToCancel;
	private String issueDate;
	
	public String getInternalContractRefNo() {
		return internalContractRefNo;
	}
	public void setInternalContractRefNo(String internalContractRefNo) {
		this.internalContractRefNo = internalContractRefNo;
	}
	public String getContractRefNo() {
		return contractRefNo;
	}
	public void setContractRefNo(String contractRefNo) {
		this.contractRefNo = contractRefNo;
	}
	public String getCpName() {
		return cpName;
	}
	public void setCpName(String cpName) {
		this.cpName = cpName;
	}
	public String getCancellationDate() {
		return cancellationDate;
	}
	public void setCancellationDate(String cancellationDate) {
		this.cancellationDate = cancellationDate;
	}
	public String getReasonToCancel() {
		return reasonToCancel;
	}
	public void setReasonToCancel(String reasonToCancel) {
		this.reasonToCancel = reasonToCancel;
	}
	public String getIssueDate() {
		return issueDate;
	}
	public void setIssueDate(String issueDate) {
		this.issueDate = issueDate;
	}
	
	
	
	
}
