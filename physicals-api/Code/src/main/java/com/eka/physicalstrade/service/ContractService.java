package com.eka.physicalstrade.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.model.StatusCollection;
import com.eka.physicalstrade.contract.validator.ContractValidator;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.exception.ConnectException;
import com.eka.physicalstrade.model.ContractDetails;
import com.eka.physicalstrade.property.PhysicalsTradeContractCreationProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

@Service
public class ContractService implements IContractService {

	private static final Logger logger = LoggerFactory.getLogger(ContractService.class);

	@Value("${eka.mdm.endpoint}")
	private String mdmEndpoint;

	@Value("${eka.platform.endpoint}")
	private String platformEndpoint;
	
	@Value("${eka.contract.url}")
	private String connectHost;
	
	@Value("${connect.application}")
	private String connectUDID;
	
	@Autowired
	RestTemplate restTemplate;
	
	@Autowired
	ContractValidator contractValidator;
	
	@Value("${ctrm.host.property.name}")
	private String CTRM_HOST_PROPERTY_NAME;
	
	@Value("${eka_connect_host}")
	private String ekaConnectHost;

	@Autowired
	private PhysicalsTradeContractCreationProperties ptContractCreationProperties;


	private static final String SERVICEKEY = "serviceKey";
	private static final String DEPENDSON = "dependsOn";

	private static final String ITEMDETAILS = "itemDetails";
	private static final String PRICING = "pricing";

	private static final String DATEFORMAT = "yyyy-MM-dd'T'HH:mm:ss";
	private static final String DATEPATTERN = "yyyy-MM-dd'T'HH:mm:ss.mmmZ";
	private static final String DATEPATTERN1 = "dd-MMM-yyyy";

	private static final String KEY = "key";
	private static final String ITEMNO = "1";

	// hard-coding contract type for now as database column is taking not more then
	// 1 characters.
	//private static String contractType = "P";

	//Need to check on DealType, as to get dealType value it requires constant DealType as dependsOn
	private static final String DEALTYPE = "DealType";


	private static final String STATUS = "status";
	private static final String SUCCESS = "Success";
	private static final String FAILED = "Failed";
	private static final String NOTAPPLICABLE = "N/A";

	private static final String COLLECTIONNAME = "Bulk_Contract_Collection";
	private static final String COLLECTIONHEADERS = "collection_bulk_contract_headers";
	private static final String COLLECTIONMAPPING = "platform_bulk_contract_mapping";
	
	@Override
	public ContractDetails saveContracts(ContractDetails datasetDetailsList,
			RequestContext request) {
		ContractDetails response = null;
		List<Map<String, Object>> serviceKeyList = null;
		Map<String, Object> serviceKeyMap = null;
		Gson gson = new Gson();
		try {
			
			String trmContractCreationEndpoint = ptContractCreationProperties.getTRMUrl(request.getRequest());
			response = saveContract(datasetDetailsList, request, serviceKeyList, serviceKeyMap,gson,trmContractCreationEndpoint);
		} catch (Exception e) {
			logger.error("Exception inside saveContracts(-, -) : ", e);
			throw new ConnectException(e.getLocalizedMessage());
		}
		return response;
	}
		
