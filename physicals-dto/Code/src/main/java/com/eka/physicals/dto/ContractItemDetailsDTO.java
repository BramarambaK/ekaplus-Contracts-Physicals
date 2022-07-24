package com.eka.physicals.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Objects;

import com.eka.physicals.util.DateDeserializer;
import com.eka.physicals.util.DateSerializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

public class ContractItemDetailsDTO {

	private String internalItemRefNo;
	private int itemNo;
	private String productId;
	private String quality;
	private BigDecimal itemQty;
	private String itemQtyUnitId;
	private BigDecimal tolerance;
	private String toleranceType;
	private String toleranceLevel;
	private String payInCurId;
	private ContractPricingDetailsDTO pricing;
	private String shipmentMode;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date deliveryFromDate;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date deliveryToDate;
	private String loadingLocationGroupTypeId;
	private String originationCityId;
	private String originationCountryId;
	private String destinationLocationGroupTypeId;
	private String destinationCityId;
	private String destinationCountryId;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date paymentDueDate;
	private String profitCenterId;
	private String strategyAccId;
	private String inspectionCompany;
	private String isOptionalOrigination;
	private String isOptionalDestination;
	private String optLoadLocGroupTypeId;
	private String optDestLocGroupTypeId;
	private List<ContractItemOptLoadingDO> optionalLoadingDetails;
	private List<ContractItemOptDischargeDO> optionalDischargeDetails;
	private String valuationFormula;
	private List<ContractItemEstimateDTO> estimates;
	private Boolean isDeleted = false;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date laycanStartDate;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date laycanEndDate;
	// provisional invoice percent
	private String unweighedPiPctType;
	private BigDecimal unweighedPiPctValue;
	private ContractItemInterestDTO latePaymentInterestDetails;
	private String qualityPdScheduleId;

	// price fix earliest by
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date earliestBy;
	// price fix last by
	private String priceLastFixDayBasedOn;
	// price fix option
	private String optionsToFix;
	// price fix method
	private String fixationMethod;
	// Future Instrument
	private String priceContractDefId;
	private String futureInstrumentText;
	private String taxScheduleCountryId;
	private String taxScheduleStateId;
	private String taxScheduleId;
	private List<ContractItemAddDedDTO> itemAdditionDeductions;
	private String itemDisplayValue;
	private Boolean isOptionalFieldsEnabled;
	private String cropYearId;
	private String originId;
	private String packingTypeId;
	private String packingSizeId;
	private String periodType;

	// Adding below five fields (API Changes) Enable data fields in Oil UI to
	// capture RINS value
	private String isRenewable;
	private String isRinContract;
	private String rinEquivalanceValue;
	private String rinQuantity;
	private String rinUnit;
	// EPC-1818
	private BigDecimal toleranceMin;
	private BigDecimal toleranceMax;

	// EPC-1539
	private String productSpecs;
	
	//EPC-2064
	private String dailyMonthly;
	private double dailyMonthlyQty;
	
	//CPR-772
	private String customEvent;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date customEventDate;
	
	//EPC-2386
	private String holidayRule;
	//EPC-2531
	private String formulaPriceDetails;
	private String itemQtyUnit;
	
	// CPR-1067
	private BigDecimal contractQualityDensity;
	private String contractQualityMassUnit;
	private String contractQualityVolumeUnit;

	//EPC-3162
	private String cpContractItemId;
	//EPC-3189
	private String internalProfitCenterId;
	private String internalStrategyAccId;
	//EPC-3061
	private String qualityLongDesc;
	private String qualityShortDesc;
	
	private String invDocPriceUnitId;
	//EPC-3440
	private String densityMassQtyUnitId;
	private String densityVolumeQtyUnitId;
	private BigDecimal densityFactor;
	private BigDecimal contractPriceQtyBaseQtyConv;
	private ContractItemValuationDTO contractItemValuationDTO;
	//EPC-3819
	private String totalPrice;
	private String ticketNumber;
	//EPSCM-55796
	private String isGrossOrNetQty;
	//EPC-3933
	private String shipVesselDetails;

	public String getInternalItemRefNo() {
		return internalItemRefNo;
	}

	public void setInternalItemRefNo(String internalItemRefNo) {
		this.internalItemRefNo = internalItemRefNo;
	}

	public int getItemNo() {
		return itemNo;
	}

	public void setItemNo(int itemNo) {
		this.itemNo = itemNo;
	}

