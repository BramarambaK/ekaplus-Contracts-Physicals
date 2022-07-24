package com.eka.physicals.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.eka.physicals.util.DateDeserializer;
import com.eka.physicals.util.DateSerializer;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public class ContractItemsEntity {

	private String internalContractRefNo;
	private String internalContractItemRefNo;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date amendmentDate;
	private String amendmentReason;
	private String origin;
	private String qualityId;
	private String quality;
	private String qualityLongDesc;
	private String qualityShortDesc;
	
	private String productSpecs;
	
	private String pricingInstrument;
	private String pricingMonthly;	
	private BigDecimal flatPrice;
	private String priceUnit;
	private String periodType;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date periodFromDate;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date periodToDate;
	//CC-3190
	private String multiDeliveryPeriodType;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date multiDeliveryFromDate;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date multiDeliveryToDate;
	
	private String remarks;
	
	private String cropYear;
	private String deliveryPeriod;

	
	private ContractApprovalDTO approvalManagementDO;
	//Adding priceType object to support all priceType in bulk amendment
	private ContractPricingDetailsDTO pricing;

	
	public String getInternalContractRefNo() {
		return internalContractRefNo;
	}
	public void setInternalContractRefNo(String internalContractRefNo) {
		this.internalContractRefNo = internalContractRefNo;
	}
	public String getInternalContractItemRefNo() {
		return internalContractItemRefNo;
	}
	public void setInternalContractItemRefNo(String internalContractItemRefNo) {
		this.internalContractItemRefNo = internalContractItemRefNo;
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
	public String getOrigin() {
		return origin;
	}
	public void setOrigin(String origin) {
		this.origin = origin;
	}
	public String getQuality() {
		return quality;
	}
	public void setQuality(String quality) {
		this.quality = quality;
	}
	public String getPricingInstrument() {
		return pricingInstrument;
	}
	public void setPricingInstrument(String pricingInstrument) {
		this.pricingInstrument = pricingInstrument;
	}
	public String getPricingMonthly() {
		return pricingMonthly;
	}
	public void setPricingMonthly(String pricingMonthly) {
		this.pricingMonthly = pricingMonthly;
	}
	public BigDecimal getFlatPrice() {
		return flatPrice;
	}
	public void setFlatPrice(BigDecimal flatPrice) {
		this.flatPrice = flatPrice;
	}
	public String getPriceUnit() {
		return priceUnit;
	}
	public void setPriceUnit(String priceUnit) {
		this.priceUnit = priceUnit;
	}
	public String getPeriodType() {
		return periodType;
	}
	public void setPeriodType(String periodType) {
		this.periodType = periodType;
	}
	public Date getPeriodFromDate() {
		return periodFromDate;
	}
	public void setPeriodFromDate(Date periodFromDate) {
		this.periodFromDate = periodFromDate;
	}
	public Date getPeriodToDate() {
		return periodToDate;
	}
	public void setPeriodToDate(Date periodToDate) {
		this.periodToDate = periodToDate;
	}
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	public ContractApprovalDTO getApprovalManagementDO() {
		return approvalManagementDO;
	}
	public void setApprovalManagementDO(ContractApprovalDTO approvalManagementDO) {
		this.approvalManagementDO = approvalManagementDO;
	}
	public ContractPricingDetailsDTO getPricing() {
		return pricing;
	}
	public void setPricing(ContractPricingDetailsDTO pricing) {
		this.pricing = pricing;
	}
	public String getQualityId() {
		return qualityId;
	}
	public void setQualityId(String qualityId) {
		this.qualityId = qualityId;
	}
	public String getQualityLongDesc() {
		return qualityLongDesc;
	}
	public void setQualityLongDesc(String qualityLongDesc) {
		this.qualityLongDesc = qualityLongDesc;
	}
	public String getQualityShortDesc() {
		return qualityShortDesc;
	}
	public void setQualityShortDesc(String qualityShortDesc) {
		this.qualityShortDesc = qualityShortDesc;
	}
	public String getProductSpecs() {
		return productSpecs;
	}
	public void setProductSpecs(String productSpecs) {
		this.productSpecs = productSpecs;
	}
	public String getCropYear() {
		return cropYear;
	}
	public void setCropYear(String cropYear) {
		this.cropYear = cropYear;
	}
	public String getDeliveryPeriod() {
		return deliveryPeriod;
	}
	public void setDeliveryPeriod(String deliveryPeriod) {
		this.deliveryPeriod = deliveryPeriod;
	}
	public String getMultiDeliveryPeriodType() {
		return multiDeliveryPeriodType;
	}
	public void setMultiDeliveryPeriodType(String multiDeliveryPeriodType) {
		this.multiDeliveryPeriodType = multiDeliveryPeriodType;
	}
	public Date getMultiDeliveryFromDate() {
		return multiDeliveryFromDate;
	}
	public void setMultiDeliveryFromDate(Date multiDeliveryFromDate) {
		this.multiDeliveryFromDate = multiDeliveryFromDate;
	}
	public Date getMultiDeliveryToDate() {
		return multiDeliveryToDate;
	}
	public void setMultiDeliveryToDate(Date multiDeliveryToDate) {
		this.multiDeliveryToDate = multiDeliveryToDate;
	}
	
	
	
}
