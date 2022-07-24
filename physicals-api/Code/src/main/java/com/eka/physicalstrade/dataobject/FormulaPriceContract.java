package com.eka.physicalstrade.dataobject;

import java.util.Date;
import java.util.List;

import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicals.util.DateDeserializer;
import com.eka.physicals.util.DateSerializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

public class FormulaPriceContract {
	private String refNo;
	@JsonSerialize(using = DateSerializer.class)
	@JsonDeserialize(using = DateDeserializer.class)
	private Date asOfDate;
	private List<ContractItemDetailsDTO> itemDetails;

	public String getRefNo() {
		return refNo;
	}

	public void setRefNo(String refNo) {
		this.refNo = refNo;
	}

	public Date getAsOfDate() {
		return asOfDate;
	}

	public void setAsOfDate(Date asOfDate) {
		this.asOfDate = asOfDate;
	}

	public List<ContractItemDetailsDTO> getItemDetails() {
		return itemDetails;
	}

	public void setItemDetails(List<ContractItemDetailsDTO> itemDetails) {
		this.itemDetails = itemDetails;
	}
}
