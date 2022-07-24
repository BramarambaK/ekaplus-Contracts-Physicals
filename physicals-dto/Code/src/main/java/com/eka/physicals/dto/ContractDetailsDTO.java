package com.eka.physicals.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.eka.physicals.util.DateDeserializer;
import com.eka.physicals.util.DateSerializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

public class ContractDetailsDTO {

	private String _id;
	private String userInputText;
	private String contractState;
	private String internalDraftId;
	private String templateName;
	private String contractRefNo;
	private String internalContractRefNo;
	private String templateId;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date issueDate;
	private String dealType;
	private String contractType;
	private String traderUserId;
	private String cpProfileId;
	private String paymentTermId;
	private String applicableLawId;
	private String arbitrationId;
	private String remark;
	private String agentProfileId;
	private String agentPersonInCharge;
	private String agentRefNo;
	private String agentCommType;
	private BigDecimal agentCommValue;
	private String agentCommPriceUnitId;
	private String cpPersonInCharge;
	private String cpRefNo;
	private String qualityFinalAt;
	private String weightFinalAt;
	private String incotermId;
	private List<ContractItemDetailsDTO> itemDetails;
	private String reasonToModify;
	private ContractApprovalDTO approvalManagementDO;
	private String generalDetailsDisplayValue;
	private Boolean isOptionalFieldsEnabled;
	private BigDecimal prePaymentPct;
	private Integer prePaymentDays;
	private String legalEntityId;
	private String solutionType;
	// EPC-2417
	private String totalQtyUnitId;
	// EPC-2984
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date amendmentDate;
	// EPC-3189
	private String intraCompanyCPProfileId;
	private String intraCompanyDealID;
	private IntraCompantDealKeyMap intraCompantDealKeyMap;
	// Intra company name - second corporate name
	private String intraCompanyCPName;
	private String intraCompanyTraderUserId;

	private String interCompanyDealId = null;
	private String interCompanyDeal = null;
	private String interCompCorpName = null;
	private String interCompCorpId = null;
	private String secondLegInternalContractRefNo;
	private String firstLegInternalContractRefNo;
	private Boolean copySecondaryCost;

	//EPC-3483
	private String provisionalPaymentTermId;
	private String corporateId;

	//EPC-3935
	private Boolean IS_INTER_INTRA_COMP_APPROVAL_REQ;

	public String getContractRefNo() {
		return contractRefNo;
	}

	public void setContractRefNo(String contractRefNo) {
		this.contractRefNo = contractRefNo;
	}

	public String getInternalContractRefNo() {
		return internalContractRefNo;
	}

	public void setInternalContractRefNo(String internalContractRefNo) {
		this.internalContractRefNo = internalContractRefNo;
	}

	public String getTemplateId() {
		return templateId;
	}

	public void setTemplateId(String templateId) {
		this.templateId = templateId;
	}

	public Date getIssueDate() {
		return issueDate;
	}

	public void setIssueDate(Date issueDate) {
		this.issueDate = issueDate;
	}

	public String getDealType() {
		return dealType;
	}

	public void setDealType(String dealType) {
		this.dealType = dealType;
	}

	public String getContractType() {
		return contractType;
	}

	public void setContractType(String contractType) {
		this.contractType = contractType;
	}

	public String getTraderUserId() {
		return traderUserId;
	}

	public void setTraderUserId(String traderUserId) {
		this.traderUserId = traderUserId;
	}

	public String getCpProfileId() {
		return cpProfileId;
	}

	public void setCpProfileId(String cpProfileId) {
		this.cpProfileId = cpProfileId;
	}

	public String getPaymentTermId() {
		return paymentTermId;
	}

	public void setPaymentTermId(String paymentTermId) {
		this.paymentTermId = paymentTermId;
	}

	public String getApplicableLawId() {
		return applicableLawId;
	}

	public void setApplicableLawId(String applicableLawId) {
		this.applicableLawId = applicableLawId;
	}

	public String getArbitrationId() {
		return arbitrationId;
	}