	public String getProductId() {
		return productId;
	}

	public void setProductId(String productId) {
		this.productId = productId;
	}

	public String getQuality() {
		return quality;
	}

	public void setQuality(String quality) {
		this.quality = quality;
	}

	public BigDecimal getItemQty() {
		return itemQty;
	}

	public void setItemQty(BigDecimal itemQty) {
		this.itemQty = itemQty;
	}

	public String getItemQtyUnitId() {
		return itemQtyUnitId;
	}

	public void setItemQtyUnitId(String itemQtyUnitId) {
		this.itemQtyUnitId = itemQtyUnitId;
	}

	public BigDecimal getTolerance() {
		return tolerance;
	}

	public void setTolerance(BigDecimal tolerance) {
		this.tolerance = tolerance;
	}

	public String getToleranceType() {
		return toleranceType;
	}

	public void setToleranceType(String toleranceType) {
		this.toleranceType = toleranceType;
	}

	public String getToleranceLevel() {
		return toleranceLevel;
	}

	public void setToleranceLevel(String toleranceLevel) {
		this.toleranceLevel = toleranceLevel;
	}

	public String getPayInCurId() {
		return payInCurId;
	}

	public void setPayInCurId(String payInCurId) {
		this.payInCurId = payInCurId;
	}

	public ContractPricingDetailsDTO getPricing() {
		return pricing;
	}

	public void setPricing(ContractPricingDetailsDTO pricing) {
		this.pricing = pricing;
	}

	public Date getDeliveryFromDate() {
		return deliveryFromDate;
	}

	public void setDeliveryFromDate(Date deliveryFromDate) {
		this.deliveryFromDate = deliveryFromDate;
	}

	public Date getDeliveryToDate() {
		return deliveryToDate;
	}

	public void setDeliveryToDate(Date deliveryToDate) {
		this.deliveryToDate = deliveryToDate;
	}

	public String getLoadingLocationGroupTypeId() {
		return loadingLocationGroupTypeId;
	}

	public void setLoadingLocationGroupTypeId(String loadingLocationGroupTypeId) {
		this.loadingLocationGroupTypeId = loadingLocationGroupTypeId;
	}

	public String getOriginationCityId() {
		return originationCityId;
	}

	public void setOriginationCityId(String originationCityId) {
		this.originationCityId = originationCityId;
	}

	public String getOriginationCountryId() {
		return originationCountryId;
	}

	public void setOriginationCountryId(String originationCountryId) {
		this.originationCountryId = originationCountryId;
	}

	public String getDestinationLocationGroupTypeId() {
		return destinationLocationGroupTypeId;
	}

	public void setDestinationLocationGroupTypeId(
			String destinationLocationGroupTypeId) {
		this.destinationLocationGroupTypeId = destinationLocationGroupTypeId;
	}

	public String getDestinationCityId() {
		return destinationCityId;
	}

	public void setDestinationCityId(String destinationCityId) {
		this.destinationCityId = destinationCityId;
	}

	public String getDestinationCountryId() {
		return destinationCountryId;
	}

	public void setDestinationCountryId(String destinationCountryId) {
		this.destinationCountryId = destinationCountryId;
	}

	public Date getPaymentDueDate() {
		return paymentDueDate;
	}

	public void setPaymentDueDate(Date paymentDueDate) {
		this.paymentDueDate = paymentDueDate;
	}

	public String getProfitCenterId() {
		return profitCenterId;
	}

	public void setProfitCenterId(String profitCenterId) {
		this.profitCenterId = profitCenterId;
	}

	public String getStrategyAccId() {
		return strategyAccId;
	}

	public void setStrategyAccId(String strategyAccId) {
		this.strategyAccId = strategyAccId;
	}

	public String getInspectionCompany() {
		return inspectionCompany;
	}

	public void setInspectionCompany(String inspectionCompany) {
		this.inspectionCompany = inspectionCompany;
	}

	public String getValuationFormula() {
		return valuationFormula;
	}

	public void setValuationFormula(String valuationFormula) {
		this.valuationFormula = valuationFormula;
	}

	public List<ContractItemEstimateDTO> getEstimates() {
		return estimates;
	}

	public void setEstimates(List<ContractItemEstimateDTO> estimates) {
		this.estimates = estimates;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null)
			return false;

		if (!obj.getClass().equals(this.getClass()))
			return false;

		ContractItemDetailsDTO that = (ContractItemDetailsDTO) obj;

