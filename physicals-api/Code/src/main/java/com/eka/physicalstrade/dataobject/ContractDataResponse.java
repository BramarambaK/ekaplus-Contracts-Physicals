package com.eka.physicalstrade.dataobject;

import com.eka.physicals.dto.ContractDetailsDTO;

public class ContractDataResponse {

	private ContractDetailsDTO contractDetails;
	// EPC-2931, EPC-3215
	// for Inter-company & Intra-company deal
	private ContractDetailsDTO secondLegContractDetails;

	public ContractDetailsDTO getContractDetails() {
		return contractDetails;
	}

	public void setContractDetails(ContractDetailsDTO contractDetails) {
		this.contractDetails = contractDetails;
	}

	public ContractDetailsDTO getSecondLegContractDetails() {
		return secondLegContractDetails;
	}

	public void setSecondLegContractDetails(
			ContractDetailsDTO secondLegContractDetails) {
		this.secondLegContractDetails = secondLegContractDetails;
	}

}
