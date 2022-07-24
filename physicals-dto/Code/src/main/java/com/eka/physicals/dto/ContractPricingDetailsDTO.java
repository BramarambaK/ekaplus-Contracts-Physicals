package com.eka.physicals.dto;

import java.math.BigDecimal;

public class ContractPricingDetailsDTO {

	private String priceTypeId;
	private String pricingFormulaId;
	private BigDecimal priceDf;
	private String priceUnitId;
	private String priceUnit;
	private BigDecimal fxRate;
	private BigDecimal differentialPrice;
	private String differentialPriceUnit;
	// price month
	private String priceFutureContractId;
	private BigDecimal basisPrice;
	private String basisPriceUnitId;
	private BigDecimal basisFixedQty;
	private BigDecimal futurePrice;
	private String futurePriceUnitId;
	private BigDecimal futuresFixedQty;
	private BigDecimal fxBasisToPayin;
	private BigDecimal fxInstToBasis;
	private String priceString;
	private String priceMonthText;

	//EPC-1851
	private String pricingStrategy;
	
	public String getPriceTypeId() {
		return priceTypeId;
	}

	public void setPriceTypeId(String priceTypeId) {
		this.priceTypeId = priceTypeId;
	}

	public String getPricingFormulaId() {
		return pricingFormulaId;
	}

	public void setPricingFormulaId(String pricingFormulaId) {
		this.pricingFormulaId = pricingFormulaId;
	}

	public BigDecimal getPriceDf() {
		return priceDf;
	}

	public void setPriceDf(BigDecimal priceDf) {
		this.priceDf = priceDf;
	}

	public String getPriceUnitId() {
		return priceUnitId;
	}

	public void setPriceUnitId(String priceUnitId) {
		this.priceUnitId = priceUnitId;
	}

	public String getPriceUnit() {
		return priceUnit;
	}

	public void setPriceUnit(String priceUnit) {
		this.priceUnit = priceUnit;
	}

	public BigDecimal getFxRate() {
		return fxRate;
	}

	public void setFxRate(BigDecimal fxRate) {
		this.fxRate = fxRate;
	}

	public BigDecimal getDifferentialPrice() {
		return differentialPrice;
	}

	public void setDifferentialPrice(BigDecimal differentialPrice) {
		this.differentialPrice = differentialPrice;
	}

	public String getDifferentialPriceUnit() {
		return differentialPriceUnit;
	}

	public void setDifferentialPriceUnit(String differentialPriceUnit) {
		this.differentialPriceUnit = differentialPriceUnit;
	}

	public String getPriceFutureContractId() {
		return priceFutureContractId;
	}

	public void setPriceFutureContractId(String priceFutureContractId) {
		this.priceFutureContractId = priceFutureContractId;
	}

	public BigDecimal getBasisPrice() {
		return basisPrice;
	}

	public void setBasisPrice(BigDecimal basisPrice) {
		this.basisPrice = basisPrice;
	}

	public String getBasisPriceUnitId() {
		return basisPriceUnitId;
	}

	public void setBasisPriceUnitId(String basisPriceUnitId) {
		this.basisPriceUnitId = basisPriceUnitId;
	}

	public BigDecimal getBasisFixedQty() {
		return basisFixedQty;
	}

	public void setBasisFixedQty(BigDecimal basisFixedQty) {
		this.basisFixedQty = basisFixedQty;
	}

	public BigDecimal getFuturePrice() {
		return futurePrice;
	}

	public void setFuturePrice(BigDecimal futurePrice) {
		this.futurePrice = futurePrice;
	}

	public String getFuturePriceUnitId() {
		return futurePriceUnitId;
	}

	public void setFuturePriceUnitId(String futurePriceUnitId) {
		this.futurePriceUnitId = futurePriceUnitId;
	}

	public BigDecimal getFuturesFixedQty() {
		return futuresFixedQty;
	}

	public void setFuturesFixedQty(BigDecimal futuresFixedQty) {
		this.futuresFixedQty = futuresFixedQty;
	}

	public BigDecimal getFxBasisToPayin() {
		return fxBasisToPayin;
	}

	public void setFxBasisToPayin(BigDecimal fxBasisToPayin) {
		this.fxBasisToPayin = fxBasisToPayin;
	}

	public BigDecimal getFxInstToBasis() {
		return fxInstToBasis;
	}

	public void setFxInstToBasis(BigDecimal fxInstToBasis) {
		this.fxInstToBasis = fxInstToBasis;
	}

	public String getPriceString() {
		return priceString;
	}

	public void setPriceString(String priceString) {
		this.priceString = priceString;
	}

	public String getPriceMonthText() {
		return priceMonthText;
	}

	public void setPriceMonthText(String priceMonthText) {
		this.priceMonthText = priceMonthText;
	}

	public String getPricingStrategy() {
		return pricingStrategy;
	}

	public void setPricingStrategy(String pricingStrategy) {
		this.pricingStrategy = pricingStrategy;
	}

	
}
