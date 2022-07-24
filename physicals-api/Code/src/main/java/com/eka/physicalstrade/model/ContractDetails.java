package com.eka.physicalstrade.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public class ContractDetails {

	private String seqNo;
	
	private String contractIssueDate;

	private String traderName;

	private String dealType;

	private String cpName;

	private String incoTerms;

	private String paymentTerms;

	private String itemQuantityUnitId; 
	
	private String contractQuantityUnit;//

	private String product;

	private String origin;

	private String cropYear;

	private String quality;

	private String profitCenter;

	private String strategy;

	private String itemQuantity;

	private String tolerance;

	private String toleranceType;

	private String toleranceLevel;

	private String payInCurrency;

	private String priceType;

	 private String priceDf;  
	
	private String priceUnitId;

	private String loadingType;

	private String loadingCountry;

	private String loadingLocation;

	private String destinationType;

	private String destinationCountry;

	private String destinationLocation;

	private String deliveryFromDate;

	private String deliveryToDate;

	private String paymentDueDate;
	
	private String taxScheduleApplicableCountry;

	private String taxSchedule;

	private String termsAndConditions; // Applicable law contract

	private String arbitration;

	private String offerType;
	
	private String shipmentMode;
	
	private String contractStatus;
	
	private String errorMessage;
	
	private String contractRefNo;
		
    private String futureInstrument;
	
	private String priceMonth;
	
	private String basisPrice;
	
	private String basisPriceUnit;
	
	private String priceFixEarliestBy;
	
	private String priceFixOption;
	
	private String priceFixLatestBy;
	
	private String priceFixMethod;
	
	private String shipVesselDetails;
	
	private String qualityFinalAt;
	
	private String weightFinalAt;
	
	@Override
	public String toString() {
		return "ContractDetails [incoTerms=" + incoTerms + ", paymentTerms="
				+ paymentTerms + ", itemQuantityUnitId=" + itemQuantityUnitId +", contractQuantityUnit=" + contractQuantityUnit + ", product=" + product + ", "
				+ "quality=" + quality + ", profitCenter=" + profitCenter
				+ ", strategy=" + strategy + ", itemQuantity=" + itemQuantity + ", tolerance=" + tolerance + ", toleranceType=" + toleranceType
				+ ", toleranceLevel=" + toleranceLevel  
				+ ", payInCurrency=" + payInCurrency + ", priceType=" + priceType + ", priceDf=" + priceDf
				+ ", priceUnitId=" + priceUnitId + ", loadingType=" + loadingType + ", loadingCountry=" + loadingCountry
				+ ", loadingLocation=" + loadingLocation + ", destinationType=" + destinationType
				+ ", destinationCountry=" + destinationCountry + ", destinationLocation=" + destinationLocation
				+ ",deliveryFromDate=" + deliveryFromDate + ", deliveryToDate="
				+ deliveryToDate + ", paymentDueDate=" + paymentDueDate + ", taxScheduleApplicableCountry=" + taxScheduleApplicableCountry
				+ ", taxSchedule=" + taxSchedule + ", termsAndConditions=" + termsAndConditions + ", arbitration="
				+ arbitration + ",  offerType=" + offerType + " ]";
						
	}
	
	public String getSeqNo() {
		return seqNo;
	}

	public void setSeqNo(String seqNo) {
		this.seqNo = seqNo;
	}

	public String getContractIssueDate() {
		return contractIssueDate;
	}

	public void setContractIssueDate(String contractIssueDate) {
		this.contractIssueDate = contractIssueDate;
	}

	public String getTraderName() {
		return traderName;
	}

	public void setTraderName(String traderName) {
		this.traderName = traderName;
	}

	public String getDealType() {
		return dealType;
	}

	public void setDealType(String dealType) {
		this.dealType = dealType;
	}

	public String getCpName() {
		return cpName;
	}

	public void setCpName(String cpName) {
		this.cpName = cpName;
	}
	
	public String getIncoTerms() {
		return incoTerms;
	}

	public void setIncoTerms(String incoTerms) {
		this.incoTerms = incoTerms;
	}

	public String getPaymentTerms() {
		return paymentTerms;
	}

	public void setPaymentTerms(String paymentTerms) {
		this.paymentTerms = paymentTerms;
	}

	public String getItemQuantityUnitId() {
		return itemQuantityUnitId;
	}

	public void setItemQuantityUnitId(String itemQuantityUnitId) {
		this.itemQuantityUnitId = itemQuantityUnitId;
	}
	
	public String getContractQuantityUnit() {
		return contractQuantityUnit;
	}

	public void setContractQuantityUnit(String contractQuantityUnit) {
		this.contractQuantityUnit = contractQuantityUnit;
	}

	public String getProduct() {
		return product;
	}

	public void setProduct(String product) {
		this.product = product;
	}

	public String getOrigin() {
		return origin;
	}

	public void setOrigin(String origin) {
		this.origin = origin;
	}

	public String getCropYear() {
		return cropYear;
	}

	public void setCropYear(String cropYear) {
		this.cropYear = cropYear;
	}

	public String getQuality() {
		return quality;
	}

	public void setQuality(String quality) {
		this.quality = quality;
	}

	public String getProfitCenter() {
		return profitCenter;
	}

	public void setProfitCenter(String profitCenter) {
		this.profitCenter = profitCenter;
	}

	public String getStrategy() {
		return strategy;
	}

	public void setStrategy(String strategy) {
		this.strategy = strategy;
	}

	public String getItemQuantity() {
		return itemQuantity;
	}

	public void setItemQuantity(String itemQuantity) {
		this.itemQuantity = itemQuantity;
	}
	
	public String getTolerance() {
		return tolerance;
	}

	public void setTolerance(String tolerance) {
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

	public String getPayInCurrency() {
		return payInCurrency;
	}

	public void setPayInCurrency(String payInCurrency) {
		this.payInCurrency = payInCurrency;
	}

	public String getPriceType() {
		return priceType;
	}

	public void setPriceType(String priceType) {
		this.priceType = priceType;
	}

	public String getPriceDf() {
		return priceDf;
	}

	public void setPriceDf(String priceDf) {
		this.priceDf = priceDf;
	}

	public String getPriceUnitId() {
		return priceUnitId;
	}

	public void setPriceUnitId(String priceUnitId) {
		this.priceUnitId = priceUnitId;
	}

	public String getLoadingType() {
		return loadingType;
	}

	public void setLoadingType(String loadingType) {
		this.loadingType = loadingType;
	}

	public String getLoadingCountry() {
		return loadingCountry;
	}

	public void setLoadingCountry(String loadingCountry) {
		this.loadingCountry = loadingCountry;
	}

	public String getLoadingLocation() {
		return loadingLocation;
	}

	public void setLoadingLocation(String loadingLocation) {
		this.loadingLocation = loadingLocation;
	}

	public String getDestinationType() {
		return destinationType;
	}

	public void setDestinationType(String destinationType) {
		this.destinationType = destinationType;
	}

	public String getDestinationCountry() {
		return destinationCountry;
	}

	public void setDestinationCountry(String destinationCountry) {
		this.destinationCountry = destinationCountry;
	}

	public String getDestinationLocation() {
		return destinationLocation;
	}

	public void setDestinationLocation(String destinationLocation) {
		this.destinationLocation = destinationLocation;
	}

	public String getDeliveryFromDate() {
		return deliveryFromDate;
	}

	public void setDeliveryFromDate(String deliveryFromDate) {
		this.deliveryFromDate = deliveryFromDate;
	}

	public String getDeliveryToDate() {
		return deliveryToDate;
	}

	public void setDeliveryToDate(String deliveryToDate) {
		this.deliveryToDate = deliveryToDate;
	}

	public String getPaymentDueDate() {
		return paymentDueDate;
	}

	public void setPaymentDueDate(String paymentDueDate) {
		this.paymentDueDate = paymentDueDate;
	}

	public String getTaxScheduleApplicableCountry() {
		return taxScheduleApplicableCountry;
	}

	public void setTaxScheduleApplicableCountry(String taxScheduleApplicableCountry) {
		this.taxScheduleApplicableCountry = taxScheduleApplicableCountry;
	}

	public String getTaxSchedule() {
		return taxSchedule;
	}

	public void setTaxSchedule(String taxSchedule) {
		this.taxSchedule = taxSchedule;
	}

	public String getTermsAndConditions() {
		return termsAndConditions;
	}

	public void setTermsAndConditions(String termsAndConditions) {
		this.termsAndConditions = termsAndConditions;
	}

	public String getArbitration() {
		return arbitration;
	}

	public void setArbitration(String arbitration) {
		this.arbitration = arbitration;
	}

	public String getOfferType() {
		return offerType;
	}

	public void setOfferType(String offerType) {
		this.offerType = offerType;
	}
	
	public String getShipmentMode() {
		return shipmentMode;
	}

	public void setShipmentMode(String shipmentMode) {
		this.shipmentMode = shipmentMode;
	}
	
	public String getContractStatus() {
		return contractStatus;
	}

	public void setContractStatus(String contractStatus) {
		this.contractStatus = contractStatus;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}
	
	
	public String getContractRefNo() {
		return contractRefNo;
	}

	public void setContractRefNo(String contractRefNo) {
		this.contractRefNo = contractRefNo;
	}
	
	public String getBasisPrice() {
		return basisPrice;
	}

	public void setBasisPrice(String basisPrice) {
		this.basisPrice = basisPrice;
	}
	
	public String getFutureInstrument() {
		return futureInstrument;
	}

	public void setFutureInstrument(String futureInstrument) {
		this.futureInstrument = futureInstrument;
	}
	
	public String getPriceMonth() {
		return priceMonth;
	}

	public void setPriceMonth(String priceMonth) {
		this.priceMonth = priceMonth;
	}
	
	public String getBasisPriceUnit() {
		return basisPriceUnit;
	}

	public void setBasisPriceUnit(String basisPriceUnit) {
		this.basisPriceUnit = basisPriceUnit;
	}
		
	public String getPriceFixEarliestBy() {
		return priceFixEarliestBy;
	}

	public void setPriceFixEarliestBy(String priceFixEarliestBy) {
		this.priceFixEarliestBy = priceFixEarliestBy;
	}
		
	public String getPriceFixOption() {
		return priceFixOption;
	}

	public void setPriceFixOption(String priceFixOption) {
		this.priceFixOption = priceFixOption;
	}
	
	public String getPriceFixLatestBy() {
		return priceFixLatestBy;
	}

	public void setPriceFixLatestBy(String priceFixLatestBy) {
		this.priceFixLatestBy = priceFixLatestBy;
	}
		
	public String getPriceFixMethod() {
		return priceFixMethod;
	}

	public void setPriceFixMethod(String priceFixMethod) {
		this.priceFixMethod = priceFixMethod;
	}
	
	public String getShipVesselDetails() {
		return shipVesselDetails;
	}

	public void setShipVesselDetails(String shipVesselDetails) {
		this.shipVesselDetails = shipVesselDetails;
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
	

	@JsonAutoDetect(fieldVisibility = Visibility.ANY)
	public class MDMServiceKeyDetails {

		private String traderName = "userListByRole";
		private String contractType = "contractType";
		private String dealType = "dealType";
		private String cpName = "businessPartnerCombo";
		private String product = "productComboDropDrown";
		private String quality = "qualityComboDropDrown";
		private String itemQuantityUnitId = "physicalproductquantitylist";
		private String contractQuantityUnit = "physicalproductquantitylist";
		private String priceType = "productpricetypelist";
		private String incoTerms = "incoterm";
		private String paymentTerms = "paytermlist_phy";
		private String arbitration = "ContractRulesAndArbitrationList";
		private String strategy = "corporateStrategy";
		private String payInCurrency = "productCurrencyList";
		private String destinationCountry = "countriesComboDataFromDB";
		private String loadingCountry = "countriesComboDataFromDB";
		private String taxScheduleApplicableCountry = "taxScheduleCountrystate";
		private String termsAndConditions = "applicableLaw";
		private String profitCenter = "userProfitCenterList";
		private String loadingType = "incoTermLocationGroupType";
		private String destinationType = "incoTermLocationGroupType";
		private String loadingLocation = "cityComboDataFromDB";
		private String destinationLocation = "cityComboDataFromDB";
		private String taxSchedule = "listOfTaxSchedules";
		private String priceUnitId = "productPriceUnit";
		
		private String origin = "productorigin"; 
		private String cropYear ="cropyearComboDropDrown"; 
		private String futureInstrument ="productDerivativeInstrument";
		private String priceMonth ="periodMonthsListByInstrument";
		private String basisPriceUnit = "productPriceUnit";
		
		public String getTraderName() {
			return traderName;
		}

		public String getContractType() {
			return contractType;
		}

		public String getDealType() {
			return dealType;
		}

		public String getCpName() {
			return cpName;
		}

		public String getProduct() {
			return product;
		}

		public String getQuality() {
			return quality;
		}

		public String getItemQuantityUnitId() {
			return itemQuantityUnitId;
		}
		
		public String getContractQuantityUnit() {
			return contractQuantityUnit;
		}

		public String getPriceType() {
			return priceType;
		}

		public String getIncoTerms() {
			return incoTerms;
		}

		public String getPaymentTerms() {
			return paymentTerms;
		}

		public String getArbitration() {
			return arbitration;
		}

		public String getStrategy() {
			return strategy;
		}

		public String getPayInCurrency() {
			return payInCurrency;
		}
		
		public String getOrigin() {
			return origin;
		}
		public String getCropYear() {
			return cropYear;
		}

		public String getDestinationCountry() {
			return destinationCountry;
		}

		public String getLoadingCountry() {
			return loadingCountry;
		}

		public String getTaxScheduleApplicableCountry() {
			return taxScheduleApplicableCountry;
		}

		public String getTermsAndConditions() {
			return termsAndConditions;
		}

		public String getProfitCenter() {
			return profitCenter;
		}

		public String getLoadingType() {
			return loadingType;
		}

		public String getDestinationType() {
			return destinationType;
		}

		public String getLoadingLocation() {
			return loadingLocation;
		}

		public String getDestinationLocation() {
			return destinationLocation;
		}

		public String getTaxSchedule() {
			return taxSchedule;
		}

		public String getPriceUnitId() {
			return priceUnitId;
		}

		public void setTraderName(String traderName) {
			this.traderName = traderName;
		}

		public void setContractType(String contractType) {
			this.contractType = contractType;
		}

		public void setDealType(String dealType) {
			this.dealType = dealType;
		}

		public void setCpName(String cpName) {
			this.cpName = cpName;
		}

		public void setProduct(String product) {
			this.product = product;
		}

		public void setQuality(String quality) {
			this.quality = quality;
		}

		public void setItemQuantityUnitId(String itemQuantityUnitId) {
			this.itemQuantityUnitId = itemQuantityUnitId;
		}
		
		public void setContractQuantityUnit(String contractQuantityUnit) {
			this.contractQuantityUnit = contractQuantityUnit;
		}

		public void setPriceType(String priceType) {
			this.priceType = priceType;
		}

		public void setIncoTerms(String incoTerms) {
			this.incoTerms = incoTerms;
		}

		public void setPaymentTerms(String paymentTerms) {
			this.paymentTerms = paymentTerms;
		}

		public void setArbitration(String arbitration) {
			this.arbitration = arbitration;
		}

		public void setStrategy(String strategy) {
			this.strategy = strategy;
		}

		public void setPayInCurrency(String payInCurrency) {
			this.payInCurrency = payInCurrency;
		}

		public void setDestinationCountry(String destinationCountry) {
			this.destinationCountry = destinationCountry;
		}

		public void setLoadingCountry(String loadingCountry) {
			this.loadingCountry = loadingCountry;
		}

		public void setTaxScheduleApplicableCountry(String taxScheduleApplicableCountry) {
			this.taxScheduleApplicableCountry = taxScheduleApplicableCountry;
		}

		public void setTermsAndConditions(String termsAndConditions) {
			this.termsAndConditions = termsAndConditions;
		}

		public void setProfitCenter(String profitCenter) {
			this.profitCenter = profitCenter;
		}

		public void setLoadingType(String loadingType) {
			this.loadingType = loadingType;
		}

		public void setDestinationType(String destinationType) {
			this.destinationType = destinationType;
		}

		public void setLoadingLocation(String loadingLocation) {
			this.loadingLocation = loadingLocation;
		}

		public void setDestinationLocation(String destinationLocation) {
			this.destinationLocation = destinationLocation;
		}

		public void setTaxSchedule(String taxSchedule) {
			this.taxSchedule = taxSchedule;
		}

		public void setPriceUnitId(String priceUnitId) {
			this.priceUnitId = priceUnitId;
		}
				
		public String getFutureInstrument() {
			return futureInstrument;
		}
		
		public void setFutureInstrument(String futureInstrument) {
			this.futureInstrument = futureInstrument;
		}

		public String getPriceMonth() {
			return priceMonth;
		}

		public void setPriceMonth(String priceMonth) {
			this.priceMonth = priceMonth;
		}

		public String getBasisPriceUnit() {
			return basisPriceUnit;
		}

		public void setBasisPriceUnit(String basisPriceUnit) {
			this.basisPriceUnit = basisPriceUnit;
		}
		
	}

	@JsonAutoDetect(fieldVisibility = Visibility.ANY)
	public class TRMPayloadKeyDetails {

		private String traderName = "traderUserId";
		private String contractType = "contractType";
		private String dealType = "dealType";
		private String cpName = "cpProfileId";
		private String product = "productId";
		private String quality = "quality";
		private String itemQuantityUnitId = "itemQtyUnitId";
		private String contractQuantityUnit = "totalQtyUnitId";
		private String priceType = "priceTypeId";
		private String incoTerms = "incotermId";
		private String paymentTerms = "paymentTermId";
		private String arbitration = "arbitrationId";
		private String strategy = "strategyAccId";
		private String payInCurrency = "payInCurId";
		private String destinationCountry = "destinationCountryId";
		private String loadingCountry = "originationCountryId";
		private String taxScheduleApplicableCountry = "taxScheduleCountryId";
		private String termsAndConditions = "applicableLawId";
		private String profitCenter = "profitCenterId";
		private String loadingType = "loadingLocationGroupTypeId";
		private String destinationType = "destinationLocationGroupTypeId";
		private String loadingLocation = "originationCityId";
		private String destinationLocation = "destinationCityId";
		private String taxSchedule = "taxScheduleId";
		private String contractIssueDate = "issueDate";
		private String itemNo = "itemNo";
		private String itemQuantity = "itemQty";
		private String tolerance = "tolerance";
		private String toleranceType = "toleranceType";
		private String toleranceLevel = "toleranceLevel";
		private String shipmentMode = "shipmentMode";
		private String deliveryFromDate = "deliveryFromDate";
		private String deliveryToDate = "deliveryToDate";
		private String paymentDueDate = "paymentDueDate";
		private String qualityFinalAt = "qualityFinalAt";
		private String weightFinalAt = "weightFinalAt";
		private String priceDf = "priceDf";
		private String fxBasisToPayin = "fxBasisToPayin";
		private String priceUnitId = "priceUnitId";

		private String cpContractRefNo = "cpRefNo"; 
		private String legalEntity = "legalEntityId";
		private String origin = "originId";
		private String cropYear = "cropYearId";
		private String packingType = "packingTypeId";
		private String packingSize  = "packingSizeId";
		private String periodType = "periodType";
		private String purchaseContractCPName = "purchasecpProfileId";
		private String salesContractCPName = "salescpProfileId";
		private String productSpecs = "productSpecs";
		private String toleranceMin = "toleranceMin";
		private String toleranceMax = "toleranceMax";
		
		private String futureInstrument ="priceContractDefId";
		private String priceMonthText ="priceMonthText"; 
		private String priceMonth ="priceFutureContractId"; 
		private String basisPrice ="basisPrice"; 
		private String basisPriceUnit ="basisPriceUnitId"; 
		private String basisFixedQty ="basisFixedQty"; 
		private String earliestBy ="earliestBy"; 
		private String priceLastFixDayBasedOn ="priceLastFixDayBasedOn"; 
		private String optionsToFix ="optionsToFix"; 
		private String fixationMethod ="fixationMethod"; 
		private String futureInstrumentText ="futureInstrumentText"; 
		private String shipVesselDetails = "shipVesselDetails";
		//Fields to be added later when i get the trmkey
		/*
		private String corporate;
		private double plannedShipmentQuantity;
		private String invoiceDocumentPriceUnit;

		 */
		public String getTraderName() {
			return traderName;
		}

		public String getCpContractRefNo() {
			return cpContractRefNo;
		}

		public String getLegalEntity() {
			return legalEntity;
		}

		public String getOrigin() {
			return origin;
		}

		public String getCropYear() {
			return cropYear;
		}

		public String getPackingType() {
			return packingType;
		}

		public String getPackingSize() {
			return packingSize;
		}

		public String getPeriodType() {
			return periodType;
		}

		public String getContractType() {
			return contractType;
		}

		public String getDealType() {
			return dealType;
		}

		public String getCpName() {
			return cpName;
		}

		public String getProduct() {
			return product;
		}

		public String getQuality() {
			return quality;
		}

		public String getItemQuantityUnitId() {
			return itemQuantityUnitId;
		}
		
		public String getContractQuantityUnit() {
			return contractQuantityUnit;
		}

		public String getPriceType() {
			return priceType;
		}

		public String getIncoTerms() {
			return incoTerms;
		}

		public String getPaymentTerms() {
			return paymentTerms;
		}

		public String getArbitration() {
			return arbitration;
		}

		public String getStrategy() {
			return strategy;
		}

		public String getPayInCurrency() {
			return payInCurrency;
		}

		public String getDestinationCountry() {
			return destinationCountry;
		}

		public String getLoadingCountry() {
			return loadingCountry;
		}

		public String getTaxScheduleApplicableCountry() {
			return taxScheduleApplicableCountry;
		}

		public String getTermsAndConditions() {
			return termsAndConditions;
		}

		public String getProfitCenter() {
			return profitCenter;
		}

		public String getLoadingType() {
			return loadingType;
		}

		public String getDestinationType() {
			return destinationType;
		}

		public String getLoadingLocation() {
			return loadingLocation;
		}

		public String getDestinationLocation() {
			return destinationLocation;
		}

		public String getTaxSchedule() {
			return taxSchedule;
		}

		public String getContractIssueDate() {
			return contractIssueDate;
		}

		public String getItemNo() {
			return itemNo;
		}

		public String getItemQuantity() {
			return itemQuantity;
		}

		public String getTolerance() {
			return tolerance;
		}

		public String getToleranceType() {
			return toleranceType;
		}

		public String getToleranceLevel() {
			return toleranceLevel;
		}

		public String getShipmentMode() {
			return shipmentMode;
		}

		public String getDeliveryFromDate() {
			return deliveryFromDate;
		}

		public String getDeliveryToDate() {
			return deliveryToDate;
		}

		public String getPaymentDueDate() {
			return paymentDueDate;
		}

		public String getQualityFinalAt() {
			return qualityFinalAt;
		}

		public String getWeightFinalAt() {
			return weightFinalAt;
		}

		public String getPriceDf() {
			return priceDf;
		}

		public String getFxBasisToPayin() {
			return fxBasisToPayin;
		}

		public String getPriceUnitId() {
			return priceUnitId;
		}
		
		public String getProductSpecs() {
			return productSpecs;
		}
		
		public String getPurchaseContractCPName() {
			return purchaseContractCPName;
		}
		public String getSalesContractCPName() {
			return salesContractCPName;
		}	
		
		public String getToleranceMin() {
			return toleranceMin;
		}
		public String getToleranceMax() {
			return toleranceMax;
		}
		
		public String getFutureInstrument() {
			return futureInstrument;
		}
		
		public String getPriceMonthText() {
			return priceMonthText;
		}

		public String getPriceMonth() {
			return priceMonth;
		}
		
		public String getBasisPrice() {
			return basisPrice;
		}
		
		public String getBasisPriceUnit() {
			return basisPriceUnit;
		}
		
		public String getBasisFixedQty() {
			return basisFixedQty;
		}
		
		public String getEarliestBy() {
			return earliestBy;
		}
		
		public String getPriceLastFixDayBasedOn() {
			return priceLastFixDayBasedOn;
		}
		
		public String getOptionsToFix() {
			return optionsToFix;
		}
		
		public String getFixationMethod() {
			return fixationMethod;
		}
		
		public String getFutureInstrumentText() {
			return futureInstrumentText;
		}
		
		public String getShipVesselDetails() {
			return shipVesselDetails;
		}
		
	}

}
