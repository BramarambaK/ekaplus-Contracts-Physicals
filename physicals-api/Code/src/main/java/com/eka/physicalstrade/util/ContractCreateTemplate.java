package com.eka.physicalstrade.util;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.model.ContractDetails;
import com.eka.physicalstrade.service.IContractService;
import com.fasterxml.jackson.core.JsonProcessingException;

@Service
public class ContractCreateTemplate {


	@Autowired
	CommonValidator validator;

	private static final Logger logger = LoggerFactory.getLogger(ContractCreateTemplate.class);
	
	@Value("${eka.contract.url}")
	private String connectHost;
	
	@Value("${connect.application}")
	private String connectUDID;
	
	@Autowired
	private IContractService contractService;
		
	private static final String COLLECTIONNAME = "Bulk_Contract_Collection";
	
	
	public void getContractFromCollection(HttpServletRequest request) throws HttpClientErrorException, HttpStatusCodeException, RestClientException, ParseException, JsonProcessingException {
		HttpHeaders headers = contractService.getHeaders(request);
		String exceptionMessage = null;
	    Object exceptionObject = null;
		List<ContractDetails> contractDetailsDTO = new LinkedList<ContractDetails>();
		String uri =  connectHost + "/collectionmapper/" + connectUDID+"/"+connectUDID+"/fetchCollectionRecords";
		JSONObject fieldName = new JSONObject();
		JSONArray filterArr = new JSONArray();
		JSONObject obj1 = new JSONObject();
		
		obj1.put("fieldName", "Contract Status");
		obj1.put("value", "New,Failed");
		obj1.put("operator", "in");
		filterArr.put(obj1);
		
		JSONObject outerObj = new JSONObject();
		
		outerObj.put("collectionName", COLLECTIONNAME);
		
		fieldName.put("filter", filterArr);
		outerObj.put("criteria", fieldName);
		
		RestTemplate restTemplate = new RestTemplate();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.add("ttl", "0");
		HttpEntity<String> entity = new HttpEntity<String>(outerObj.toString(), headers);
		JSONArray arr = null;
		
		try {
			
			ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.POST, entity, String.class);
			
			arr = new JSONArray(response.getBody());
			for (int i = 0; i < arr.length(); i++) {   
				ContractDetails contractdetails = new ContractDetails();
		         JSONObject rec = arr.getJSONObject(i); 
		         
		         contractdetails.setSeqNo(rec.optString("Seq No"));
		         contractdetails.setContractIssueDate(rec.optString("Issue Date"));
		         contractdetails.setCpName(rec.optString("CP Name")); 
		         contractdetails.setOfferType(rec.optString("Contract Type")); 
		         contractdetails.setProduct(rec.optString("Product")); 
		         contractdetails.setQuality(rec.optString("Quality")); 
		         contractdetails.setItemQuantity(rec.optString("Item Quantity")); 
		         contractdetails.setItemQuantityUnitId(rec.optString("Quantity Unit"));
		         contractdetails.setDeliveryFromDate(rec.optString("Delivery Period From"));
		         contractdetails.setDeliveryToDate(rec.optString("Delivery Period To"));
		         contractdetails.setPayInCurrency(rec.optString("Pay In Currency"));
		         contractdetails.setIncoTerms(rec.optString("Inco Term"));
		         contractdetails.setContractQuantityUnit(rec.optString("Contract Quantity Unit"));
		         contractdetails.setLoadingCountry(rec.optString("Loading Country"));
		         contractdetails.setLoadingType(rec.optString("Loading Type"));
		         contractdetails.setLoadingLocation(rec.optString("Loading Location"));
		         contractdetails.setDestinationCountry(rec.optString("Discharge Country"));
		         contractdetails.setDestinationType(rec.optString("Discharge Type"));
		         contractdetails.setDestinationLocation(rec.optString("Discharge Location"));
		         contractdetails.setPriceType(rec.optString("Price Type"));
		         contractdetails.setPriceDf(rec.optString("Contract Price"));
		         contractdetails.setPriceUnitId(rec.optString("Contract Price Unit"));
		         contractdetails.setTolerance(rec.optString("Tolerance Min"));
		         contractdetails.setTolerance(rec.optString("Tolerance Max"));
		         contractdetails.setToleranceType(rec.optString("Tolerance Type"));
		         contractdetails.setToleranceLevel(rec.optString("Tolerance Level"));
		         contractdetails.setShipmentMode(rec.optString("Transportation Mode"));
		         contractdetails.setPaymentTerms(rec.get("Payment Terms").toString());
		         contractdetails.setPaymentDueDate(rec.optString("Payment Due Date"));
		         contractdetails.setArbitration(rec.optString("Arbitration"));
		         contractdetails.setTermsAndConditions(rec.optString("Applicable Law/Contract"));
		         contractdetails.setTaxScheduleApplicableCountry(rec.optString("Tax Schedule Applicable Country"));
		         contractdetails.setTaxSchedule(rec.optString("Tax Schedule"));
		         contractdetails.setStrategy(rec.optString("Stratergy"));
		         contractdetails.setProfitCenter(rec.optString("Profit Centre"));
		         contractdetails.setDealType(rec.optString("Deal Type"));
		         contractdetails.setTraderName(rec.optString("Trader Name"));
		         contractdetails.setOrigin(rec.optString("Origin"));
		         contractdetails.setCropYear(rec.optString("Crop Year"));
		         contractdetails.setFutureInstrument(rec.optString("Future Instrument"));
		         contractdetails.setPriceMonth(rec.optString("Price Month"));
		         contractdetails.setBasisPrice(rec.optString("Basis Price"));
		         contractdetails.setBasisPriceUnit(rec.optString("Basis Price Unit"));
		         contractdetails.setPriceFixEarliestBy(rec.optString("Price fix Earliest by"));
		         contractdetails.setPriceFixLatestBy(rec.optString("Price fix Latest by"));
		         contractdetails.setPriceFixOption(rec.optString("Price Fix Option"));
		         contractdetails.setPriceFixMethod(rec.optString("Price fix Method"));
		         contractdetails.setShipVesselDetails(rec.optString("Ship/Vessel Details"));
				 contractdetails.setQualityFinalAt(rec.optString("Quality Finalization Point"));
		         contractdetails.setWeightFinalAt(rec.optString("Quantity Finalization Point"));
		         contractdetails.setContractStatus("In Progress");
		         contractDetailsDTO.add(contractdetails);
		         logger.info("Dataset details is " + validator.cleanData(contractdetails.toString()));
		 		logger.info("Contract creation getting - Initiated");
		       }
			RequestContext requestContext = RequestContextHolder.getCurrentContext();
			logger.info("Total Time before Updating Status In progress");
			contractService.storeStatusDetailsInCollection(contractDetailsDTO,requestContext);
			logger.info("Total Time after Updating Status In progress");
			if(contractDetailsDTO.size() > 0) {
				processContracts(requestContext,contractDetailsDTO);
				
			}
		} catch (Exception e) {
			logger.error("Exception inside save of contract() -> while calling status collection API ", e);
			exceptionMessage = e.getMessage();
			exceptionObject = e;
		}

	}
	
	private void processContracts(RequestContext requestContext,
            List<ContractDetails> contractDetailsDTO) throws HttpClientErrorException, HttpStatusCodeException, RestClientException, JsonProcessingException, ParseException, InterruptedException, ExecutionException {
       List<ContractDetails> contractdetailsList = new ArrayList<ContractDetails>();
		logger.info("Total Time before process contracts execution");
		for (ContractDetails contractDetails : contractDetailsDTO) {
        	
            ContractDetails bulkContractRespone = contractService.saveContracts(contractDetails, requestContext);
            contractdetailsList.add(bulkContractRespone);
        }
		 contractService.storeStatusDetailsInCollection(contractdetailsList,requestContext);
		 logger.info("Total Time after process contracts execution");
        
    }
}
