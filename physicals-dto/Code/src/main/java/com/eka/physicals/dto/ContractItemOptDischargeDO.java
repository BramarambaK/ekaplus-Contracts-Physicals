package com.eka.physicals.dto;

import java.math.BigDecimal;

public class ContractItemOptDischargeDO {
	private String internalOptDestinationId;
	private String destinationCityId;
	private String destinationCountryId;
	private String dischargePortCountryId;
	private String dischargePortCityId;
	private BigDecimal freightDf;
	private String freightDfPriceUnitId;
	private Boolean optDestInstanceDeleted = false;

	public String getInternalOptDestinationId() {
		return internalOptDestinationId;
	}

	public void setInternalOptDestinationId(String internalOptDestinationId) {
		this.internalOptDestinationId = internalOptDestinationId;
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

	public String getDischargePortCountryId() {
		return dischargePortCountryId;
	}

	public void setDischargePortCountryId(String dischargePortCountryId) {
		this.dischargePortCountryId = dischargePortCountryId;
	}

	public String getDischargePortCityId() {
		return dischargePortCityId;
	}

	public void setDischargePortCityId(String dischargePortCityId) {
		this.dischargePortCityId = dischargePortCityId;
	}

	public String getFreightDfPriceUnitId() {
		return freightDfPriceUnitId;
	}

	public void setFreightDfPriceUnitId(String freightDfPriceUnitId) {
		this.freightDfPriceUnitId = freightDfPriceUnitId;
	}

	public BigDecimal getFreightDf() {
		return freightDf;
	}

	public void setFreightDf(BigDecimal freightDf) {
		this.freightDf = freightDf;
	}

	public Boolean getOptDestInstanceDeleted() {
		return optDestInstanceDeleted;
	}

	public void setOptDestInstanceDeleted(Boolean optDestInstanceDeleted) {
		this.optDestInstanceDeleted = optDestInstanceDeleted;
	}
}
