package com.eka.physicalstrade.util;

import java.net.SocketTimeoutException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpStatusCodeException;


import com.eka.physicalstrade.error.ConnectError;
import com.eka.physicalstrade.exception.CTRMRestException;
import com.eka.physicalstrade.exception.CTRMRestTemplateException;

/**
 * Utility class for manipulating Rest template request and response
 * 
 * @author srinivasanmurugesan
 *
 */
@Service
public class RestTemplateUtil {

	private static final Logger logger = ESAPI
			.getLogger(RestTemplateUtil.class);
	@Autowired
	CommonValidator validator;
	/**
	 * Method to copy the headers from HttpServletRequest to HttpHeaders
	 * 
	 * @param request
	 * @return
	 */
	public HttpHeaders httpHeadersReplicate(HttpServletRequest request) {
		HttpHeaders headers = new HttpHeaders();
		Enumeration<String> headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			String headerName = headerNames.nextElement();
			headers.set(headerName,validator.cleanData(request.getHeader(headerName)));
		}
		return headers;
	}

	public ResponseEntity<ConnectError> getErrorResponseEntity(
			HttpStatusCodeException exp) {
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Rest call exception handling "
								+ exp.getResponseBodyAsString()));

		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = exp.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(exp.getStatusCode().value());
		connectError.setErrorLocalizedMessage("\"Rest call exception handling  "+ exp.getResponseBodyAsString());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, exp.getStatusCode());
		return responseEntity;
		
	}
	
	@ExceptionHandler(value = { CTRMRestException.class })
	public ResponseEntity<ConnectError> handleCTRMRestException(
			CTRMRestException ctrm) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = ctrm.getStackTrace();
		JSONObject jsonObject = new JSONObject(ctrm.getMessage());
		String error=jsonObject.get("errors").toString();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage(error);
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(
				Logger.EVENT_FAILURE,
				ESAPI.encoder().encodeForHTML("Error in getting CTRM Api"),
				ctrm);
		return responseEntity;
	}
	
	@ExceptionHandler(value = { SocketTimeoutException.class })
	public ResponseEntity<ConnectError> handleSocketTimeoutException(
			SocketTimeoutException ste) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = ste.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Error in connecting to Physicals/Connect server ->"+ste.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(
				Logger.EVENT_FAILURE,
				ESAPI.encoder().encodeForHTML(
						"Error in connecting to Physicals/Connect server"), ste);
		return responseEntity;
	}
	
	@ExceptionHandler(value = { CTRMRestTemplateException.class })
	public ResponseEntity<ConnectError> handlePricingAPIException(
			CTRMRestTemplateException pae) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = pae.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Error in TRM Api");
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(
				Logger.EVENT_FAILURE,
				ESAPI.encoder().encodeForHTML("Error in getting formula price"),
				pae);
		return responseEntity;
	}

	/**
	 * Extracting request headers into map
	 * 
	 * @param request
	 * @return
	 */
	public Map<String, String> getHeadersAsMap(HttpServletRequest request) {

		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Extracting headers map from servlet request"));

		Map<String, String> headers = new HashMap<>();
		Enumeration<String> headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			String headerName = headerNames.nextElement();
			headers.put(headerName, validator.cleanData(request.getHeader(headerName)));
		}
		return headers;

	}

	/**
	 * Creating HttpHeaders from header values from map
	 * 
	 * @param headersMap
	 * @return
	 */
	public HttpHeaders getHttpHeader(Map<String, String> headersMap) {
		HttpHeaders headers = new HttpHeaders();

		headersMap.entrySet().stream().forEach(entry -> {
			headers.add(entry.getKey(), validator.cleanData(entry.getValue()));
		});

		return headers;
	}
}
