package com.eka.physicals.dto;

public class ContractItemValuationDTO {

	private String internalItemValuationId;
	private String valuationIncotermId;
	private String valuationCountryId;
	private String valuationCityId;
	private String locGroupTypeId;

	public String getValuationIncotermId() {
		return valuationIncotermId;
	}

	public void setValuationIncotermId(String valuationIncotermId) {
		this.valuationIncotermId = valuationIncotermId;
	}

	public String getValuationCountryId() {
		return valuationCountryId;
	}

	public void setValuationCountryId(String valuationCountryId) {
		this.valuationCountryId = valuationCountryId;
	}

	public String getValuationCityId() {
		return valuationCityId;
	}

	public void setValuationCityId(String valuationCityId) {
		this.valuationCityId = valuationCityId;
	}

	public String getLocGroupTypeId() {
		return locGroupTypeId;
	}

	public void setLocGroupTypeId(String locGroupTypeId) {
		this.locGroupTypeId = locGroupTypeId;
	}

	public String getInternalItemValuationId() {
		return internalItemValuationId;
	}

	public void setInternalItemValuationId(String internalItemValuationId) {
		this.internalItemValuationId = internalItemValuationId;
	}

}
