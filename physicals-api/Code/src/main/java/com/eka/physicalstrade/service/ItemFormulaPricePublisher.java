package com.eka.physicalstrade.service;

import java.util.ArrayList;
import java.util.List;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.stereotype.Component;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicalstrade.dataobject.RequestContext;

@Component("itemFormulaPricePublisher")
public class ItemFormulaPricePublisher implements DataPublisher {

	private static final Logger logger = ESAPI
			.getLogger(ItemFormulaPricePublisher.class);

	@Override
	public void publish(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {

		List<String> formulaPriceDetails = new ArrayList<>();
		String formulaPriceDetail = null;
		for (ContractItemDetailsDTO contractItemDetailsDTO : contractDetailsDTO
				.getItemDetails()) {
			if ("FormulaPricing".equals(contractItemDetailsDTO.getPricing()
					.getPriceTypeId())) {
				formulaPriceDetail = contractItemDetailsDTO
						.getFormulaPriceDetails();
				if (formulaPriceDetail == null) {
					logger.info(
							Logger.EVENT_FAILURE,
							ESAPI.encoder().encodeForHTML(
									"Formula price details missing for item "
											+ contractItemDetailsDTO
													.getInternalItemRefNo()));
				}
				formulaPriceDetails.add(formulaPriceDetail);
			}
		}
	}
}