	@SuppressWarnings("unchecked")
	@Override
	public ContractDetails saveContract(ContractDetails contractObject, RequestContext requestContext,
			List<Map<String, Object>> serviceKeyList, Map<String, Object> serviceKeyMap, Gson gson,String trmContractCreationEndpoint) throws HttpStatusCodeException, HttpClientErrorException, RestClientException,
	ParseException, JsonProcessingException {

		// Check for null values in BidToContract Dataset
		Errors error = new BeanPropertyBindingResult(contractObject, "contractObject");
		contractValidator.validate(contractObject, error);
		if(contractObject.getPriceType().equalsIgnoreCase("Basis")) {
			contractValidator.validateBasis(contractObject, error);
		}
		StringBuilder reasonForFailure = new StringBuilder();
		List<String> errors = new ArrayList<>();
		String reasonsForFailure = null;
		String finalResponseMap = null;
		String exceptionMessage = null;
	    Object exceptionObject = null;
		HttpHeaders headers = getHeaders(requestContext.getRequest());
		headers.add("requestId", requestContext.getRequestId()+"- SEQ_NO"+contractObject.getSeqNo());
		Map responseMap = null;
		if (error.hasErrors()) {

			// 1. Get the list of field errors
			// 2. Get code from field error through stream map
			// 3. choosing the format for collection
			errors.addAll(error.getFieldErrors().stream().map(FieldError::getCode).collect(Collectors.toList()));
			// errors.forEach(reasonForFailure::append);
			reasonsForFailure = String.join(",", errors);
			exceptionObject = NOTAPPLICABLE;
			contractObject.setContractRefNo("");
			contractObject.setContractStatus(FAILED);
			contractObject.setErrorMessage(reasonsForFailure);
			logger.info("reasonsForFailure--->" + reasonsForFailure);
			return contractObject;

		} 
		
		logger.info("Save Contract service getting - Initiated");
		logger.info("serviceKeyList before " + serviceKeyList);
		serviceKeyList = new ArrayList<>();

		ContractDetails.TRMPayloadKeyDetails trmPayloadKeyObject = new ContractDetails().new TRMPayloadKeyDetails();
		ContractDetails.MDMServiceKeyDetails mdmServiceKeyObject = new ContractDetails().new MDMServiceKeyDetails();
		logger.info("serviceKeyList after " + serviceKeyList);

		Map finalMap = new LinkedHashMap<>();
		Map<String, Object> requestPayload = new HashMap<>();

		ObjectMapper objMapper = new ObjectMapper();

		// Step1 storing datasets (mapper exception may throw while mapping).
		Map<String, Object> datasetMap = objMapper.convertValue(contractObject, Map.class);

		// step2 storing datsets key with service key as value in fieldsMap
		Map<String, Object> datasetServiceKeyMap = objMapper
				.convertValue(new ContractDetails().new MDMServiceKeyDetails(), Map.class);

		// step 3 creating map according to request payload
		Map<String, Object> payloadServiceKeyMap = objMapper
				.convertValue(new ContractDetails().new TRMPayloadKeyDetails(), Map.class);

		// getting the service key, to find the key to pass onto depends on key
		// below condition for all non-dependent fields.
		if (null != datasetServiceKeyMap) {
			for (String key : datasetServiceKeyMap.keySet()) {
				// put conditions for which you want or you won't want.
				// put condition to identify depends on and don't add those keys.
				serviceKeyMap = new HashMap<>();
				serviceKeyMap.put(SERVICEKEY, datasetServiceKeyMap.get(key));
				serviceKeyList.add(serviceKeyMap);
			}
		}
		
		HttpEntity<Object> requestBody = null;

		ResponseEntity<Object> responseEntity = null;
		try {
			String contractType = contractObject.getOfferType();
			String priceType=contractObject.getPriceType();
			// start of calling MDM API calls, settings API calls and TRM API calls
			// Adding DealType on 1st MDM Call as it'sdepends on is always constant
			serviceKeyMap = new HashMap<>();
			serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getDealType());
			serviceKeyMap.put(DEPENDSON, Arrays.asList(DEALTYPE));
			serviceKeyList.add(serviceKeyMap);
			requestBody = new HttpEntity<Object>(gson.toJson(serviceKeyList), headers);
			// 1st MDM Call

			finalMap = callMDMAPI(requestBody,datasetMap,datasetServiceKeyMap,payloadServiceKeyMap,responseMap,finalMap);

			// For the fields which are dependent, have to take key and pass to dependent
			// fields
			// as dependsOn in array and form a payload and call the mdm api to get the
			// response

			// Form a second mdm payload to get itemDetails fields.
			// 2nd MDM Call
			serviceKeyList = new ArrayList<>();
			serviceKeyList = getSecondMDMPayload(finalMap, trmPayloadKeyObject, mdmServiceKeyObject,priceType);
			requestBody = new HttpEntity<Object>(gson.toJson(serviceKeyList), headers);
			finalMap = callMDMAPI(requestBody,datasetMap,datasetServiceKeyMap,payloadServiceKeyMap,responseMap,finalMap);

			// start of 3rd MDM API CALL.
			serviceKeyList = new ArrayList<>();
			serviceKeyList = getThirdMDMPayload(finalMap, trmPayloadKeyObject, mdmServiceKeyObject,priceType,contractType);
			requestBody = new HttpEntity<Object>(gson.toJson(serviceKeyList), headers);
			finalMap = callMDMAPI(requestBody,datasetMap,datasetServiceKeyMap,payloadServiceKeyMap,responseMap,finalMap);

			// start of 4th MDM API CALL.
			serviceKeyList = new ArrayList<>();
			serviceKeyList = getFourthMDMPayload(finalMap, trmPayloadKeyObject, mdmServiceKeyObject);
			requestBody = new HttpEntity<Object>(gson.toJson(serviceKeyList), headers);
			finalMap = callMDMAPI(requestBody,datasetMap,datasetServiceKeyMap,payloadServiceKeyMap,responseMap,finalMap);

			// END OF MDM API CALLS.
			logger.info("final Map is ---------------------- " + finalMap);
			//from request payload and create one contract
			requestPayload = getRequestPayload(finalMap, contractObject, trmPayloadKeyObject);
			// create one contract based on offer type is equal to purchase or sales.
			
			//store contract type in single field as db takes single character
			if(contractType.equalsIgnoreCase("Purchase")) {
				contractType = "P";
			}else {
				contractType = "S";
			}
			requestPayload.put(trmPayloadKeyObject.getContractType(), contractType);
			logger.info("final request payload is " + requestPayload);
			contractValidator.contractIdNullValidation(requestPayload, errors);
			if (null != errors && errors.size() > 0) {

				reasonsForFailure = String.join(",", errors);
				exceptionObject = NOTAPPLICABLE;
				
				contractObject.setContractRefNo("");
				contractObject.setContractStatus(FAILED);
				contractObject.setErrorMessage(reasonsForFailure);
				logger.info("Seq No Inside Failure----------> "+contractObject.getSeqNo());
				
			} 
			else {
			// final call to TRM API to create one contract
				boolean statusCheck;
				JSONObject json=null;
				String contractRefNo = null;
			requestBody = new HttpEntity<Object>(gson.toJson(requestPayload), headers);
			finalResponseMap = callContractIDAPI(requestBody,trmContractCreationEndpoint,finalResponseMap);
			if (null != finalResponseMap) {
				statusCheck =  finalResponseMap.contains(STATUS);
				json = new JSONObject(finalResponseMap);  
				contractRefNo= json.getJSONObject("data").getJSONObject("contractDetails").getString("contractRefNo");
				if (statusCheck == true) {
					contractObject.setContractRefNo(contractRefNo);
					contractObject.setContractStatus(SUCCESS);
					contractObject.setErrorMessage(NOTAPPLICABLE);
				}
			} else {
				contractObject.setContractRefNo("");
				contractObject.setContractStatus("Response not Found for the contract");
				contractObject.setErrorMessage(NOTAPPLICABLE);
			}
			logger.info("Seq No Inside Success---------> "+contractObject.getSeqNo());
			
			}
		} catch (Exception ex) {
			logger.error("General Exception inside save of contract() ->", ex);
		}


