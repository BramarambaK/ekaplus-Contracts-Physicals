package com.eka.physicalstrade.service;

import java.text.ParseException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;

import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.model.ContractDetails;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.gson.Gson;

@Service
public interface IContractService {
	

	public HttpHeaders getHeaders(HttpServletRequest request);

	ContractDetails saveContracts(ContractDetails datasetDetailsList, RequestContext request);

	ContractDetails saveContract(ContractDetails contractObject, RequestContext requestContext,
			List<Map<String, Object>> serviceKeyList, Map<String, Object> serviceKeyMap, Gson gson,
			String trmContractCreationEndpoint) throws HttpStatusCodeException, HttpClientErrorException,
			RestClientException, ParseException, JsonProcessingException;


	public void storeStatusDetailsInCollection(List<ContractDetails> contractdetailsList,
			RequestContext requestContext) throws HttpStatusCodeException, HttpClientErrorException, RestClientException, ParseException, InterruptedException, ExecutionException;

}
