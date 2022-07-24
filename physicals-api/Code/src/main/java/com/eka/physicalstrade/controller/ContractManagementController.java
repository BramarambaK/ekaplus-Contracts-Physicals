package com.eka.physicalstrade.controller;

import java.net.SocketTimeoutException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import com.eka.physicals.dto.CancelContract;
import com.eka.physicals.dto.ContractApprovalDTO;
import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.dataobject.APIResponse;
import com.eka.physicalstrade.dataobject.ContractDataResponse;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.error.ConnectError;
import com.eka.physicalstrade.exception.CTRMRestException;
import com.eka.physicalstrade.exception.CTRMRestTemplateException;
import com.eka.physicalstrade.exception.CloneObjectDataNotFoundException;
import com.eka.physicalstrade.exception.ConnectException;
import com.eka.physicalstrade.exception.ContractDataParsingException;
import com.eka.physicalstrade.exception.ContractNotFoundException;
import com.eka.physicalstrade.exception.ContractOperationNotAllowed;
import com.eka.physicalstrade.exception.ContractProcessingException;
import com.eka.physicalstrade.exception.CreditRiskAPIException;
import com.eka.physicalstrade.exception.DuplicateRecordException;
import com.eka.physicalstrade.exception.PricingAPIException;
import com.eka.physicalstrade.service.AsyncDataPublisher;
import com.eka.physicalstrade.service.ContractManagementService;
import com.eka.physicalstrade.service.CreditCheckService;
import com.eka.physicalstrade.service.FormulaPriceItemProducer;
import com.eka.physicalstrade.service.FormulaPriceManagementService;
import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.eka.physicalstrade.util.ConnectRestTemplate;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.core.JsonProcessingException;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

/**
 * Controller class which contains JSON REST APIs for contract operations
 * 
 * @author srinivasanmurugesan
 *
 */
@RestController
@Api(tags = { "Contract Management" }, description = "APIs to manage Contract operations")
public class ContractManagementController {

	private static final Logger logger = ESAPI.getLogger(ContractManagementController.class);
	@Autowired
	private ConnectRestTemplate connectRestTemplate;

	@Autowired
	private CTRMRestTemplate ctrmRestTemplate;

	@Autowired
	private AsyncDataPublisher asyncDataPublisher;

	@Autowired
	public ContractManagementService contractManagementService;
	@Autowired
	public FormulaPriceItemProducer formulaPriceItemProducer;
	@Autowired
	public FormulaPriceManagementService formulaPriceManagementService;
	@Autowired
	private CreditCheckService creditCheckService;


