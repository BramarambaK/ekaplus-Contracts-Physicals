package com.eka.physicalstrade.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.eka.physicals.dto.ContractEntity;
import com.eka.physicals.dto.ContractItemsEntity;
import com.eka.physicalstrade.exception.CTRMRestException;
import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("/api/physicalstrade")
@JsonIgnoreProperties(ignoreUnknown = true)
public class BulkTradeManagement {

	private static final Logger logger = ESAPI.getLogger(BulkTradeManagement.class);
	
	@Autowired
	private CTRMRestTemplate ctrmRestTemplate;
	
	private static final String BULKCONTRACTTYPE = "header/bulk";
	
	private static final String BULKCONTRACTITEMTYPE = "item/bulk";
	
	@ApiOperation(value = "Bulk Amendment Contract")
	@PutMapping(value = "/contract/header/bulk")
	public @ResponseBody ResponseEntity<String> contractBulkAmendment(@RequestBody List<ContractEntity> contractEntityList,
			HttpServletRequest request) throws JSONException, CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Bulk Contract Amendment - Initiated"));

		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.bulkContractOperation(request, BULKCONTRACTTYPE, contractEntityList,
				HttpMethod.PUT);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract is - amended in CTRM"));

		return response;
	}
	
	
	@ApiOperation(value = "Bulk Amendment Contract Item")
	@PutMapping(value = "/contract/item/bulk")
	public @ResponseBody ResponseEntity<String> contractItemBulkAmendment(@RequestBody List<ContractItemsEntity> contractEntityList,
			HttpServletRequest request) throws JSONException, CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Bulk Contract Item Amendment - Initiated"));

		//delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.bulkContractItemOperation(request, BULKCONTRACTITEMTYPE, contractEntityList,
				HttpMethod.PUT);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract item level is - amended in CTRM"));

		return response;
	}
	
}