		logger.info("contract service before calling status collection call");

		logger.info("Save Contract service getting - Ended");
		
		return contractObject;
	}

	public Map getAllKeys(Map<String, Object> datasetMap, Map<String, Object> datasetServiceKeyMap,
			Map<String, Object> payloadServiceKeyMap, Map responseMap) {

		Map resultMap = new LinkedHashMap<>();
		// looping dataset

		if (null != datasetMap) {
			datasetMap.forEach((k, v) -> {
				String dataSetKey = (String) k;
				String datasetValue = (String) v;

				if (null != datasetServiceKeyMap && null != payloadServiceKeyMap) {
					// checking if datasetservice map contains datasetkey
					if (datasetServiceKeyMap.containsKey(dataSetKey)) {
						// getting value for mdmservicekey
						String mdmServiceKeyValue = (String) datasetServiceKeyMap.get(dataSetKey);
						// getting value for payloadservicekey
						String payloadServiceKeyValue = (String) payloadServiceKeyMap.get(dataSetKey);

						// if mdmresponseMap contains mdmServiceKeyValue
						if (responseMap.containsKey(mdmServiceKeyValue)) {
							List<HashMap> responseMdmList = (ArrayList<HashMap>) responseMap.get(mdmServiceKeyValue);

							if (responseMdmList != null) {
								for (HashMap map : responseMdmList) {
									// if map1 contains datasetValue then get all the keys for that map
									// if the exact value doesn't match below logic will not work
									if (map.containsValue(datasetValue)) {

										resultMap.put(payloadServiceKeyValue, map.get(KEY));

									}
								}
							}
						}
					}
				}
			});
		}
		return resultMap;

	}

	// Method to form a Request Payload
	// keep it now later will optimize to form a payload in a more generalized way
	public Map<String, Object> getRequestPayload(Map finalMap, ContractDetails contractObject,ContractDetails.TRMPayloadKeyDetails trmPayloadKeyObject) throws ParseException {

		List<Map> itemDetails = new ArrayList<>();
		Map<String, Object> requestPayload = new HashMap<>();
		requestPayload.put(ITEMDETAILS, new ArrayList<>());
		Map<String, Object> itemDetailsMap = new HashMap<>();
		Map<String, Object> pricingMap = new HashMap<>();
		Double itemQty = Double.parseDouble(contractObject.getItemQuantity());
		Double tolerance = Double.parseDouble(contractObject.getTolerance());
		Double priceDf = 0.0;
		if(!contractObject.getPriceDf().isEmpty()) {
			priceDf=Double.parseDouble(contractObject.getPriceDf());
		}
		Double basisPrice = 0.0;
		if(!contractObject.getBasisPrice().isEmpty()) {
			basisPrice=Double.parseDouble(contractObject.getBasisPrice());
		}
		String productSpecs  = contractObject.getProduct() + "," + contractObject.getQuality();

		if (null != contractObject) {
			
			itemDetailsMap.put(trmPayloadKeyObject.getProductSpecs(), productSpecs);
			itemDetailsMap.put(trmPayloadKeyObject.getItemNo(), ITEMNO);
			itemDetailsMap.put(trmPayloadKeyObject.getItemQuantity(), itemQty);
			
			// fields which doesn't require value-to key conversion
				
			itemDetailsMap.put(trmPayloadKeyObject.getToleranceMin(), tolerance);
			itemDetailsMap.put(trmPayloadKeyObject.getToleranceMax(), tolerance);
			itemDetailsMap.put(trmPayloadKeyObject.getToleranceType(), contractObject.getToleranceType());
			itemDetailsMap.put(trmPayloadKeyObject.getToleranceLevel(), contractObject.getToleranceLevel());

			// fields which require date conversion
			String deliveryFromDate = contractObject.getDeliveryFromDate();
			if(null != deliveryFromDate && !deliveryFromDate.isEmpty()) {
				deliveryFromDate = getFormattedDate(deliveryFromDate);
				itemDetailsMap.put(trmPayloadKeyObject.getDeliveryFromDate(), deliveryFromDate);
			}

			String deliveryToDate = contractObject.getDeliveryToDate();
			if(null != deliveryToDate && !deliveryToDate.isEmpty()) {
				deliveryToDate = getFormattedDate(deliveryToDate);
				itemDetailsMap.put(trmPayloadKeyObject.getDeliveryToDate(), deliveryToDate);
			}


			String paymentDueDate = contractObject.getPaymentDueDate();
			if(null != paymentDueDate && !paymentDueDate.isEmpty()) {
				paymentDueDate = getFormattedDate(paymentDueDate);
				itemDetailsMap.put(trmPayloadKeyObject.getPaymentDueDate(), paymentDueDate);
			}

			String contractIssueDate = contractObject.getContractIssueDate();
			if(null != contractIssueDate && !contractIssueDate.isEmpty()) {
				contractIssueDate = getFormattedDate(contractIssueDate);
				requestPayload.put(trmPayloadKeyObject.getContractIssueDate(), contractIssueDate);
			}
			if(contractObject.getPriceType().equalsIgnoreCase("Basis")) {
			
				itemDetailsMap.put(trmPayloadKeyObject.getPriceLastFixDayBasedOn(), contractObject.getPriceFixLatestBy());
				itemDetailsMap.put(trmPayloadKeyObject.getOptionsToFix(), contractObject.getPriceFixOption());
				itemDetailsMap.put(trmPayloadKeyObject.getFixationMethod(), contractObject.getPriceFixMethod());
				itemDetailsMap.put(trmPayloadKeyObject.getFutureInstrumentText(), contractObject.getFutureInstrument());
			
				String earliestBy = contractObject.getPriceFixEarliestBy();
			  if(null != earliestBy && !earliestBy.isEmpty()) {
				earliestBy = getFormattedDate2(earliestBy);
				itemDetailsMap.put(trmPayloadKeyObject.getEarliestBy(), earliestBy);
			}
			
		 }
		}

		// fields which require value-to key conversion
		if (null != finalMap) {

			requestPayload.put(trmPayloadKeyObject.getTraderName(), finalMap.get(trmPayloadKeyObject.getTraderName()));
			requestPayload.put(trmPayloadKeyObject.getDealType(), finalMap.get(trmPayloadKeyObject.getDealType()));
			requestPayload.put(trmPayloadKeyObject.getCpName(), finalMap.get(trmPayloadKeyObject.getCpName()));
			requestPayload.put(trmPayloadKeyObject.getIncoTerms(), finalMap.get(trmPayloadKeyObject.getIncoTerms()));
			requestPayload.put(trmPayloadKeyObject.getPaymentTerms(),
					finalMap.get(trmPayloadKeyObject.getPaymentTerms()));
			requestPayload.put(trmPayloadKeyObject.getArbitration(),
					finalMap.get(trmPayloadKeyObject.getArbitration()));
			requestPayload.put(trmPayloadKeyObject.getTermsAndConditions(),
					finalMap.get(trmPayloadKeyObject.getTermsAndConditions()));
			requestPayload.put(trmPayloadKeyObject.getContractQuantityUnit(),
					finalMap.get(trmPayloadKeyObject.getContractQuantityUnit()));
			if(contractObject.getQualityFinalAt() != null) {
			requestPayload.put(trmPayloadKeyObject.getQualityFinalAt(), contractObject.getQualityFinalAt());
			}
			if(contractObject.getWeightFinalAt() != null) {
			requestPayload.put(trmPayloadKeyObject.getWeightFinalAt(), contractObject.getWeightFinalAt());
			}
			// "isOptionalFieldsEnabled": "false",
			// requestPayload.put("isOptionalFieldsEnabled", "false");
			
			itemDetailsMap.put(trmPayloadKeyObject.getTaxScheduleApplicableCountry(),
					finalMap.get(trmPayloadKeyObject.getTaxScheduleApplicableCountry()));
			itemDetailsMap.put(trmPayloadKeyObject.getTaxSchedule(),
					finalMap.get(trmPayloadKeyObject.getTaxSchedule()));
			itemDetailsMap.put(trmPayloadKeyObject.getProduct(), finalMap.get(trmPayloadKeyObject.getProduct()));
			itemDetailsMap.put(trmPayloadKeyObject.getQuality(), finalMap.get(trmPayloadKeyObject.getQuality()));
			itemDetailsMap.put(trmPayloadKeyObject.getItemQuantityUnitId(),
					finalMap.get(trmPayloadKeyObject.getItemQuantityUnitId()));
			
			itemDetailsMap.put(trmPayloadKeyObject.getStrategy(), finalMap.get(trmPayloadKeyObject.getStrategy()));
			itemDetailsMap.put(trmPayloadKeyObject.getPayInCurrency(),
					finalMap.get(trmPayloadKeyObject.getPayInCurrency()));
			itemDetailsMap.put(trmPayloadKeyObject.getProfitCenter(),
					finalMap.get(trmPayloadKeyObject.getProfitCenter()));
			itemDetailsMap.put(trmPayloadKeyObject.getLoadingType(),
					finalMap.get(trmPayloadKeyObject.getLoadingType()));
			itemDetailsMap.put(trmPayloadKeyObject.getDestinationType(),
					finalMap.get(trmPayloadKeyObject.getDestinationType()));
			itemDetailsMap.put(trmPayloadKeyObject.getLoadingLocation(),
					finalMap.get(trmPayloadKeyObject.getLoadingLocation()));
			itemDetailsMap.put(trmPayloadKeyObject.getDestinationLocation(),
					finalMap.get(trmPayloadKeyObject.getDestinationLocation()));
			itemDetailsMap.put(trmPayloadKeyObject.getLoadingCountry(),
					finalMap.get(trmPayloadKeyObject.getLoadingCountry()));
			itemDetailsMap.put(trmPayloadKeyObject.getDestinationCountry(),
					finalMap.get(trmPayloadKeyObject.getDestinationCountry()));
			itemDetailsMap.put(trmPayloadKeyObject.getShipmentMode(),
					contractObject.getShipmentMode());
			itemDetailsMap.put(trmPayloadKeyObject.getOrigin(), finalMap.get(trmPayloadKeyObject.getOrigin()));
			itemDetailsMap.put(trmPayloadKeyObject.getCropYear(), finalMap.get(trmPayloadKeyObject.getCropYear()));
			
			// pricing fields
			
			pricingMap.put(trmPayloadKeyObject.getPriceType(), finalMap.get(trmPayloadKeyObject.getPriceType()));
			pricingMap.put(trmPayloadKeyObject.getPriceUnitId(), finalMap.get(trmPayloadKeyObject.getPriceUnitId()));
			pricingMap.put(trmPayloadKeyObject.getPriceDf(), priceDf);
			if(contractObject.getPriceType().equalsIgnoreCase("Basis")) {
				pricingMap.put(trmPayloadKeyObject.getPriceMonthText(), contractObject.getPriceMonth());
				pricingMap.put(trmPayloadKeyObject.getBasisFixedQty(), itemQty);
				pricingMap.put(trmPayloadKeyObject.getBasisPrice(), basisPrice);
				pricingMap.put(trmPayloadKeyObject.getBasisPriceUnit(), finalMap.get(trmPayloadKeyObject.getBasisPriceUnit()));
				pricingMap.put(trmPayloadKeyObject.getPriceMonth(), finalMap.get(trmPayloadKeyObject.getPriceMonth()));
				pricingMap.put(trmPayloadKeyObject.getPriceDf(), null);
			
				itemDetailsMap.put(trmPayloadKeyObject.getFutureInstrument(), finalMap.get(trmPayloadKeyObject.getFutureInstrument()));
			}

			itemDetailsMap.put(trmPayloadKeyObject.getShipVesselDetails(), contractObject.getShipVesselDetails());
			
			itemDetailsMap.put(PRICING, pricingMap);

			((ArrayList) requestPayload.get(ITEMDETAILS)).add(itemDetailsMap);
		}

		return requestPayload;

	}

	public static String getFormattedDate(String inputDate) {

		String formattedDate = null;

		SimpleDateFormat dateFormat = new SimpleDateFormat(DATEFORMAT);
		String isoDatePattern = DATEPATTERN;
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat(isoDatePattern);
		Date date = null;
		try {
			date = dateFormat.parse(inputDate);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			logger.error("Error in parsing date " + e);
		}
		formattedDate = simpleDateFormat.format(date);

		return formattedDate;
	}

	public static String getFormattedDate1(String inputDate) {

		String formattedDate = null;

		SimpleDateFormat dateFormat = new SimpleDateFormat(DATEFORMAT);
		String isoDatePattern = DATEPATTERN1;
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat(isoDatePattern);
		Date date = null;
		try {
			date = dateFormat.parse(inputDate);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			logger.error("Error in parsing date " + e);
			return inputDate;
		}
		formattedDate = simpleDateFormat.format(date);

		return formattedDate;
	}
	
	public static String getFormattedDate2(String inputDate) throws ParseException {

		String formattedDate = null;

		SimpleDateFormat dateFormat = new SimpleDateFormat(DATEPATTERN1);
		String isoDatePattern = DATEPATTERN;
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat(isoDatePattern);
		Date date = null;
		try {
			date = dateFormat.parse(inputDate);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			SimpleDateFormat dateFormat1 = new SimpleDateFormat(DATEFORMAT);
			date = dateFormat1.parse(inputDate);
			logger.error("Error in parsing date " + e);
		}
		formattedDate = simpleDateFormat.format(date);

		return formattedDate;
	}

	public HttpHeaders getHeaders(HttpServletRequest request) {

		HttpHeaders headers = new HttpHeaders();

		Enumeration<?> names = request.getHeaderNames();

		while (names.hasMoreElements()) {

			String name = (String) names.nextElement();
			headers.add(name, request.getHeader(name));
		}
		return headers;

	}

	public List<Map<String, Object>> getSecondMDMPayload(Map finalMap,
			ContractDetails.TRMPayloadKeyDetails trmPayloadKeyObject,
			ContractDetails.MDMServiceKeyDetails mdmServiceKeyObject,String priceType) {
		// Form a second mdm payload to get itemDetails fields.
		
		String dealTypeKey = (String) finalMap.get(trmPayloadKeyObject.getDealType());
		String productKey = (String) finalMap.get(trmPayloadKeyObject.getProduct());
		String payInCurIdKey = (String) finalMap.get(trmPayloadKeyObject.getPayInCurrency());
		String taxScheduleCountryIdKey = (String) finalMap.get(trmPayloadKeyObject.getTaxScheduleApplicableCountry());
		String traderUserIdKey = (String) finalMap.get(trmPayloadKeyObject.getTraderName());
		String incotermIdKey = (String) finalMap.get(trmPayloadKeyObject.getIncoTerms());

		List<Map<String, Object>> serviceKeyList = new ArrayList<>();
		// getting the service key, to find the key to pass onto depends on key
		// put conditions for which you want or you won't want.
		// remove hard-coded service key values
		Map<String, Object> serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getQuality());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getItemQuantityUnitId());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey));

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getPriceType());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getDealType());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(DEALTYPE));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getTaxSchedule());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(taxScheduleCountryIdKey));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getPriceUnitId());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey, payInCurIdKey));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getLoadingType());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(incotermIdKey));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getProfitCenter());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(traderUserIdKey));
		serviceKeyList.add(serviceKeyMap);
		
		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getOrigin());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey));
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getCpName());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(dealTypeKey));
		serviceKeyList.add(serviceKeyMap);
		
		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getFutureInstrument());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey));
		serviceKeyList.add(serviceKeyMap);
		
		if(priceType.equalsIgnoreCase("Basis")) {
			serviceKeyMap = new HashMap<>();
			serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getBasisPriceUnit());
			serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey, payInCurIdKey));
			serviceKeyList.add(serviceKeyMap);
		}
		
		return serviceKeyList;
	}

	public List<Map<String, Object>> getThirdMDMPayload(Map finalMap,
			ContractDetails.TRMPayloadKeyDetails trmPayloadKeyObject,
			ContractDetails.MDMServiceKeyDetails mdmServiceKeyObject,String priceType,String contractType) {
		List<Map<String, Object>> serviceKeyList = new ArrayList<>();

		String dealTypeKey = (String) finalMap.get(trmPayloadKeyObject.getDealType());
		String originationCountryIdKey = (String) finalMap.get(trmPayloadKeyObject.getLoadingCountry());
		String loadingLocationGroupTypeIdKey = (String) finalMap.get(trmPayloadKeyObject.getLoadingType());
		
		String productKey = (String) finalMap.get(trmPayloadKeyObject.getProduct());
		String originKey = (String) finalMap.get(trmPayloadKeyObject.getOrigin());

		Map<String, Object> serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getCpName());
		if(contractType.equalsIgnoreCase("Purchase")) {
			serviceKeyMap.put(DEPENDSON, Arrays.asList("SELLER",dealTypeKey));
		}else {
			serviceKeyMap.put(DEPENDSON, Arrays.asList("BUYER",dealTypeKey));
		}
		
		serviceKeyList.add(serviceKeyMap);

		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getLoadingLocation());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(originationCountryIdKey, loadingLocationGroupTypeIdKey));
		serviceKeyList.add(serviceKeyMap);
		
		serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getCropYear());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(productKey, originKey));
		serviceKeyList.add(serviceKeyMap);

		if(priceType.equalsIgnoreCase("Basis")) {
			String productDerivativeInstrumentKey = (String) finalMap.get(trmPayloadKeyObject.getFutureInstrument());
			serviceKeyMap = new HashMap<>();
			serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getPriceMonth());
			serviceKeyMap.put(DEPENDSON, Arrays.asList(productDerivativeInstrumentKey));
			serviceKeyList.add(serviceKeyMap);
		}

		return serviceKeyList;
	}

	public List<Map<String, Object>> getFourthMDMPayload(Map finalMap,
			ContractDetails.TRMPayloadKeyDetails trmPayloadKeyObject,
			ContractDetails.MDMServiceKeyDetails mdmServiceKeyObject) {
		List<Map<String, Object>> serviceKeyList = new ArrayList<>();
		String destinationCountryIdKey = (String) finalMap.get(trmPayloadKeyObject.getDestinationCountry());
		String destinationLocationGroupTypeIdKey = (String) finalMap.get(trmPayloadKeyObject.getLoadingType());
		Map<String, Object> serviceKeyMap = new HashMap<>();
		serviceKeyMap.put(SERVICEKEY, mdmServiceKeyObject.getLoadingLocation());
		serviceKeyMap.put(DEPENDSON, Arrays.asList(destinationCountryIdKey, destinationLocationGroupTypeIdKey));
		serviceKeyList.add(serviceKeyMap);

		return serviceKeyList;

	}

	public Map callMDMAPI(HttpEntity<Object> requestBody,Map<String, Object> datasetMap,Map<String, Object> datasetServiceKeyMap,Map<String, Object> payloadServiceKeyMap,Map responseMap,Map<Object, Object> finalMap) {	
		ResponseEntity<Object> responseEntity = null;

		try {
			logger.info(StringUtils.normalizeSpace("Making a POST call to get MDM Data at endpoint: " + mdmEndpoint + " with request payload: "
					+ requestBody));

			responseEntity = restTemplate.exchange(mdmEndpoint, HttpMethod.POST, requestBody, Object.class);
			logger.info("responseEntity inside MDM-->" +responseEntity);
		} catch (HttpClientErrorException he) {
			logger.error("HttpClientErrorException inside save of contract() -> while calling MDM API",
					he.getRawStatusCode() + "" + he.getResponseBodyAsString() + he.getResponseHeaders());
		} catch (HttpStatusCodeException hs) {
			logger.error("HttpStatusCodeException inside save of contract() -> while calling MDM API",
					hs.getRawStatusCode() + "" + hs.getResponseBodyAsString() + hs.getResponseHeaders());
		}catch (ResourceAccessException re) {
			logger.error("ResourceAccessException inside save of contract() -> while calling MDM API",
					re.getLocalizedMessage());
		}catch (RestClientException ex) {
			logger.error("RestClientException inside save of contract() -> while calling MDM API", ex);
		} catch (Exception ex) {
			logger.error("Exception inside save of contract() -> while calling MDM API", ex);
		}

		// get the keys if response from mdm is not null
		if (null != responseEntity) {
			responseMap = (LinkedHashMap) responseEntity.getBody();

			// get the response of all key-values by passing request body as serviceKeyList.
			// get the id of each service key and put it in a new map.
			finalMap.putAll(getAllKeys(datasetMap, datasetServiceKeyMap, payloadServiceKeyMap, responseMap));

		}
		return finalMap;
	}

	public String callContractIDAPI(HttpEntity<Object> requestBody,String trmContractCreationEndpoint, String finalResponseMap) {
		ResponseEntity<String> responseEntity = null;
		try {
			
			// Getting the TRM-END Point by Property API
			
			logger.info(StringUtils.normalizeSpace("Making a POST call to create contract api details at endpoint: "
					+ trmContractCreationEndpoint + " with request payload: " + requestBody));

			responseEntity = restTemplate.exchange(trmContractCreationEndpoint, HttpMethod.POST,
					requestBody, String.class);

		} catch (HttpClientErrorException he) {
			logger.error(
					"HttpClientErrorException inside save of contract() while calling TRM create contract API -> ",
					he.getRawStatusCode() + "" + he.getResponseBodyAsString()
					+ he.getResponseHeaders());
		} catch (HttpStatusCodeException hs) {
			logger.error(
					"HttpStatusCodeException inside save of contract() while calling TRM create contract API -> ",
					hs.getRawStatusCode() + "" + hs.getResponseBodyAsString()
					+ hs.getResponseHeaders());
		} catch (RestClientException ex) {
			logger.error(
					"RestClientException inside save of contract() while calling TRM create contract API -> ",
					ex);
		} catch (Exception ex) {
			logger.error(
					"Exception inside save of contract() -> while calling TRM create contract API ->",
					ex);
		}
		if (null != responseEntity) {
			finalResponseMap = responseEntity.getBody();
		}
		return finalResponseMap;
	}
	
	public void storeStatusDetailsInCollection(List<ContractDetails> contractdetailsList,
			RequestContext requestContext) throws HttpStatusCodeException, HttpClientErrorException, RestClientException, ParseException, InterruptedException, ExecutionException{
		
		logger.info("storeStatusDetailsInCollection method initiated ---- ");
		String statusCollectionEndPoint =  connectHost + "/collectionmapper/" + connectUDID+"/"+connectUDID+"/updateCollectionRecords";
		Gson gson = new Gson();
		HttpHeaders headers=getHeaders(requestContext.getRequest());
		logger.info("statusCollectionEndPoint URI ---- "+statusCollectionEndPoint);
		String exceptionMessage = null;
	    Object exceptionObject = null;
		
		StatusCollection statusCollection = new StatusCollection();
		statusCollection.setCollectionName(COLLECTIONNAME);
		statusCollection.setCollectionHeaderProperty(COLLECTIONHEADERS);
		statusCollection.setCollectionConnectMapProperty(COLLECTIONMAPPING);
		List<Map<String, Object>> serviceKeyList = new ArrayList<>();
		if(null!=contractdetailsList) {
			for (ContractDetails contractdetails : contractdetailsList) {
				Map<String, Object> serviceKeyMap = new HashMap<>();
				Double itemQty = Double.parseDouble(contractdetails.getItemQuantity());
				Double tolerance = Double.parseDouble(contractdetails.getTolerance());
				Double priceDf = 0.0;
				if(null!=contractdetails.getPriceDf() && !contractdetails.getPriceDf().isEmpty()) {
					priceDf=Double.parseDouble(contractdetails.getPriceDf());
				}	
				Double basisPrice = 0.0;
				if(null!=contractdetails.getBasisPrice() && !contractdetails.getBasisPrice().isEmpty()) {
					basisPrice=Double.parseDouble(contractdetails.getBasisPrice());
				}	
				serviceKeyMap.put("_id", contractdetails.getSeqNo());
				logger.info("Seq No-------> "+contractdetails.getSeqNo());
				String contractIssueDate = contractdetails.getContractIssueDate();
				if(null != contractIssueDate) {
					contractIssueDate = getFormattedDate1(contractIssueDate);
					serviceKeyMap.put("issueDate", contractIssueDate);
				}
				
				serviceKeyMap.put("traderUserId", contractdetails.getTraderName());
				serviceKeyMap.put("cpProfileId", contractdetails.getCpName());
				serviceKeyMap.put("contractType", contractdetails.getOfferType());
				serviceKeyMap.put("productId", contractdetails.getProduct());
				serviceKeyMap.put("quality",contractdetails.getQuality());
				serviceKeyMap.put("itemQty", itemQty);
				serviceKeyMap.put("itemQtyUnitId", contractdetails.getItemQuantityUnitId());
				
				String deliveryFromDate = contractdetails.getDeliveryFromDate();
				if(null != deliveryFromDate && !deliveryFromDate.isEmpty()) {
					deliveryFromDate = getFormattedDate1(deliveryFromDate);
					serviceKeyMap.put("deliveryFromDate", deliveryFromDate);
				}
				String deliveryToDate = contractdetails.getDeliveryToDate();
				if(null != deliveryToDate && !deliveryToDate.isEmpty()) {
					deliveryToDate = getFormattedDate1(deliveryToDate);
					serviceKeyMap.put("deliveryToDate", deliveryToDate);
				}
				
				serviceKeyMap.put("payInCurId", contractdetails.getPayInCurrency());
				serviceKeyMap.put("incotermId", contractdetails.getIncoTerms());
				serviceKeyMap.put("totalQtyUnitId", contractdetails.getContractQuantityUnit());
				serviceKeyMap.put("originationCountryId", contractdetails.getLoadingCountry());
				serviceKeyMap.put("loadingLocationGroupTypeId", contractdetails.getLoadingType());
				serviceKeyMap.put("originationCityId", contractdetails.getLoadingLocation());
				serviceKeyMap.put("destinationCountryId", contractdetails.getDestinationCountry());
				serviceKeyMap.put("destinationLocationGroupTypeId", contractdetails.getDestinationType());
				serviceKeyMap.put("destinationCityId", contractdetails.getDestinationLocation());
				serviceKeyMap.put("priceTypeId", contractdetails.getPriceType());
				serviceKeyMap.put("priceDf", priceDf);
				serviceKeyMap.put("priceUnitId", contractdetails.getPriceUnitId());
				serviceKeyMap.put("toleranceMin", tolerance);
				serviceKeyMap.put("toleranceMax", tolerance);
				serviceKeyMap.put("toleranceType", contractdetails.getToleranceType());
				serviceKeyMap.put("toleranceLevel", contractdetails.getToleranceLevel());
				serviceKeyMap.put("shipmentMode", contractdetails.getShipmentMode());
				serviceKeyMap.put("paymentTermId", contractdetails.getPaymentTerms());
				String paymentDueDate = contractdetails.getPaymentDueDate();
				if(null != paymentDueDate && !paymentDueDate.isEmpty()) {
					paymentDueDate = getFormattedDate1(paymentDueDate);
					serviceKeyMap.put("paymentDueDate", paymentDueDate);
				}
				serviceKeyMap.put("arbitrationId", contractdetails.getArbitration());
				serviceKeyMap.put("applicableLawId", contractdetails.getTermsAndConditions());
				serviceKeyMap.put("taxScheduleCountryId", contractdetails.getTaxScheduleApplicableCountry());
				serviceKeyMap.put("taxScheduleId", contractdetails.getTaxSchedule());
				serviceKeyMap.put("strategyAccId", contractdetails.getStrategy());
				serviceKeyMap.put("profitCenterId", contractdetails.getProfitCenter());
				serviceKeyMap.put("dealType", contractdetails.getDealType());
				serviceKeyMap.put("originId", contractdetails.getOrigin());
				serviceKeyMap.put("cropYearId", contractdetails.getCropYear());
				serviceKeyMap.put("contractRefNo", contractdetails.getContractRefNo());
				serviceKeyMap.put("status", contractdetails.getContractStatus());
				serviceKeyMap.put("errorLocalizedMessage", contractdetails.getErrorMessage());
				serviceKeyMap.put("priceContractDefId", contractdetails.getFutureInstrument());
				serviceKeyMap.put("priceMonthText", contractdetails.getPriceMonth());
				serviceKeyMap.put("basisPrice", basisPrice);
				serviceKeyMap.put("basisPriceUnitId", contractdetails.getBasisPriceUnit());
				String earliestBy = contractdetails.getPriceFixEarliestBy();
				if(null != earliestBy && !earliestBy.isEmpty()) {
					earliestBy = getFormattedDate1(earliestBy);
					serviceKeyMap.put("earliestBy", earliestBy);
				}
				serviceKeyMap.put("priceLastFixDayBasedOn", contractdetails.getPriceFixLatestBy());
				serviceKeyMap.put("optionsToFix", contractdetails.getPriceFixOption());
				serviceKeyMap.put("fixationMethod", contractdetails.getPriceFixMethod());
				serviceKeyMap.put("shipVesselDetails", contractdetails.getShipVesselDetails());
				serviceKeyMap.put("qualityFinalAt", contractdetails.getQualityFinalAt());
				serviceKeyMap.put("weightFinalAt", contractdetails.getWeightFinalAt());
				
				serviceKeyList.add(serviceKeyMap);
				}
				statusCollection.setCollectionData(serviceKeyList);
		}
	

		ResponseEntity<Object> response = null;
		try {
			logger.info("Time before updating contract execution");
			
			HttpEntity<Object> finalrequestBody = new HttpEntity<Object>(gson.toJson(statusCollection), headers);
			logger.info("Making a PUT call to update status in collection  details at endpoint: "
					+ statusCollectionEndPoint + " with request payload: " + finalrequestBody);

			response = restTemplate.exchange(statusCollectionEndPoint, HttpMethod.POST, finalrequestBody, Object.class);
			logger.info("Time after updating contract execution");

		} catch (HttpClientErrorException he) {
			logger.error("HttpClientErrorException inside save of contract() while calling status collection API -> ",
					he.getRawStatusCode() + "" + he.getResponseBodyAsString() + he.getResponseHeaders());
			exceptionMessage = he.getMessage();
			exceptionObject = he;
		} catch (HttpStatusCodeException hs) {
			logger.error("HttpStatusCodeException inside save of contract() while calling status collection API -> ",
					hs.getRawStatusCode() + "" + hs.getResponseBodyAsString() + hs.getResponseHeaders());
			exceptionMessage = hs.getMessage();
			exceptionObject = hs;
		} catch (RestClientException ex) {
			logger.error("RestClientException inside save of contract() -> while calling status collection API ", ex);
			exceptionMessage = ex.getMessage();
			exceptionObject = ex;
		} catch (Exception ex) {
			logger.error("Exception inside save of contract() -> while calling status collection API ", ex);
			exceptionMessage = ex.getMessage();
			exceptionObject = ex;
		}

		logger.info("response from status collection API is " + response);

	}

}
