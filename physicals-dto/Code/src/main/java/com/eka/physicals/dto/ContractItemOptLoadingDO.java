package com.eka.physicals.dto;

import java.math.BigDecimal;

public class ContractItemOptLoadingDO {

	private String internalOptOriginationId;
	private String originationCityId;
	private String originationCountryId;
	private String loadingPortCountryId;
	private String loadingPortCityId;
	private BigDecimal freightDf;
	private String freightDfPriceUnitId;
	private Boolean optOriginInstanceDeleted = false;

	public String getInternalOptOriginationId() {
		return internalOptOriginationId;
	}

	public void setInternalOptOriginationId(String internalOptOriginationId) {
		this.internalOptOriginationId = internalOptOriginationId;
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

	public String getLoadingPortCountryId() {
		return loadingPortCountryId;
	}

	public void setLoadingPortCountryId(String loadingPortCountryId) {
		this.loadingPortCountryId = loadingPortCountryId;
	}

	public String getLoadingPortCityId() {
		return loadingPortCityId;
	}

	public void setLoadingPortCityId(String loadingPortCityId) {
		this.loadingPortCityId = loadingPortCityId;
	}

	public BigDecimal getFreightDf() {
		return freightDf;
	}

	public void setFreightDf(BigDecimal freightDf) {
		this.freightDf = freightDf;
	}

	public String getFreightDfPriceUnitId() {
		return freightDfPriceUnitId;
	}

	public void setFreightDfPriceUnitId(String freightDfPriceUnitId) {
		this.freightDfPriceUnitId = freightDfPriceUnitId;
	}

	public Boolean getOptOriginInstanceDeleted() {
		return optOriginInstanceDeleted;
	}

	public void setOptOriginInstanceDeleted(Boolean optOriginInstanceDeleted) {
		this.optOriginInstanceDeleted = optOriginInstanceDeleted;
	}

}
