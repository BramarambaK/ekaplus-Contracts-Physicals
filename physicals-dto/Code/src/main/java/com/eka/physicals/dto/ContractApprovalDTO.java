package com.eka.physicals.dto;

import java.util.List;

public class ContractApprovalDTO {

	private String activityApprovalId;
	private String activityApprovalStatus;
	private String operationType;
	private String activityRefNo;
	private String entityType;
	private List<ContractApprovalLevelDTO> approvalLevels;
	private String lastApprovedLevelNo;
	private String totalNoOfApprovalLevel;

	private String suggestedApproverUserId;
	private String subApprovalStatus;
	private String approvalLevelName;
	private String approvalSubLevelName;
	private String senderUserId;
	private boolean isFromApproval = false;
	private String currentUserId;

	public String getSuggestedApproverUserId() {
		return suggestedApproverUserId;
	}

	public void setSuggestedApproverUserId(String suggestedApproverUserId) {
		this.suggestedApproverUserId = suggestedApproverUserId;
	}

	public String getSubApprovalStatus() {
		return subApprovalStatus;
	}

	public void setSubApprovalStatus(String subApprovalStatus) {
		this.subApprovalStatus = subApprovalStatus;
	}

	public String getApprovalLevelName() {
		return approvalLevelName;
	}

	/**
	 * @param approvalLevelName
	 *            the approvalLevelName to set
	 */
	public void setApprovalLevelName(String approvalLevelName) {
		this.approvalLevelName = approvalLevelName;
	}

	/**
	 * @return the approvalSubLevelName
	 */
	public String getApprovalSubLevelName() {
		return approvalSubLevelName;
	}

	public void setApprovalSubLevelName(String approvalSubLevelName) {
		this.approvalSubLevelName = approvalSubLevelName;
	}

	public String getSenderUserId() {
		return senderUserId;
	}

	public void setSenderUserId(String senderUserId) {
		this.senderUserId = senderUserId;
	}

	public String getActivityApprovalId() {
		return activityApprovalId;
	}

	public void setActivityApprovalId(String activityApprovalId) {
		this.activityApprovalId = activityApprovalId;
	}

	public String getActivityApprovalStatus() {
		return activityApprovalStatus;
	}

	public void setActivityApprovalStatus(String activityApprovalStatus) {
		this.activityApprovalStatus = activityApprovalStatus;
	}

	public String getOperationType() {
		return operationType;
	}

	public void setOperationType(String operationType) {
		this.operationType = operationType;
	}

	public String getActivityRefNo() {
		return activityRefNo;
	}

	public void setActivityRefNo(String activityRefNo) {
		this.activityRefNo = activityRefNo;
	}

	public String getEntityType() {
		return entityType;
	}

	public void setEntityType(String entityType) {
		this.entityType = entityType;
	}

	public String getLastApprovedLevelNo() {
		return lastApprovedLevelNo;
	}

	public void setLastApprovedLevelNo(String lastApprovedLevelNo) {
		this.lastApprovedLevelNo = lastApprovedLevelNo;
	}

	public String getTotalNoOfApprovalLevel() {
		return totalNoOfApprovalLevel;
	}

	public void setTotalNoOfApprovalLevel(String totalNoOfApprovalLevel) {
		this.totalNoOfApprovalLevel = totalNoOfApprovalLevel;
	}

	public boolean isFromApproval() {
		return isFromApproval;
	}

	public void setFromApproval(boolean isFromApproval) {
		this.isFromApproval = isFromApproval;
	}

	public List<ContractApprovalLevelDTO> getApprovalLevels() {
		return approvalLevels;
	}

	public void setApprovalLevels(List<ContractApprovalLevelDTO> approvalLevels) {
		this.approvalLevels = approvalLevels;
	}

	public String getCurrentUserId() {
		return currentUserId;
	}

	public void setCurrentUserId(String currentUserId) {
		this.currentUserId = currentUserId;
	}

}
