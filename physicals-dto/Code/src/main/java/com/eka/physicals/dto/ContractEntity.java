package com.eka.physicals.dto;

import java.util.Date;
import java.util.List;

import com.eka.physicals.util.DateDeserializer;
import com.eka.physicals.util.DateSerializer;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public class ContractEntity {

	private String internalContractRefNo;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date amendmentDate;
	private String amendmentReason;
	private String cpProfileId;
	private String incotermId;
	private String paymentTermId;
	private String remark;
	
	private ContractApprovalDTO approvalManagementDO;
	
	public String getInternalContractRefNo() {
		return internalContractRefNo;
	}
	public void setInternalContractRefNo(String internalContractRefNo) {
		this.internalContractRefNo = internalContractRefNo;
	}
	public Date getAmendmentDate() {
		return amendmentDate;
	}
	public void setAmendmentDate(Date amendmentDate) {
		this.amendmentDate = amendmentDate;
	}
	public String getAmendmentReason() {
		return amendmentReason;
	}
	public void setAmendmentReason(String amendmentReason) {
		this.amendmentReason = amendmentReason;
	}
	public String getCpProfileId() {
		return cpProfileId;
	}
	public void setCpProfileId(String cpProfileId) {
		this.cpProfileId = cpProfileId;
	}
	public String getIncotermId() {
		return incotermId;
	}
	public void setIncotermId(String incotermId) {
		this.incotermId = incotermId;
	}
	public String getPaymentTermId() {
		return paymentTermId;
	}
	public void setPaymentTermId(String paymentTermId) {
		this.paymentTermId = paymentTermId;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
	public ContractApprovalDTO getApprovalManagementDO() {
		return approvalManagementDO;
	}
	public void setApprovalManagementDO(ContractApprovalDTO approvalManagementDO) {
		this.approvalManagementDO = approvalManagementDO;
	}

	
	
}
