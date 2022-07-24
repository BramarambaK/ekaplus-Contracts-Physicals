package com.eka.physicalstrade.util;

import java.io.IOException;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.dataobject.CreditCheckRequest;
import com.eka.physicalstrade.dataobject.CreditCheckResponse;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.exception.CreditRiskAPIException;
import com.eka.physicalstrade.exception.ErrorMessage;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Rest template for accessing Credit Risk APIs
 * 
 * @author srinivasanmurugesan
 *
 */
@Service
public class CreditRiskAPIRestTemplate {

	private static final Logger logger = ESAPI.getLogger(CreditRiskAPIRestTemplate.class);

	@Value("${credit.risk.api.url}")
	private String CREDIT_RISK_API_HOST;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public RestTemplateUtil restTemplateUtil;

	/**
	 * Counterparty Credit check
	 * 
	 * @param request
	 * @return
	 */
	public CreditCheckResponse checkCPCredit(CreditCheckRequest creditCheckRequest) {

		CreditCheckResponse creditCheckResponse = null;
		RequestContext requestContext = RequestContextHolder.getCurrentContext();

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Post : URL " + CREDIT_RISK_API_HOST));
		HttpHeaders headers = restTemplateUtil.getHttpHeader(requestContext.getHeaders());

		HttpEntity<CreditCheckRequest> httpEntity = new HttpEntity<>(creditCheckRequest, headers);
		ResponseEntity<CreditCheckResponse> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(CREDIT_RISK_API_HOST, HttpMethod.POST, httpEntity,
					CreditCheckResponse.class);
			creditCheckResponse = responseEntity.getBody();
		} catch (HttpClientErrorException httpClientErrorException) {
			ErrorMessage errorMessage = getErrorMessage(httpClientErrorException);
			throw new CreditRiskAPIException(errorMessage.getDescription(), creditCheckRequest.getCounterParty());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new CreditRiskAPIException(e.getMessage(), creditCheckRequest.getCounterParty());
		}

		return creditCheckResponse;

	}

	private ErrorMessage getErrorMessage(HttpClientErrorException httpClientErrorException) {

		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error while calling credit check api"),
				httpClientErrorException);

		String responseString = httpClientErrorException.getResponseBodyAsString();

		ObjectMapper om = new ObjectMapper();
		ErrorMessage errorMessage = new ErrorMessage();
		try {
			errorMessage = om.readValue(responseString, ErrorMessage.class);
		} catch (IOException e) {
			logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error while calling credit check api"),
					httpClientErrorException);
			errorMessage.setDescription(CreditRiskAPIException.message);
		}
		return errorMessage;
	}

}