	public void setArbitrationId(String arbitrationId) {
		this.arbitrationId = arbitrationId;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getAgentProfileId() {
		return agentProfileId;
	}

	public void setAgentProfileId(String agentProfileId) {
		this.agentProfileId = agentProfileId;
	}

	public String getCpPersonInCharge() {
		return cpPersonInCharge;
	}

	public void setCpPersonInCharge(String cpPersonInCharge) {
		this.cpPersonInCharge = cpPersonInCharge;
	}

	public String getCpRefNo() {
		return cpRefNo;
	}

	public void setCpRefNo(String cpRefNo) {
		this.cpRefNo = cpRefNo;
	}

	public List<ContractItemDetailsDTO> getItemDetails() {
		return itemDetails;
	}

	public void setItemDetails(List<ContractItemDetailsDTO> itemDetails) {
		this.itemDetails = itemDetails;
	}

	public String getQualityFinalAt() {
		return qualityFinalAt;
	}

	public void setQualityFinalAt(String qualityFinalAt) {
		this.qualityFinalAt = qualityFinalAt;
	}

	public String getWeightFinalAt() {
		return weightFinalAt;
	}

	public void setWeightFinalAt(String weightFinalAt) {
		this.weightFinalAt = weightFinalAt;
	}

	public String getIncotermId() {
		return incotermId;
	}

	public void setIncotermId(String incotermId) {
		this.incotermId = incotermId;
	}

	public String getTemplateName() {
		return templateName;
	}

	public void setTemplateName(String templateName) {
		this.templateName = templateName;
	}

	public String getAgentPersonInCharge() {
		return agentPersonInCharge;
	}

	public void setAgentPersonInCharge(String agentPersonInCharge) {
		this.agentPersonInCharge = agentPersonInCharge;
	}

	public String getAgentRefNo() {
		return agentRefNo;
	}

	public void setAgentRefNo(String agentRefNo) {
		this.agentRefNo = agentRefNo;
	}

	public String getAgentCommType() {
		return agentCommType;
	}

	public void setAgentCommType(String agentCommType) {
		this.agentCommType = agentCommType;
	}

	public BigDecimal getAgentCommValue() {
		return agentCommValue;
	}

	public void setAgentCommValue(BigDecimal agentCommValue) {
		this.agentCommValue = agentCommValue;
	}

	public String getAgentCommPriceUnitId() {
		return agentCommPriceUnitId;
	}

	public void setAgentCommPriceUnitId(String agentCommPriceUnitId) {
		this.agentCommPriceUnitId = agentCommPriceUnitId;
	}

	public ContractApprovalDTO getApprovalManagementDO() {
		return approvalManagementDO;
	}

	public void setApprovalManagementDO(ContractApprovalDTO approvalManagementDO) {
		this.approvalManagementDO = approvalManagementDO;
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String getContractState() {
		return contractState;
	}

	public void setContractState(String contractState) {
		this.contractState = contractState;
	}

	public String getInternalDraftId() {
		return internalDraftId;
	}

	public void setInternalDraftId(String internalDraftId) {
		this.internalDraftId = internalDraftId;
	}

	public String getGeneralDetailsDisplayValue() {
		return generalDetailsDisplayValue;
	}

	public void setGeneralDetailsDisplayValue(String generalDetailsDisplayValue) {
		this.generalDetailsDisplayValue = generalDetailsDisplayValue;
	}

	public String getUserInputText() {
		return userInputText;
	}

	public void setUserInputText(String userInputText) {
		this.userInputText = userInputText;
	}

	public Boolean getIsOptionalFieldsEnabled() {
		return isOptionalFieldsEnabled;
	}

	public void setIsOptionalFieldsEnabled(Boolean isOptionalFieldsEnabled) {
		this.isOptionalFieldsEnabled = isOptionalFieldsEnabled;
	}

	public BigDecimal getPrePaymentPct() {
		return prePaymentPct;
	}

	public void setPrePaymentPct(BigDecimal prePaymentPct) {
		this.prePaymentPct = prePaymentPct;
	}

	public Integer getPrePaymentDays() {
		return prePaymentDays;
	}

	public void setPrePaymentDays(Integer prePaymentDays) {
		this.prePaymentDays = prePaymentDays;
	}

	public String getLegalEntityId() {
		return legalEntityId;
	}

	public void setLegalEntityId(String legalEntityId) {
		this.legalEntityId = legalEntityId;
	}

	public String getSolutionType() {
		return solutionType;
	}

	public void setSolutionType(String solutionType) {
		this.solutionType = solutionType;
	}

	public String getTotalQtyUnitId() {
		return totalQtyUnitId;
	}

	public void setTotalQtyUnitId(String totalQtyUnitId) {
		this.totalQtyUnitId = totalQtyUnitId;
	}

	public Date getAmendmentDate() {
		return amendmentDate;
	}

	public void setAmendmentDate(Date amendmentDate) {
		this.amendmentDate = amendmentDate;
	}

	public String getIntraCompanyCPProfileId() {
		return intraCompanyCPProfileId;
	}

	public void setIntraCompanyCPProfileId(String intraCompanyCPProfileId) {
		this.intraCompanyCPProfileId = intraCompanyCPProfileId;
	}

	public String getIntraCompanyDealID() {
		return intraCompanyDealID;
	}

	public void setIntraCompanyDealID(String intraCompanyDealID) {
		this.intraCompanyDealID = intraCompanyDealID;
	}

	public IntraCompantDealKeyMap getIntraCompantDealKeyMap() {
		return intraCompantDealKeyMap;
	}

	public void setIntraCompantDealKeyMap(IntraCompantDealKeyMap intraCompantDealKeyMap) {
		this.intraCompantDealKeyMap = intraCompantDealKeyMap;
	}

	public String getReasonToModify() {
		return reasonToModify;
	}

	public void setReasonToModify(String reasonToModify) {
		this.reasonToModify = reasonToModify;
	}

	public String getIntraCompanyCPName() {
		return intraCompanyCPName;
	}

	public void setIntraCompanyCPName(String intraCompanyCPName) {
		this.intraCompanyCPName = intraCompanyCPName;
	}

	public String getIntraCompanyTraderUserId() {
		return intraCompanyTraderUserId;
	}

	public void setIntraCompanyTraderUserId(String intraCompanyTraderUserId) {
		this.intraCompanyTraderUserId = intraCompanyTraderUserId;
	}

	public String getInterCompanyDealId() {
		return interCompanyDealId;
	}

	public void setInterCompanyDealId(String interCompanyDealId) {
		this.interCompanyDealId = interCompanyDealId;
	}

	public String getInterCompanyDeal() {
		return interCompanyDeal;
	}

	public void setInterCompanyDeal(String interCompanyDeal) {
		this.interCompanyDeal = interCompanyDeal;
	}

	public String getInterCompCorpName() {
		return interCompCorpName;
	}

	public void setInterCompCorpName(String interCompCorpName) {
		this.interCompCorpName = interCompCorpName;
	}

	public String getInterCompCorpId() {
		return interCompCorpId;
	}

	public void setInterCompCorpId(String interCompCorpId) {
		this.interCompCorpId = interCompCorpId;
	}

	public String getSecondLegInternalContractRefNo() {
		return secondLegInternalContractRefNo;
	}

	public void setSecondLegInternalContractRefNo(String secondLegInternalContractRefNo) {
		this.secondLegInternalContractRefNo = secondLegInternalContractRefNo;
	}

	public String getFirstLegInternalContractRefNo() {
		return firstLegInternalContractRefNo;
	}

	public void setFirstLegInternalContractRefNo(String firstLegInternalContractRefNo) {
		this.firstLegInternalContractRefNo = firstLegInternalContractRefNo;
	}

	public Boolean isCopySecondaryCost() {
		return copySecondaryCost;
	}

	public void setCopySecondaryCost(Boolean copySecondaryCost) {
		this.copySecondaryCost = copySecondaryCost;
	}

	public String getProvisionalPaymentTermId() {
		return provisionalPaymentTermId;
	}

	public void setProvisionalPaymentTermId(String provisionalPaymentTermId) {
		this.provisionalPaymentTermId = provisionalPaymentTermId;
	}

	public String getCorporateId() {
		return corporateId;
	}

	public void setCorporateId(String corporateId) {
		this.corporateId = corporateId;
	}

	public Boolean getIS_INTER_INTRA_COMP_APPROVAL_REQ() {
		return IS_INTER_INTRA_COMP_APPROVAL_REQ;
	}

	public void setIS_INTER_INTRA_COMP_APPROVAL_REQ(Boolean IS_INTER_INTRA_COMP_APPROVAL_REQ) {
		this.IS_INTER_INTRA_COMP_APPROVAL_REQ = IS_INTER_INTRA_COMP_APPROVAL_REQ;
	}

}
