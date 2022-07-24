package com.eka.physicalstrade.service;

import java.util.Date;
import java.util.concurrent.CompletableFuture;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.eka.physicalstrade.util.PricingAPIRestTemplate;
import com.eka.physicalstrade.util.RecommendationRestTemplate;

@Component("apiDataPublisher")
public class APIDataPublisher implements DataPublisher {

	private static final Logger logger = ESAPI
			.getLogger(APIDataPublisher.class);

	@Autowired
	private RecommendationRestTemplate recommendationRestTemplate;

	@Autowired
	private CTRMRestTemplate ctrmRestTemplate;
	
	@Autowired
	PricingAPIRestTemplate pricingAPIRestTemplate;

	@Override
	public void publish(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {

		pushToRecommendationSystem(requestContext, contractDetailsDTO);
		//callExposureUpdateAPI(requestContext, contractDetailsDTO);
		publishExposures(requestContext, contractDetailsDTO);
	}

	private void pushToRecommendationSystem(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {

		CompletableFuture
				.runAsync(() -> {
					try {
						logger.debug(
								Logger.EVENT_SUCCESS,
								ESAPI.encoder()
										.encodeForHTML(
												"Pushing data to recommendation system"));
						recommendationRestTemplate
								.pushContractData(requestContext);
						logger.debug(
								Logger.EVENT_SUCCESS,
								ESAPI.encoder().encodeForHTML(
										"Recommendation API call success"));
					} catch (Exception e) {
						logger.error(
								Logger.EVENT_FAILURE,
								ESAPI.encoder().encodeForHTML(
										"Recommendation API call failure"), e);

					}
				});

	}

	private void callExposureUpdateAPI(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {

		CompletableFuture.runAsync(() -> {
			try {

				logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder()
						.encodeForHTML("Calling Exposure update API call"));

				ctrmRestTemplate.updateContractExposure(requestContext,
						contractDetailsDTO);

				logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder()
						.encodeForHTML("Exposure update API call success"));
			} catch (Exception e) {
				logger.error(Logger.EVENT_FAILURE, ESAPI.encoder()
						.encodeForHTML("Exposure API call failure"), e);
			}
		});

	}
	
	private void publishExposures(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {
		CompletableFuture.runAsync(() -> {
			String ref = contractDetailsDTO.getInternalContractRefNo();
			Date asOf = new Date();
			for(ContractItemDetailsDTO item: contractDetailsDTO.getItemDetails()) {
				try {
					pricingAPIRestTemplate.getPriceForItem(ref, asOf, item, requestContext);
				} catch (Exception e) {
					logger.error(Logger.EVENT_FAILURE, ESAPI.encoder()
							.encodeForHTML("Exposure API call failure for " + item.getInternalItemRefNo()), e);
				}
				
			}
		});
		
	}
}
