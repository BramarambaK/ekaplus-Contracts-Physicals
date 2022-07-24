package com.eka.physicals.dto;

public class ContractApprovalSubLevelDTO {

	private String approvalSubLevelId;
	private String approvalSubLevelName;
	private String authorizedForApproval;
	private String approvalSubDetailsId;
	private String suggestedApproverId;
	private String approvalStatus;
	private String remarks;
	private String userId;
	private String previousApprovalStatus;
	private String approvedOrRejectedBy;
	private String approvedOrRejectedDate;
	private String isApprovalDisabled;
	private String isApproved;
	private String isRejected;

	public String getApprovalSubDetailsId() {
		return approvalSubDetailsId;
	}

	public void setApprovalSubDetailsId(String approvalSubDetailsId) {
		this.approvalSubDetailsId = approvalSubDetailsId;
	}

	public String getApprovalSubLevelId() {
		return approvalSubLevelId;
	}

	public void setApprovalSubLevelId(String approvalSubLevelId) {
		this.approvalSubLevelId = approvalSubLevelId;
	}

	public String getApprovalSubLevelName() {
		return approvalSubLevelName;
	}

	public void setApprovalSubLevelName(String approvalSubLevelName) {
		this.approvalSubLevelName = approvalSubLevelName;
	}

	public String getSuggestedApproverId() {
		return suggestedApproverId;
	}

	public void setSuggestedApproverId(String suggestedApproverId) {
		this.suggestedApproverId = suggestedApproverId;
	}

	public String getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(String approvalStatus) {
		this.approvalStatus = approvalStatus;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getPreviousApprovalStatus() {
		return previousApprovalStatus;
	}

	public void setPreviousApprovalStatus(String previousApprovalStatus) {
		this.previousApprovalStatus = previousApprovalStatus;
	}

	public String getApprovedOrRejectedBy() {
		return approvedOrRejectedBy;
	}

	public void setApprovedOrRejectedBy(String approvedOrRejectedBy) {
		this.approvedOrRejectedBy = approvedOrRejectedBy;
	}

	public String getApprovedOrRejectedDate() {
		return approvedOrRejectedDate;
	}

	public void setApprovedOrRejectedDate(String approvedOrRejectedDate) {
		this.approvedOrRejectedDate = approvedOrRejectedDate;
	}

	public String getAuthorizedForApproval() {
		return authorizedForApproval;
	}

	public void setAuthorizedForApproval(String authorizedForApproval) {
		this.authorizedForApproval = authorizedForApproval;
	}

	public String getIsApprovalDisabled() {
		return isApprovalDisabled;
	}

	public void setIsApprovalDisabled(String isApprovalDisabled) {
		this.isApprovalDisabled = isApprovalDisabled;
	}

	public String getIsApproved() {
		return isApproved;
	}

	public void setIsApproved(String isApproved) {
		this.isApproved = isApproved;
	}

	public String getIsRejected() {
		return isRejected;
	}

	public void setIsRejected(String isRejected) {
		this.isRejected = isRejected;
	}
}
