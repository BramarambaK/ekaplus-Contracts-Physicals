package com.eka.physicals.dto;

import java.util.List;

public class ContractApprovalLevelDTO {

	private String approvalLevelId;
	private String approvalLevelName;
	private String approvalLevelNo;
	private String totalNoOfSubApproval;
	private String noOfApprovalRequired;
	private String approvalDetailsId;
	private String activityApprovalId;
	private String approvalStatus;

	private List<ContractApprovalSubLevelDTO> approvalSubLevelDos;

	public String getApprovalLevelId() {
		return approvalLevelId;
	}

	public void setApprovalLevelId(String approvalLevelId) {
		this.approvalLevelId = approvalLevelId;
	}

	public String getApprovalLevelName() {
		return approvalLevelName;
	}

	public void setApprovalLevelName(String approvalLevelName) {
		this.approvalLevelName = approvalLevelName;
	}

	public String getApprovalLevelNo() {
		return approvalLevelNo;
	}

	public String getTotalNoOfSubApproval() {
		return totalNoOfSubApproval;
	}

	public void setTotalNoOfSubApproval(String totalNoOfSubApproval) {
		this.totalNoOfSubApproval = totalNoOfSubApproval;
	}

	public void setApprovalLevelNo(String approvalLevelNo) {
		this.approvalLevelNo = approvalLevelNo;
	}

	public String getNoOfApprovalRequired() {
		return noOfApprovalRequired;
	}

	public void setNoOfApprovalRequired(String noOfApprovalRequired) {
		this.noOfApprovalRequired = noOfApprovalRequired;
	}

	public String getApprovalDetailsId() {
		return approvalDetailsId;
	}

	public void setApprovalDetailsId(String approvalDetailsId) {
		this.approvalDetailsId = approvalDetailsId;
	}

	public String getActivityApprovalId() {
		return activityApprovalId;
	}

	public void setActivityApprovalId(String activityApprovalId) {
		this.activityApprovalId = activityApprovalId;
	}

	public String getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(String approvalStatus) {
		this.approvalStatus = approvalStatus;
	}

	public List<ContractApprovalSubLevelDTO> getApprovalSubLevelDos() {
		return approvalSubLevelDos;
	}

	public void setApprovalSubLevelDos(
			List<ContractApprovalSubLevelDTO> approvalSubLevelDos) {
		this.approvalSubLevelDos = approvalSubLevelDos;
	}

}