	/**
	 * Rest API to generate random id on contract creation. Id would be used for
	 * saving contract data in Connect App.
	 * 
	 * @return
	 * @throws JsonProcessingException
	 */
	@ApiOperation(value = "Save blank (initial) contract details in Eka-Connect")
	@PostMapping(value = "/contract/draft/autosave/initial")
	public ResponseEntity<String> initializeContractAutosave(HttpServletRequest request)
			throws JsonProcessingException {
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("New contract - auto save creation initiated"));
		// initializing the default contract data. this is required for UI
		String initialContractData = "{\"itemDetails\":[],\"contractState\":\"autoSave\"}";
		ResponseEntity<String> response = connectRestTemplate.postData(request, initialContractData,
				GlobalConstants.TYPE_DRAFT);
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("New contract - auto save created"));

		return response;
	}

	/**
	 * Rest API to get the contract draft details based on id.
	 * 
	 * @param request
	 * @param id
	 * @return
	 */
	@ApiOperation("Get auto saved contract draft by Id")
	@GetMapping(value = "/contract/draft/autosave")
	public @JsonRawValue ResponseEntity<String> getAutoSaveDraftById(HttpServletRequest request,
			@RequestParam(required = true) String id) {

		ResponseEntity<String> contractData = connectRestTemplate.getData(id, request);
		return contractData;

	}

	/**
	 * Rest API to get the latest autosave contract details
	 * 
	 * @param request
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	@ApiOperation("Get latest auto saved contract data")
	@GetMapping(value = "/contract/autosave/latest")
	public @JsonRawValue ResponseEntity<ContractDetailsDTO> getLatestAutoSavedContractData(HttpServletRequest request)
			throws JSONException {
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Get latest autosaved contract data"));
		Map<String, String> queryParams = new HashMap<>();
		queryParams.put("contractState", "autoSave");
		RequestContext requestContext = RequestContextHolder.getCurrentContext();
		if (requestContext != null && requestContext.getTokenData() != null) {
			queryParams.put("userId", String.valueOf(requestContext.getTokenData().getId()));
		}
		String payload = latestQueryPayload();
		List<ContractDetailsDTO> contractDetails = connectRestTemplate.getData(request, queryParams, payload);
		ContractDetailsDTO contractDetailsDTO = null;
		ResponseEntity<ContractDetailsDTO> responseEntity = null;
		if (contractDetails != null && contractDetails.size() > 0) {
			contractDetailsDTO = contractDetails.get(0);
			responseEntity = new ResponseEntity<ContractDetailsDTO>(contractDetailsDTO, HttpStatus.OK);
		}
		if (contractDetailsDTO == null) {
			responseEntity = new ResponseEntity<ContractDetailsDTO>(contractDetailsDTO, HttpStatus.NOT_FOUND);
		}
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Get latest autosaved contract data completed"));
		return responseEntity;
	}

	/**
	 * Rest API to get the latest autosave contract details
	 * 
	 * @param request
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	@ApiOperation("Get latest contract details of the user")
	@GetMapping(value = "/contract/latest")
	public @JsonRawValue ResponseEntity<ContractDetailsDTO> getLatestContractData(HttpServletRequest request)
			throws JSONException {
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Get latest autosaved contract data"));
		Map<String, String> queryParams = new HashMap<>();
		RequestContext requestContext = RequestContextHolder.getCurrentContext();
		if (requestContext != null && requestContext.getTokenData() != null) {
			queryParams.put("userId", String.valueOf(requestContext.getTokenData().getId()));
		}
		String payload = latestQueryPayload();
		List<ContractDetailsDTO> contractDetails = connectRestTemplate.getData(request, queryParams, payload);
		ResponseEntity<ContractDetailsDTO> responseEntity = null;
		ContractDetailsDTO contractDetailsDTO = null;
		if (contractDetails != null && contractDetails.size() > 0) {
			contractDetailsDTO = contractDetails.get(0);
			responseEntity = new ResponseEntity<ContractDetailsDTO>(contractDetailsDTO, HttpStatus.OK);
		}
		if (contractDetailsDTO == null) {
			responseEntity = new ResponseEntity<ContractDetailsDTO>(contractDetailsDTO, HttpStatus.NOT_FOUND);
		}
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Get latest contract data completed"));
		return responseEntity;
	}

	/**
	 * Rest API to update contract draft
	 * 
	 * @param id
	 * @param contractData
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Update contract draft")
	@PutMapping(value = "/contract/draft/autosave")
	public ResponseEntity<String> updateContractDraftAutoSave(@RequestParam String id, @RequestBody String contractData,
			HttpServletRequest request) {

		ResponseEntity<String> response = connectRestTemplate.putData(request, contractData, id);
		return response;
	}

	/**
	 * Rest API to create contract
	 * 
	 * @param contractDetailsDTO
	 * @param request
	 * @return
	 * @throws JSONException
	 * @throws CTRMRestException
	 * @throws ContractDataParsingException
	 * @throws CloneObjectDataNotFoundException
	 * @throws ContractProcessingException 
	 */
	@ApiOperation(value = "Create contract")
	@PostMapping(value = "/contract")
	public @ResponseBody ResponseEntity<APIResponse> createContract(@RequestBody ContractDetailsDTO contractDetailsDTO,
			HttpServletRequest request) throws JSONException, CTRMRestException, CloneObjectDataNotFoundException,
			ContractDataParsingException, ContractProcessingException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract creation - Initiated"));

		// saving it in connect DB
		connectRestTemplate.putData(request, contractDetailsDTO);

		// Populate Formula price for Items with pricingType as FormulaPricing
		formulaPriceManagementService.populateFormulaPriceDetails(request, contractDetailsDTO);

		creditCheckService.doCPCreditCheck(contractDetailsDTO);
		
		// delegate to CTRM
		APIResponse trmAPIResponse = ctrmRestTemplate.contractOperationWithTRMResponse(request,
				GlobalConstants.TYPE_TRADE, contractDetailsDTO, HttpMethod.POST);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract creation - Created in CTRM"));

		// update connect with CTRM reference detail
		contractDetailsDTO.setContractState(GlobalConstants.TYPE_TRADE);
		ContractDataResponse contractDataResponse = contractManagementService.updateContractInConnect(request,
				contractDetailsDTO, trmAPIResponse,false);
		//cancelContractOnConnectFailure(request, contractDataResponse.getContractDetails());
		publishContractData(request, contractDataResponse);
		ResponseEntity<APIResponse> apiResponse = this.prepareConnectSuccessResponse(contractDataResponse);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract creation - Created in Eka-Connect"));

		return apiResponse;
	}

	private void cancelContractOnConnectFailure(HttpServletRequest request, ContractDetailsDTO trmContractDetailsDTO)
			throws CTRMRestException {

		if (trmContractDetailsDTO != null && !StringUtils.isEmpty(trmContractDetailsDTO.getInternalContractRefNo())) {
			try {
				LocalDateTime now = LocalDateTime.now();
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
				String todaysDate = now.format(formatter);

				CancelContract cancelContract = new CancelContract();
				cancelContract.setCancellationDate(todaysDate);
				cancelContract.setInternalContractRefNo(trmContractDetailsDTO.getInternalContractRefNo());
				cancelContract.setReasonToCancel("Failed to Sync");
				cancelContract(cancelContract, request);
			} catch (JSONException e) {
				logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in cancelling contract"), e);

			}
		}

	}

	@ApiOperation(value = "Cancel contract")
	@PostMapping(value = "/contract/cancel")
	public @ResponseBody ResponseEntity<String> cancelContract(@RequestBody CancelContract cancelContract,
			HttpServletRequest request) throws JSONException, CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract cancel - Initiated"));

		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.cancelContractOperation(request, "cancel", cancelContract,
				HttpMethod.POST);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract is - Cancelled in CTRM"));

		return response;
	}

	/**
	 * Rest API to create contract
	 * 
	 * @param contractDetailsDTO
	 * @param request
	 * @return
	 * @throws JSONException
	 * @throws CTRMRestException
	 * @throws ContractDataParsingException
	 * @throws CloneObjectDataNotFoundException
	 * @throws ContractProcessingException 
	 */
	@ApiOperation(value = "Edit contract")
	@PutMapping(value = "/contract")
	public @ResponseBody ResponseEntity<APIResponse> editContract(@RequestBody ContractDetailsDTO contractDetailsDTO,
			HttpServletRequest request) throws JSONException, CTRMRestException, CloneObjectDataNotFoundException,
			ContractDataParsingException, ContractProcessingException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract update - Initiated"));

		// Populate Formula price for Items with pricingType as FormulaPricing
		formulaPriceManagementService.populateFormulaPriceDetails(request, contractDetailsDTO);

		// delegate to CTRM
		APIResponse trmAPIResponse = ctrmRestTemplate.contractOperationWithTRMResponse(request,
				GlobalConstants.TYPE_TRADE, contractDetailsDTO, HttpMethod.PUT);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract updated in CTRM"));

		contractDetailsDTO.setContractState(GlobalConstants.TYPE_TRADE);
		// update connect with CTRM reference details
		ContractDataResponse contractDataResponse = contractManagementService.updateContractInConnect(request,
				contractDetailsDTO, trmAPIResponse,true);
		//cancelContractOnConnectFailure(request, contractDataResponse.getContractDetails());
		publishContractData(request, contractDataResponse);
		ResponseEntity<APIResponse> apiResponse = this.prepareConnectSuccessResponse(contractDataResponse);
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract updated in Eka-Connect"));

		return apiResponse;
	}

	/**
	 * Rest API to get contract by internalContractRefNo
	 * 
	 * @param contractRefNo
	 * @param request
	 * @return
	 * @throws DuplicateRecordException
	 * @throws ContractNotFoundException
	 * @throws ContractOperationNotAllowed 
	 */
	@ApiOperation(value = "Get contract by contract ref no")
	@GetMapping(value = "/contract")
	public @ResponseBody ResponseEntity<ContractDetailsDTO> getContract(@RequestParam String contractRefNo,
			HttpServletRequest request) throws DuplicateRecordException, ContractNotFoundException, ContractOperationNotAllowed {
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Getting contract data for " + contractRefNo));
		ResponseEntity<ContractDetailsDTO> responseEntity = getContractData(contractRefNo, request);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Contract data retrieved successfully for " + contractRefNo));
		return responseEntity;
	}

	/**
	 * Rest API to get contract from TRM by internalContractRefNo
	 * 
	 * @param contractRefNo
	 * @param request
	 * @return
	 * @throws CTRMRestException
	 * @throws DuplicateRecordException
	 * @throws ContractNotFoundException
	 */
	@ApiOperation(value = "Get contract from TRM by contract ref no")
	@GetMapping(value = "/contract/trm")
	public @ResponseBody ResponseEntity<String> getContractFromTRM(@RequestParam String contractRefNo,
			HttpServletRequest request) throws CTRMRestException {
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Getting contract data from TRM for " + contractRefNo));
		ResponseEntity<String> contractData = ctrmRestTemplate.getContract(request, "trade/trm", contractRefNo);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Contract data retrieved successfully from TRM for " + contractRefNo));
		return contractData;
	}

	private ResponseEntity<ContractDetailsDTO> getContractData(String internalContractRefNo, HttpServletRequest request)
			throws DuplicateRecordException, ContractNotFoundException, ContractOperationNotAllowed {
		
		ResponseEntity<ContractDetailsDTO> responseEntity=null;
		ContractDetailsDTO contractDetailsDTO=contractManagementService.getContractDetails(request, internalContractRefNo);
		
		// assumption is header will be passed only on View of contract
		String contractActionView = request.getHeader(GlobalConstants.X_CONTRACT_ACTION_VIEW);
		if ("Inter_Company".equals(contractDetailsDTO.getDealType())
				&& internalContractRefNo.equals(contractDetailsDTO.getSecondLegInternalContractRefNo())
				&& contractActionView == null) {
			logger.error(Logger.EVENT_FAILURE, ESAPI.encoder()
					.encodeForHTML("Second Leg of Intercompany contract is not allowed for modification/clone "));
			throw new ContractOperationNotAllowed("Second Leg Intercompany Contract not applicable for modification/clone");
		} else if ("Intra_Company".equals(contractDetailsDTO.getDealType())
				&& internalContractRefNo.equals(contractDetailsDTO.getSecondLegInternalContractRefNo())
				&& contractActionView == null) {
			logger.error(Logger.EVENT_FAILURE, ESAPI.encoder()
					.encodeForHTML("Second Leg of Intracompany contract is not allowed for modification/clone "));
			throw new ContractOperationNotAllowed("Second Leg Intracompany Contract not applicable for modification/clone");
		}
		
		responseEntity = new ResponseEntity<>(contractDetailsDTO,HttpStatus.OK);
		return responseEntity;
	}

	/**
	 * Rest API to get all contracts
	 * 
	 * @param contractRefNo
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Get contract all contracts")
	@GetMapping(value = "/contracts")
	public @ResponseBody ResponseEntity<String> getContracts(HttpServletRequest request) {
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract Retrieved for : %s from CTRM"));
		ResponseEntity<String> contractDetails = ctrmRestTemplate.getContractAll(request, GlobalConstants.TYPE_TRADE);

		return contractDetails;
	}

	/**
	 * Rest API to create template
	 * 
	 * @param contractDetailsDTO
	 * @param request
	 * @return
	 * @throws JSONException
	 * @throws CTRMRestException
	 */
	@ApiOperation(value = "Create contract template")
	@PostMapping(value = "/contract/template")
	public @ResponseBody ResponseEntity<String> createContractTemplate(
			@RequestBody ContractDetailsDTO contractDetailsDTO, HttpServletRequest request)
			throws JSONException, CTRMRestException {
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract Template creation - Initiated"));
		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperation(request, GlobalConstants.TYPE_TEMPLATE,
				contractDetailsDTO, HttpMethod.POST);
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract created in CTRM"));

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Updating contract in Connect"));
		// update connect with CTRM reference details
		if (null != response && HttpStatus.OK.equals(response.getStatusCode()) && response.getBody() != null) {
			response = updateContractDataInConnect(request, contractDetailsDTO, GlobalConstants.TYPE_TEMPLATE,
					response);
		}
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract template data updated in connect"));

		return response;
	}

	/**
	 * Rest API to create contract
	 * 
	 * @param contractDetailsDTO
	 * @param request
	 * @return
	 * @throws JSONException
	 * @throws CTRMRestException
	 */
	@ApiOperation(value = "Edit contract")
	@PutMapping(value = "/contract/template")
	public @ResponseBody ResponseEntity<String> editContractTemplate(@RequestBody ContractDetailsDTO contractDetailsDTO,
			HttpServletRequest request) throws JSONException, CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract creation - Initiated"));
		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperation(request, GlobalConstants.TYPE_TEMPLATE,
				contractDetailsDTO, HttpMethod.PUT);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract creation - Created in CTRM"));

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Updating contract in Connect"));
		// update connect with CTRM reference details
		if (null != response && HttpStatus.OK.equals(response.getStatusCode()) && response.getBody() != null) {
			response = updateContractDataInConnect(request, contractDetailsDTO, GlobalConstants.TYPE_TEMPLATE,
					response);

		}
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract template data updated in connect"));

		return response;
	}

	/**
	 * Rest API to get the contract draft details based on id.
	 * 
	 * @param request
	 * @param id
	 * @return
	 * @throws DuplicateRecordException
	 * @throws ContractNotFoundException
	 * @throws ContractOperationNotAllowed 
	 */
	@ApiOperation("Get contract template by Id")
	@GetMapping(value = "/contract/template")
	public @JsonRawValue ResponseEntity<ContractDetailsDTO> getContractTemplate(HttpServletRequest request,
			@RequestParam(required = true) String contractRefNo)
			throws DuplicateRecordException, ContractNotFoundException, ContractOperationNotAllowed {
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Contract Retrieved for : %s from CTRM" + contractRefNo));
		ResponseEntity<ContractDetailsDTO> responseEntity = getContractData(contractRefNo, request);
		return responseEntity;
	}

	/**
	 * Rest API to create contract draft
	 * 
	 * @param contractData
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Create contract draft")
	@PostMapping(value = "/contract/draft/autosave")
	public ResponseEntity<String> createContractDraftAutoSave(@RequestBody String contractData,
			HttpServletRequest request) {
		ResponseEntity<String> response = connectRestTemplate.postData(request, contractData,
				GlobalConstants.TYPE_DRAFT);
		return response;

	}

	/**
	 * Rest API to create contract draft
	 * 
	 * @param contractData
	 * @param request
	 * @return
	 * @throws JSONException
	 * @throws CTRMRestException
	 */
	@ApiOperation(value = "Create contract draft")
	@PostMapping(value = "/contract/draft")
	public @ResponseBody ResponseEntity<String> createContractDraft(@RequestBody ContractDetailsDTO contractDetailsDTO,
			HttpServletRequest request) throws JSONException, CTRMRestException {
		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperation(request, GlobalConstants.TYPE_DRAFT,
				contractDetailsDTO, HttpMethod.POST);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Updating contract in Connect"));
		// update connect with CTRM reference details
		if (null != response && HttpStatus.OK.equals(response.getStatusCode()) && response.getBody() != null) {
			response = updateContractDataInConnect(request, contractDetailsDTO, GlobalConstants.TYPE_DRAFT, response);
		}
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract template data updated in connect"));

		return response;
	}

	/**
	 * Rest API to update contract draft
	 * 
	 * @param id
	 * @param contractData
	 * @param request
	 * @return
	 * @throws JSONException
	 * @throws CTRMRestException
	 */
	@ApiOperation(value = "Update contract draft")
	@PutMapping(value = "/contract/draft")
	public ResponseEntity<String> editContractDraft(@RequestBody ContractDetailsDTO contractDetailsDTO,
			HttpServletRequest request) throws JSONException, CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract Draft update - Initiated"));
		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperation(request, GlobalConstants.TYPE_DRAFT,
				contractDetailsDTO, HttpMethod.PUT);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract Draft update - Updated in CTRM"));
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Updating Draft contract in Connect"));
		// update connect with CTRM reference details
		if (null != response && HttpStatus.OK.equals(response.getStatusCode()) && response.getBody() != null) {
			response = updateContractDataInConnect(request, contractDetailsDTO, GlobalConstants.TYPE_DRAFT, response);

		}
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Contract draft data updated in connect"));

		return response;
	}

	/**
	 * Rest API to delete contract draft
	 * 
	 * @param id
	 * @param contractData
	 * @param request
	 * @return
	 */
	// API not used. Uncomment RequestMapping & change access modifier for
	// enabling API
	// @ApiOperation(value = "Delete contract draft")
	// @DeleteMapping(value = "/contract/draft")
	private ResponseEntity<String> deleteContractDraft(@RequestParam String id, HttpServletRequest request) {

		ResponseEntity<String> response = connectRestTemplate.deleteData(request, id);
		return response;
	}

	/**
	 * Rest API to delete contract tempalte
	 * 
	 * @param id
	 * @param contractData
	 * @param request
	 * @return
	 */
	// @ApiOperation(value = "Delete contract template")
	// @DeleteMapping(value = "/contract/template")
	// API not used. Uncomment RequestMapping & change access modifier for
	// enabling API
	private ResponseEntity<String> deleteContractTemplate(@RequestParam String id, HttpServletRequest request) {

		return ctrmRestTemplate.deleteContract(request, GlobalConstants.TYPE_TEMPLATE, id);
	}

	/**
	 * API to get approval details from master data setup
	 * 
	 * @param viewType
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Get Contract Approval Details for a View Type")
	@PostMapping(value = "/contract/approval")
	public ResponseEntity<ContractApprovalDTO> getContractApprovals(@RequestParam String viewType,
			HttpServletRequest request) {

		return ctrmRestTemplate.getContractApprovalDetails(request, viewType, null);
	}

	/**
	 * API to get approval details for contract ref no
	 * 
	 * @param viewType
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Get Contract Approval Details for a View Type and Contract Ref No")
	@PostMapping(value = "/contract/approval/contract")
	public ResponseEntity<ContractApprovalDTO> getContractApprovals(@RequestParam String viewType,
			@RequestParam String internalContractRefNo, HttpServletRequest request) {

		return ctrmRestTemplate.getContractApprovalDetails(request, viewType, internalContractRefNo);
	}

	/**
	 * API to approve / reject contract
	 * 
	 * @param viewType
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Approve / Reject contract")
	@PostMapping(value = "/contract/approval/manage")
	public ResponseEntity<String> approveRejectContract(@RequestParam String internalContractRefNo,
			@RequestBody ContractApprovalDTO contractApprovalDTO, HttpServletRequest request) {

		return ctrmRestTemplate.approveRejectContract(request, internalContractRefNo, contractApprovalDTO);
	}

	/**
	 * API to get list of contracts
	 * 
	 * @author Ranjan.Jha
	 * @param contractFilter
	 * @param request
	 * @return list of contract objects
	 * @throws CTRMRestException
	 */
	// API not used. Uncomment RequestMapping & change access modifier for
	// enabling API
	// @ApiOperation(value = "List contracts")
	// @PostMapping(value = "/contract/trades")
	private ResponseEntity<String> getContractList(@RequestBody String contractFilter, HttpServletRequest request)
			throws CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Listing contracts - Initiated"));

		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperationHandleAnyRequest(request, "trades",
				contractFilter, HttpMethod.POST);

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Fectching contract list - done in CTRM"));

		return response;

	}

	/**
	 * API to get list of contract items
	 * 
	 * @author Ranjan.Jha
	 * @param contractFilter
	 * @param request
	 * @return list of contract objects
	 * @throws CTRMRestException
	 */
	// API not used. Uncomment RequestMapping & change access modifier for
	// enabling API
	// @ApiOperation(value = "List contract items")
	// @PostMapping(value = "/contract/items")
	public ResponseEntity<String> getContractItemList(@RequestBody String contractFilter, HttpServletRequest request)
			throws CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Listing contract items - Initiated"));

		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperationHandleAnyRequest(request, "items",
				contractFilter, HttpMethod.POST);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Fectching contract item list - done in CTRM"));

		return response;

	}

	/**
	 * API to get list of contracts
	 * 
	 * @author Ranjan.Jha
	 * @param contractFilter
	 * @param request
	 * @return list of contract objects
	 * @throws CTRMRestException
	 */
	// API not used. Uncomment RequestMapping & change access modifier for
	// enabling API
	// @ApiOperation(value = "List contract drafts")
	// @PostMapping(value = "/contract/drafts")
	private ResponseEntity<String> getContractDraftList(@RequestBody String contractFilter, HttpServletRequest request)
			throws CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Listing contracts - Initiated"));

		// delegate to CTRM
		ResponseEntity<String> response = ctrmRestTemplate.contractOperationHandleAnyRequest(request, "drafts",
				contractFilter, HttpMethod.POST);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Fectching contract drafts list - done in CTRM"));

		return response;

	}

	@ApiOperation(value = "Bulk Formula Pricing for all contracts")
	@PostMapping(value = "/contracts/bulkpricing")
	public void processFormulaPriceForAllContracts(HttpServletRequest request) {
		formulaPriceManagementService.processBulkPricing(request);
	}

	@ApiOperation(value = "Push Contract to Kafka")
	@PostMapping(value = "/contract/kafka/push")
	public void pushContractToKafka(HttpServletRequest request, @RequestBody ContractDetailsDTO contractDetailsDTO) {

		RequestContext requestContext = RequestContextHolder.getCurrentContext();
		formulaPriceItemProducer.publish(requestContext, contractDetailsDTO);

	}

	/**
	 * Validate approval level for intercompany transactions
	 * 
	 * @param internalContractRefNo
	 * @param contractApprovalDTO
	 * @param request
	 * @return
	 * @throws CTRMRestException 
	 */
	@ApiOperation(value = "Validate approval levels")
	@PostMapping(value = "/contract/intercompany/approval/validate")
	public ResponseEntity<String> validateIntercompanyUser(HttpServletRequest request) throws CTRMRestException {
		return ctrmRestTemplate.validateIntercompanyUser(request);
	}
	
	private String getContractDataForConnect(ContractDetailsDTO contractDetailsDTO, String ctrmResponse) {
		String contractData = null;

		try {
			JSONObject ctrmResponseJSON = new JSONObject(ctrmResponse);
			JSONObject responseData = ctrmResponseJSON.getJSONObject(GlobalConstants.DATA);

			JSONObject contractDetails = responseData.getJSONObject(GlobalConstants.CONTRACT_DETAILS);

			String updatedContractDetails = contractManagementService.updateContractAdditionalFields(contractDetailsDTO,
					contractDetails.toString());

			JSONObject updatedContractDetailsJSON = new JSONObject(updatedContractDetails);

			updatedContractDetailsJSON.put(GlobalConstants._ID, contractDetailsDTO.get_id());
			updatedContractDetailsJSON.put(GlobalConstants.CONTRACT_STATE, contractDetailsDTO.getContractState());
			contractData = updatedContractDetailsJSON.toString();

		} catch (JSONException e) {
			logger.error(Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML("Error in parsing CTRM response for connect"), e);
		}

		return contractData;
	}

	@ExceptionHandler(value = { ResourceAccessException.class })
	public ResponseEntity<ConnectError> handleResourceAccessException(ResourceAccessException e) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = e.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Error in connecting to Physicals/TRM/Connect server");
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);

		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder()
				.encodeForHTML("Error in connecting to Physicals/TRM/Connect server [" + e.getMessage() + "]"), e);
		return responseEntity;
	}

	@ExceptionHandler(value = { SocketTimeoutException.class })
	public ResponseEntity<ConnectError> handleSocketTimeoutException(SocketTimeoutException ste) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = ste.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Error in connecting to Physicals/Connect server");
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE,
				ESAPI.encoder().encodeForHTML("Error in connecting to Physicals/Connect server"), ste);
		return responseEntity;
	}

	@ExceptionHandler(value = { JSONException.class })
	public ResponseEntity<ConnectError> handleJSONException(JSONException jsone) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = jsone.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Error in parsing JSON data");
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);

		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in parsing JSON data"), jsone);
		return responseEntity;

	}

	@ExceptionHandler(value = { HttpClientErrorException.class })
	public ResponseEntity<ConnectError> handleHttpClientErrorException(
			HttpClientErrorException httpClientErrorException) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = httpClientErrorException.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(httpClientErrorException.getStatusCode().value());
		connectError.setErrorLocalizedMessage(
				"Error in External API call ->" + httpClientErrorException.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, httpClientErrorException.getStatusCode());

		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in external API Call"),
				httpClientErrorException);
		return responseEntity;
	}

	@ExceptionHandler(value = { CTRMRestException.class })
	public ResponseEntity<ConnectError> handleCTRMRestException(CTRMRestException ctrm) {

		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = ctrm.getStackTrace();
		JSONObject jsonObject = null;
		String error = "Error in parsing TRM Error";
		try {
			jsonObject = new JSONObject(ctrm.getMessage());
			error = jsonObject.get("errors").toString();
		} catch (JSONException e) {
		}

		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage(error);
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in getting CTRM Api"));
		return responseEntity;
	}

	@ExceptionHandler(value = { CTRMRestTemplateException.class })
	public ResponseEntity<ConnectError> handlePricingAPIException(CTRMRestTemplateException pae) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = pae.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage(pae.getMessage());
		connectError.setErrorMessage(pae.getMessage());
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in CTRM Api"), pae);
		return responseEntity;
	}

	@ExceptionHandler(value = { DuplicateRecordException.class })
	public ResponseEntity<ConnectError> handleDuplicateRecordException(DuplicateRecordException jsone) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = jsone.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Duplicate Record found exception");
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Duplicate Record found exception"), jsone);
		return responseEntity;
	}

	@ExceptionHandler(value = { ContractNotFoundException.class, ContractOperationNotAllowed.class,
			ContractProcessingException.class, CreditRiskAPIException.class })
	public ResponseEntity<ConnectError> handleContractException(Exception exp) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = exp.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage(exp.getMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML(exp.getMessage()), exp);
		return responseEntity;
	}

	@ExceptionHandler(value = { PricingAPIException.class })
	public ResponseEntity<ConnectError> handlePricingAPIException(PricingAPIException pae) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = pae.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage(pae.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in getting formula price"), pae);
		return responseEntity;
	}

	@ExceptionHandler(value = { ConnectException.class })
	public ResponseEntity<ConnectError> handleConnectException(ConnectException ce) {
		ResponseEntity<ConnectError> responseEntity = null;
		StackTraceElement[] elements = ce.getStackTrace();
		ConnectError connectError = new ConnectError();
		connectError.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		connectError.setErrorLocalizedMessage("Connect Error : "+ce.getLocalizedMessage());
		connectError.setErrorMessage(elements[0]);
		responseEntity = new ResponseEntity<ConnectError>(connectError, HttpStatus.INTERNAL_SERVER_ERROR);
		logger.error(Logger.EVENT_FAILURE, ESAPI.encoder().encodeForHTML("Error in Connect API"), ce);
		return responseEntity;
	}

	private ResponseEntity<String> updateContractDataInConnect(HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTO, String contractState, ResponseEntity<String> response)
			throws JSONException {
		ResponseEntity<String> connnectBasedResponse = null;
		if (null != response && HttpStatus.OK.equals(response.getStatusCode()) && response.getBody() != null) {
			contractDetailsDTO.setContractState(contractState);
			String contractData = getContractDataForConnect(contractDetailsDTO, response.getBody());
			connnectBasedResponse = connectRestTemplate.putData(request, contractData, contractDetailsDTO.get_id());
			if (HttpStatus.OK.equals(connnectBasedResponse.getStatusCode())) {
				connnectBasedResponse = prepareConnectSuccessResponse(contractData);
				//upsert ItemDetails objects in connect
				contractManagementService.upsertItemDetailsData(request, contractData);
			}

		}
		return connnectBasedResponse;
	}

	private void publishContractData(HttpServletRequest httpServletRequest, ContractDataResponse contractDataResponse) {
		asyncDataPublisher.publish(contractDataResponse);
	}

	@Deprecated
	private ResponseEntity<String> prepareConnectSuccessResponse(String connectData) throws JSONException {

		JSONObject connectResponse = new JSONObject();
		JSONObject data = new JSONObject();
		JSONObject connectDataJson = new JSONObject(connectData);
		data.put(GlobalConstants.CONTRACT_DETAILS, connectDataJson);

		connectResponse.put(GlobalConstants.DATA, data);
		connectResponse.put(GlobalConstants.STATUS, "success");
		ResponseEntity<String> connnectBasedResponse = new ResponseEntity<String>(connectResponse.toString(),
				HttpStatus.OK);

		return connnectBasedResponse;
	}

	private ResponseEntity<APIResponse> prepareConnectSuccessResponse(ContractDataResponse contractDataResponse)
			throws JSONException {

		APIResponse trmapiResponse = new APIResponse();
		trmapiResponse.setData(contractDataResponse);
		ResponseEntity<APIResponse> connnectBasedResponse = new ResponseEntity<APIResponse>(trmapiResponse,
				HttpStatus.OK);

		return connnectBasedResponse;
	}

	private String latestQueryPayload() throws JSONException {
		JSONObject payloadJson = new JSONObject();
		payloadJson.put("getLatestData", true);
		return payloadJson.toString();
	}

}
