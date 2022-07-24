package com.eka.physicalstrade.service;

import java.util.concurrent.CompletableFuture;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicalstrade.dataobject.ContractDataResponse;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;

@Component
public class AsyncDataPublisher {

	private static final Logger logger = ESAPI
			.getLogger(AsyncDataPublisher.class);

	@Autowired
	@Qualifier("apiDataPublisher")
	private APIDataPublisher apiDataPublisher;

	@Autowired
	@Qualifier("formulaPriceItemProducer")
	private FormulaPriceItemProducer formulaPriceItemProducer;

	public void publish(ContractDataResponse contractDataResponse) {
		RequestContext requestContext = RequestContextHolder
				.getCurrentContext();

		ContractDetailsDTO contractDetailsDTO = contractDataResponse
				.getContractDetails();

		CompletableFuture.runAsync(() -> {
			logger.debug(
					Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML(
							"Publishing contract data asynchronously "));
			apiDataPublisher.publish(requestContext, contractDetailsDTO);

			formulaPriceItemProducer
					.publish(requestContext, contractDetailsDTO);

			logger.debug(
					Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML(
							"Published contract data asynchronously "));
		});

		ContractDetailsDTO secondLegContractDetailsDTO = contractDataResponse
				.getSecondLegContractDetails();

		if (secondLegContractDetailsDTO != null) {

			CompletableFuture
					.runAsync(() -> {
						logger.debug(
								Logger.EVENT_SUCCESS,
								ESAPI.encoder()
										.encodeForHTML(
												"Publishing second leg contract data asynchronously "));
						apiDataPublisher.publish(requestContext,
								secondLegContractDetailsDTO);

						formulaPriceItemProducer.publish(requestContext,
								secondLegContractDetailsDTO);

						logger.debug(
								Logger.EVENT_SUCCESS,
								ESAPI.encoder()
										.encodeForHTML(
												"Published  second leg contract data asynchronously "));
					});
		}
	}
}