		return this.getItemNo() == that.getItemNo();
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(this.getItemNo());
	}

	public String getShipmentMode() {
		return shipmentMode;
	}

	public void setShipmentMode(String shipmentMode) {
		this.shipmentMode = shipmentMode;
	}

	public Date getLaycanStartDate() {
		return laycanStartDate;
	}

	public void setLaycanStartDate(Date laycanStartDate) {
		this.laycanStartDate = laycanStartDate;
	}

	public Date getLaycanEndDate() {
		return laycanEndDate;
	}

	public void setLaycanEndDate(Date laycanEndDate) {
		this.laycanEndDate = laycanEndDate;
	}

	public String getUnweighedPiPctType() {
		return unweighedPiPctType;
	}

	public void setUnweighedPiPctType(String unweighedPiPctType) {
		this.unweighedPiPctType = unweighedPiPctType;
	}

	public BigDecimal getUnweighedPiPctValue() {
		return unweighedPiPctValue;
	}

	public void setUnweighedPiPctValue(BigDecimal unweighedPiPctValue) {
		this.unweighedPiPctValue = unweighedPiPctValue;
	}

	public ContractItemInterestDTO getLatePaymentInterestDetails() {
		return latePaymentInterestDetails;
	}

	public void setLatePaymentInterestDetails(
			ContractItemInterestDTO latePaymentInterestDetails) {
		this.latePaymentInterestDetails = latePaymentInterestDetails;
	}

	public String getIsOptionalOrigination() {
		return isOptionalOrigination;
	}

	public void setIsOptionalOrigination(String isOptionalOrigination) {
		this.isOptionalOrigination = isOptionalOrigination;
	}

	public String getIsOptionalDestination() {
		return isOptionalDestination;
	}

	public void setIsOptionalDestination(String isOptionalDestination) {
		this.isOptionalDestination = isOptionalDestination;
	}

	public String getQualityPdScheduleId() {
		return qualityPdScheduleId;
	}

	public void setQualityPdScheduleId(String qualityPdScheduleId) {
		this.qualityPdScheduleId = qualityPdScheduleId;
	}

	public String getOptLoadLocGroupTypeId() {
		return optLoadLocGroupTypeId;
	}

	public void setOptLoadLocGroupTypeId(String optLoadLocGroupTypeId) {
		this.optLoadLocGroupTypeId = optLoadLocGroupTypeId;
	}

	public String getOptDestLocGroupTypeId() {
		return optDestLocGroupTypeId;
	}

	public void setOptDestLocGroupTypeId(String optDestLocGroupTypeId) {
		this.optDestLocGroupTypeId = optDestLocGroupTypeId;
	}

	public List<ContractItemOptLoadingDO> getOptionalLoadingDetails() {
		return optionalLoadingDetails;
	}

	public void setOptionalLoadingDetails(
			List<ContractItemOptLoadingDO> optionalLoadingDetails) {
		this.optionalLoadingDetails = optionalLoadingDetails;
	}

	public List<ContractItemOptDischargeDO> getOptionalDischargeDetails() {
		return optionalDischargeDetails;
	}

	public void setOptionalDischargeDetails(
			List<ContractItemOptDischargeDO> optionalDischargeDetails) {
		this.optionalDischargeDetails = optionalDischargeDetails;
	}

	public Date getEarliestBy() {
		return earliestBy;
	}

	public void setEarliestBy(Date earliestBy) {
		this.earliestBy = earliestBy;
	}

	public String getPriceLastFixDayBasedOn() {
		return priceLastFixDayBasedOn;
	}

	public void setPriceLastFixDayBasedOn(String priceLastFixDayBasedOn) {
		this.priceLastFixDayBasedOn = priceLastFixDayBasedOn;
	}

	public String getOptionsToFix() {
		return optionsToFix;
	}

	public void setOptionsToFix(String optionsToFix) {
		this.optionsToFix = optionsToFix;
	}

	public String getFixationMethod() {
		return fixationMethod;
	}

	public void setFixationMethod(String fixationMethod) {
		this.fixationMethod = fixationMethod;
	}

	public String getPriceContractDefId() {
		return priceContractDefId;
	}

	public void setPriceContractDefId(String priceContractDefId) {
		this.priceContractDefId = priceContractDefId;
	}

	public String getFutureInstrumentText() {
		return futureInstrumentText;
	}

	public void setFutureInstrumentText(String futureInstrumentText) {
		this.futureInstrumentText = futureInstrumentText;
	}

	public String getTaxScheduleCountryId() {
		return taxScheduleCountryId;
	}

	public void setTaxScheduleCountryId(String taxScheduleCountryId) {
		this.taxScheduleCountryId = taxScheduleCountryId;
	}

	public String getTaxScheduleStateId() {
		return taxScheduleStateId;
	}

	public void setTaxScheduleStateId(String taxScheduleStateId) {
		this.taxScheduleStateId = taxScheduleStateId;
	}

	public String getTaxScheduleId() {
		return taxScheduleId;
	}

	public void setTaxScheduleId(String taxScheduleId) {
		this.taxScheduleId = taxScheduleId;
	}

	public List<ContractItemAddDedDTO> getItemAdditionDeductions() {
		return itemAdditionDeductions;
	}

	public void setItemAdditionDeductions(
			List<ContractItemAddDedDTO> itemAdditionDeductions) {
		this.itemAdditionDeductions = itemAdditionDeductions;
	}

	public String getItemDisplayValue() {
		return itemDisplayValue;
	}

	public void setItemDisplayValue(String itemDisplayValue) {
		this.itemDisplayValue = itemDisplayValue;
	}

	public Boolean getIsDeleted() {
		return isDeleted;
	}

	public void setIsDeleted(Boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public Boolean getIsOptionalFieldsEnabled() {
		return isOptionalFieldsEnabled;
	}

	public void setIsOptionalFieldsEnabled(Boolean isOptionalFieldsEnabled) {
		this.isOptionalFieldsEnabled = isOptionalFieldsEnabled;
	}

	public String getCropYearId() {
		return cropYearId;
	}

	public void setCropYearId(String cropYearId) {
		this.cropYearId = cropYearId;
	}

	public String getOriginId() {
		return originId;
	}

	public void setOriginId(String originId) {
		this.originId = originId;
	}

	public String getPackingTypeId() {
		return packingTypeId;
	}

	public void setPackingTypeId(String packingTypeId) {
		this.packingTypeId = packingTypeId;
	}

	public String getPackingSizeId() {
		return packingSizeId;
	}

	public void setPackingSizeId(String packingSizeId) {
		this.packingSizeId = packingSizeId;
	}

	public String getPeriodType() {
		return periodType;
	}

	public void setPeriodType(String periodType) {
		this.periodType = periodType;
	}

	public String getIsRenewable() {
		return isRenewable;
	}

	public void setIsRenewable(String isRenewable) {
		this.isRenewable = isRenewable;
	}

	public String getIsRinContract() {
		return isRinContract;
	}

	public void setIsRinContract(String isRinContract) {
		this.isRinContract = isRinContract;
	}

	public String getRinEquivalanceValue() {
		return rinEquivalanceValue;
	}

	public void setRinEquivalanceValue(String rinEquivalanceValue) {
		this.rinEquivalanceValue = rinEquivalanceValue;
	}

	public String getRinQuantity() {
		return rinQuantity;
	}

	public void setRinQuantity(String rinQuantity) {
		this.rinQuantity = rinQuantity;
	}

	public String getRinUnit() {
		return rinUnit;
	}

	public void setRinUnit(String rinUnit) {
		this.rinUnit = rinUnit;
	}

	public BigDecimal getToleranceMin() {
		return toleranceMin;
	}

	public void setToleranceMin(BigDecimal toleranceMin) {
		this.toleranceMin = toleranceMin;
	}

	public BigDecimal getToleranceMax() {
		return toleranceMax;
	}

	public void setToleranceMax(BigDecimal toleranceMax) {
		this.toleranceMax = toleranceMax;
	}

	public String getProductSpecs() {
		return productSpecs;
	}

	public void setProductSpecs(String productSpecs) {
		this.productSpecs = productSpecs;
	}

	public String getDailyMonthly() {
		return dailyMonthly;
	}

	public void setDailyMonthly(String dailyMonthly) {
		this.dailyMonthly = dailyMonthly;
	}

	public double getDailyMonthlyQty() {
		return dailyMonthlyQty;
	}

	public void setDailyMonthlyQty(double dailyMonthlyQty) {
		this.dailyMonthlyQty = dailyMonthlyQty;
	}

	public String getCustomEvent() {
		return customEvent;
	}

	public void setCustomEvent(String customEvent) {
		this.customEvent = customEvent;
	}

	public Date getCustomEventDate() {
		return customEventDate;
	}

	public void setCustomEventDate(Date customEventDate) {
		this.customEventDate = customEventDate;
	}

	public String getHolidayRule() {
		return holidayRule;
	}

	public void setHolidayRule(String holidayRule) {
		this.holidayRule = holidayRule;
	}

	public String getFormulaPriceDetails() {
		return formulaPriceDetails;
	}

	public void setFormulaPriceDetails(String formulaPriceDetails) {
		this.formulaPriceDetails = formulaPriceDetails;
	}

	public String getItemQtyUnit() {
		return itemQtyUnit;
	}

	public void setItemQtyUnit(String itemQtyUnit) {
		this.itemQtyUnit = itemQtyUnit;
	}

	public BigDecimal getcontractQualityDensity() {
		return contractQualityDensity;
	}

	public void setcontractQualityDensity(BigDecimal contractQualityDensity) {
		this.contractQualityDensity = contractQualityDensity;
	}

	public String getcontractQualityMassUnit() {
		return contractQualityMassUnit;
	}

	public void setcontractQualityMassUnit(String contractQualityMassUnit) {
		this.contractQualityMassUnit = contractQualityMassUnit;
	}

	public String getcontractQualityVolumeUnit() {
		return contractQualityVolumeUnit;
	}

	public void setcontractQualityVolumeUnit(String contractQualityVolumeUnit) {
		this.contractQualityVolumeUnit = contractQualityVolumeUnit;
	}

	public String getCpContractItemId() {
		return cpContractItemId;
	}

	public void setCpContractItemId(String cpContractItemId) {
		this.cpContractItemId = cpContractItemId;
	}

	public String getInternalProfitCenterId() {
		return internalProfitCenterId;
	}

	public void setInternalProfitCenterId(String internalProfitCenterId) {
		this.internalProfitCenterId = internalProfitCenterId;
	}

	public String getInternalStrategyAccId() {
		return internalStrategyAccId;
	}

	public void setInternalStrategyAccId(String internalStrategyAccId) {
		this.internalStrategyAccId = internalStrategyAccId;
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

	public String getInvDocPriceUnitId() {
		return invDocPriceUnitId;
	}

	public void setInvDocPriceUnitId(String invDocPriceUnitId) {
		this.invDocPriceUnitId = invDocPriceUnitId;
	}

	public String getDensityMassQtyUnitId() {
		return densityMassQtyUnitId;
	}

	public void setDensityMassQtyUnitId(String densityMassQtyUnitId) {
		this.densityMassQtyUnitId = densityMassQtyUnitId;
	}

	public String getDensityVolumeQtyUnitId() {
		return densityVolumeQtyUnitId;
	}

	public void setDensityVolumeQtyUnitId(String densityVolumeQtyUnitId) {
		this.densityVolumeQtyUnitId = densityVolumeQtyUnitId;
	}

	public BigDecimal getDensityFactor() {
		return densityFactor;
	}

	public void setDensityFactor(BigDecimal densityFactor) {
		this.densityFactor = densityFactor;
	}

	public BigDecimal getContractPriceQtyBaseQtyConv() {
		return contractPriceQtyBaseQtyConv;
	}

	public void setContractPriceQtyBaseQtyConv(BigDecimal contractPriceQtyBaseQtyConv) {
		this.contractPriceQtyBaseQtyConv = contractPriceQtyBaseQtyConv;
	}

	public ContractItemValuationDTO getContractItemValuationDTO() {
		return contractItemValuationDTO;
	}

	public void setContractItemValuationDTO(ContractItemValuationDTO contractItemValuationDTO) {
		this.contractItemValuationDTO = contractItemValuationDTO;
	}

	public String getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(String totalPrice) {
		this.totalPrice = totalPrice;
	}

	public String getTicketNumber() {
		return ticketNumber;
	}

	public void setTicketNumber(String ticketNumber) {
		this.ticketNumber = ticketNumber;
	}

	public String getIsGrossOrNetQty() {
		return isGrossOrNetQty;
	}

	public void setIsGrossOrNetQty(String isGrossOrNetQty) {
		this.isGrossOrNetQty = isGrossOrNetQty;
	}

	public String getShipVesselDetails() {
		return shipVesselDetails;
	}

	public void setShipVesselDetails(String shipVesselDetails) {
		this.shipVesselDetails = shipVesselDetails;
	}
	
}
