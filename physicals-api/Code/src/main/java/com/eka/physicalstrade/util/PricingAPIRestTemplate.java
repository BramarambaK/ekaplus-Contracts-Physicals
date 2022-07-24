package com.eka.physicalstrade.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicalstrade.dataobject.FormulaPriceContract;
import com.eka.physicalstrade.dataobject.FormulaPricingRequest;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.exception.ErrorMessage;
import com.eka.physicalstrade.exception.PricingAPIException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Rest template for accessing Pricing APIs
 * 
 * @author srinivasanmurugesan
 *
 */
@Service
public class PricingAPIRestTemplate {

	private static final Logger logger = ESAPI
			.getLogger(PricingAPIRestTemplate.class);

	@Value("${pricing.price.api.url}")
	private String PRICING_API_HOST;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public RestTemplateUtil restTemplateUtil;

	/**
	 * Get price for contract
	 * 
	 * @param request
	 * @return
	 */
	@Async
	public CompletableFuture<String> getPriceForItem(String _id, Date asOfDate,
			ContractItemDetailsDTO contractItemDetailsDTO,
			RequestContext requestContext) {

		FormulaPricingRequest formulaPricingRequest = getFormulaPricingRequest(
				_id, asOfDate, contractItemDetailsDTO);

		int itemNo = contractItemDetailsDTO.getItemNo();
		String priceData = null;
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Post : URL " + PRICING_API_HOST));
		HttpHeaders headers = restTemplateUtil.getHttpHeader(requestContext
				.getHeaders());

		HttpEntity<FormulaPricingRequest> httpEntity = new HttpEntity<>(
				formulaPricingRequest, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder()
						.encodeForHTML("Request " + _id + " : " + itemNo));
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(PRICING_API_HOST,
					HttpMethod.POST, httpEntity, String.class);
			priceData = responseEntity.getBody();
		} catch (HttpClientErrorException httpClientErrorException) {
			ErrorMessage errorMessage = getErrorMessage(httpClientErrorException);
			throw new PricingAPIException(errorMessage.getDescription(), itemNo);

		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new PricingAPIException(e.getMessage(), itemNo);
		}
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Got pricing data " + _id + " : " + itemNo));
		contractItemDetailsDTO.setFormulaPriceDetails(priceData);

		return CompletableFuture.completedFuture(priceData);

	}

	private ErrorMessage getErrorMessage(
			HttpClientErrorException httpClientErrorException) {

		logger.error(
				Logger.EVENT_FAILURE,
				ESAPI.encoder().encodeForHTML(
						"Error in getting formula price details"),
				httpClientErrorException);

		String responseString = httpClientErrorException
				.getResponseBodyAsString();

		ObjectMapper om = new ObjectMapper();
		ErrorMessage errorMessage = new ErrorMessage();
		try {
			errorMessage = om.readValue(responseString, ErrorMessage.class);
		} catch (IOException e) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error while parsing pricing error message"),
					httpClientErrorException);
			errorMessage.setDescription(PricingAPIException.message);
		}
		return errorMessage;
	}

	private FormulaPricingRequest getFormulaPricingRequest(String _id,
			Date asOfDate, ContractItemDetailsDTO contractItemDetailsDTO) {

		FormulaPricingRequest formulaPricingRequest = new FormulaPricingRequest();
		FormulaPriceContract formulaPriceContract = new FormulaPriceContract();
		List<ContractItemDetailsDTO> contractItemDetailsDTOs = new ArrayList<>();
		contractItemDetailsDTOs.add(contractItemDetailsDTO);
		formulaPriceContract.setRefNo(_id);
		formulaPriceContract.setItemDetails(contractItemDetailsDTOs);
		formulaPriceContract.setAsOfDate(asOfDate);
		formulaPricingRequest.setContract(formulaPriceContract);
		return formulaPricingRequest;
	}

}
