package com.eka.physicalstrade.controller;

import java.text.ParseException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.error.ConnectError;
import com.eka.physicalstrade.exception.ErrorMessage;
import com.eka.physicalstrade.model.ContractDetails;
import com.eka.physicalstrade.service.IContractService;
import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.eka.physicalstrade.util.CommonValidator;
import com.eka.physicalstrade.util.ContractCreateTemplate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;

import io.swagger.annotations.ApiOperation;


@RestController
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContractController {
	
	@Autowired
	CommonValidator validator;
	
	@Autowired
	private ContractCreateTemplate contractCreateTemplate;

	private static final Logger logger = LoggerFactory.getLogger(ContractController.class);
	
	@ApiOperation("Bulk Contract")
	@PostMapping("/contract/bulk")
	public @ResponseBody ResponseEntity<Object> getContracts(
			HttpServletRequest request) throws HttpClientErrorException, HttpStatusCodeException, RestClientException, JsonProcessingException, ParseException {
		logger.debug("Getting the details from Collections and creating Bulk Contract");
		ResponseEntity<Object> createContract =null;
		 contractCreateTemplate.getContractFromCollection(request);

		return createContract;
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ConnectError> handleExceptions(Exception exception) {

		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = exception.getStackTrace();
		logger.error("Error in General Exception contract creation API : " + validator.cleanData(exception.toString()));

		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Error in General Exception contract creation API ->" +exception.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		return responseEntity;
	}

	@ExceptionHandler(value = { HttpStatusCodeException.class })
	public final ResponseEntity<ConnectError> handleHttpStatusCodeException(HttpStatusCodeException ex) {
		ResponseEntity<ConnectError> responseEntity = null;

		logger.error("HttpStatusCodeException inside contract creation API() -> ", validator.cleanData(ex.toString()));
		StackTraceElement[] elements = ex.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(ex.getStatusCode().value());
		connectError.setErrorLocalizedMessage("HttpStatusCodeException inside contract creation API()->" +ex.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, ex.getStatusCode());
		return responseEntity;
	}

	@ExceptionHandler(value = { HttpClientErrorException.class })
	public final ResponseEntity<ConnectError> handleHttpClientErrorException(HttpClientErrorException exception) {

		ResponseEntity<ConnectError> responseEntity = null;

		logger.error("HttpClientErrorException inside contract creation API() -> ", validator.cleanData(exception.toString()));
		StackTraceElement[] elements = exception.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(exception.getStatusCode().value());
		connectError.setErrorLocalizedMessage("HttpClientErrorException inside contract creation API() ->" +exception.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, exception.getStatusCode());
		return responseEntity;
	}

	@ExceptionHandler(value = { RestClientException.class })
	public ResponseEntity<ConnectError> handleRestClientException(RestClientException exception) {

		ResponseEntity<ConnectError> responseEntity = null;

		logger.error("RestClientException inside contract creation API() -> ", validator.cleanData(exception.toString()));
		StackTraceElement[] elements = exception.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("RestClientException inside contract creation API() -> " +exception.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		return responseEntity;
	}

	@ExceptionHandler(value = { ParseException.class })
	public ResponseEntity<ConnectError> handleParseException(ParseException exception) {
		ResponseEntity<ConnectError> responseEntity = null;

		logger.error("ParseException inside contract creation API() while coverting to formatted dates -> ", validator.cleanData(exception.toString()));
		StackTraceElement[] elements = exception.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("ParseException inside contract creation API() while coverting to formatted dates ->" +exception.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		return responseEntity;
	}

	@ExceptionHandler(value = { JsonProcessingException.class })
	public ResponseEntity<ConnectError> handleJsonProcessingException(JsonProcessingException exception) {
		ResponseEntity<ConnectError> responseEntity = null;

		logger.error("JsonProcessingException inside contract creation API() while mapping to pojo or converting from pogo to map ", validator.cleanData(exception.toString()));
		StackTraceElement[] elements = exception.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("JsonProcessingException inside contract creation API() while mapping to pojo or converting from pogo to map ->"+exception.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		return responseEntity;
	}

}
