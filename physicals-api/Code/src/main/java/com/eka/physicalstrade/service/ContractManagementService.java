package com.eka.physicalstrade.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.util.StdDateFormat;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicals.dto.ContractItemEstimateDTO;
import com.eka.physicals.dto.ContractPricingDetailsDTO;
import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.dataobject.APIResponse;
import com.eka.physicalstrade.dataobject.ContractDataResponse;
import com.eka.physicalstrade.exception.CloneObjectDataNotFoundException;
import com.eka.physicalstrade.exception.ContractDataParsingException;
import com.eka.physicalstrade.exception.ContractNotFoundException;
import com.eka.physicalstrade.exception.ContractProcessingException;
import com.eka.physicalstrade.exception.DuplicateRecordException;
import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.eka.physicalstrade.util.ConnectRestTemplate;
import com.eka.physicalstrade.util.PricingAPIRestTemplate;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ContractManagementService {

	private static final Logger logger = ESAPI
			.getLogger(ContractManagementService.class);

	@Autowired
	private PricingAPIRestTemplate pricingAPIRestTemplate;
	@Autowired
	private ConnectRestTemplate connectRestTemplate;
	@Autowired
	private CTRMRestTemplate ctrmRestTemplate;
	@Autowired
	@Qualifier("itemFormulaPricePublisher")
	private ItemFormulaPricePublisher itemFormulaPricePublisher;
	@Autowired
	private FormulaPriceManagementService formulaPriceManagementService;
	@Value("${connect.application}")
	private String CONTRACT_APP_ID;
	@Value("${contract.object.splitprice}")
	private String SPLIT_PRICE_OBJECT_ID;
	@Value("${contract.object.componentprice}")
	private String COMPONENT_PRICE_OBJECT_ID;

	public ContractDataResponse updateContractInConnect(
			HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTOConnect,
			APIResponse trmAPIResponse,boolean isEdit) throws JSONException,
			CloneObjectDataNotFoundException, ContractDataParsingException, ContractProcessingException {

		ContractDataResponse contractDataResponse = new ContractDataResponse();

		ContractDetailsDTO trmContractDetailsDTO = trmAPIResponse.getData()
				.getContractDetails();
		// update oil specific fields from connect object
		populateContractAdditionalFields(contractDetailsDTOConnect,
				trmContractDetailsDTO);

		ContractDetailsDTO updatedContractDetailsDTO = connectRestTemplate
				.putData(request, trmContractDetailsDTO);
		//upsert ItemDetails objects in connect
		//upsertItemDetailsData(request, trmContractDetailsDTO);
		upsertItemDetailsData(request, updatedContractDetailsDTO);

       //		if (isEdit) {
       //			checkAndUpdateDeletedItems(request, contractDetailsDTOConnect);
       //		}

		contractDataResponse.setContractDetails(updatedContractDetailsDTO);

		if (GlobalConstants.DEAL_TYPE_INTER_COMPANY
				.equals(contractDetailsDTOConnect.getDealType())
				|| GlobalConstants.DEAL_TYPE_INTRA_COMPANY
						.equals(contractDetailsDTOConnect.getDealType())) {

			ContractDetailsDTO trmSecondLegContract = trmAPIResponse.getData()
					.getSecondLegContractDetails();
			ContractDetailsDTO updatedTRMSecondLegContractDetailsDTO = null;
			if (isEdit) {
				// modified first leg UI data
				// updated second leg trm data
				// return updatedSecondLegData
				updatedTRMSecondLegContractDetailsDTO = this.modifySecondLegContract(request, contractDetailsDTOConnect,
						trmSecondLegContract);

			} else {
				updatedTRMSecondLegContractDetailsDTO = this.createSecondLegContract(request, contractDetailsDTOConnect,
						updatedContractDetailsDTO, trmSecondLegContract);
			}
			contractDataResponse.setSecondLegContractDetails(updatedTRMSecondLegContractDetailsDTO);
		}

		return contractDataResponse;

	}

	public ContractDetailsDTO createSecondLegContract(
			HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTOUI,
			ContractDetailsDTO firstLegContractDetailsDTO,
			ContractDetailsDTO trmSecondLegContract) throws JSONException,
			CloneObjectDataNotFoundException, ContractDataParsingException {

		logger.info(Logger.EVENT_SUCCESS,
				"Second leg contract creation started");

		logger.debug(Logger.EVENT_SUCCESS,
				"Populating connect specific fields from contract object received from UI");
		// populate connect specific fields for second leg
		populateContractAdditionalFields(contractDetailsDTOUI,
				trmSecondLegContract);

		// create formula pricing object, if required
		Map<Integer, ContractItemDetailsDTO> firstLegContractItemDetailsMap = firstLegContractDetailsDTO
				.getItemDetails()
				.stream()
				.collect(
						Collectors.toMap(ContractItemDetailsDTO::getItemNo,
								Function.identity(), (e1, e2) -> {
									return e1;
								}));

		logger.info(Logger.EVENT_SUCCESS, "Cloning formula prcing objects");
		// clone and update pricing formula
		for (ContractItemDetailsDTO secondLegcontractItemDetailsDTO : trmSecondLegContract
				.getItemDetails()) {
			ContractItemDetailsDTO firstLegContractItemDetailsDTO = firstLegContractItemDetailsMap
					.get(secondLegcontractItemDetailsDTO.getItemNo());
			ContractPricingDetailsDTO firstLegContractPricingDetails = firstLegContractItemDetailsDTO
					.getPricing();

			if (firstLegContractPricingDetails == null
					|| StringUtils.isEmpty(firstLegContractPricingDetails
							.getPricingFormulaId())) {
				continue;
			}

			ContractPricingDetailsDTO secondLegContractPricingDetails = secondLegcontractItemDetailsDTO
					.getPricing();

			String formulaId = firstLegContractPricingDetails
					.getPricingFormulaId();

			String clonedFormulaId = formulaPriceManagementService
					.cloneFormula(request, formulaId);

			secondLegContractPricingDetails
					.setPricingFormulaId(clonedFormulaId);

			// clone split price data
			this.cloneSplitPriceDetails(request, trmSecondLegContract,
					secondLegcontractItemDetailsDTO,
					firstLegContractItemDetailsDTO);
			// clone component price data
			this.cloneComponentPriceDetails(request, trmSecondLegContract,
					secondLegcontractItemDetailsDTO,
					firstLegContractItemDetailsDTO);

		}

		logger.debug(Logger.EVENT_SUCCESS,
				"Saving second leg contract in Connect DB");
		// creating contract in connect for PRICING API to refer to contract
		// while calculating formula price
		ContractDetailsDTO connectTrmSecondLegContract = connectRestTemplate
				.postData(request, trmSecondLegContract);

		logger.debug(Logger.EVENT_SUCCESS,
				"Calling pricing api for second leg contract");
		// call pricing api & populate formula price details
		formulaPriceManagementService.populateFormulaPriceDetails(request,
				connectTrmSecondLegContract);

		logger.debug(Logger.EVENT_SUCCESS,
				"Saving second leg contract in connect db");
		// save in connect db
		ContractDetailsDTO updatedTrmSecondLegContract = connectRestTemplate
				.putData(request, connectTrmSecondLegContract);
		//upsert ItemDetails objects in connect
		upsertItemDetailsData(request, connectTrmSecondLegContract);

		logger.info(Logger.EVENT_SUCCESS,
				"Second leg contract creation completed");

		return updatedTrmSecondLegContract;

	}
	
	public ContractDetailsDTO modifySecondLegContract(HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTOUI, ContractDetailsDTO trmSecondLegContract) throws JSONException,
			CloneObjectDataNotFoundException, ContractDataParsingException, ContractProcessingException {

		logger.info(Logger.EVENT_SUCCESS, "Second leg contract modification started");

		ContractDetailsDTO secondLegContractDetailsConnect =null;
		try {
		secondLegContractDetailsConnect = this.getContractDetails(request,
				trmSecondLegContract.getInternalContractRefNo());
		}catch(DuplicateRecordException | ContractNotFoundException ex) {
			throw new ContractProcessingException("Error in updating second leg contract for Intercompany/Intracompany");
		}
		logger.debug(Logger.EVENT_SUCCESS, "Populating connect specific fields from contract object received from UI");

		// populate connect specific fields for second leg
		populateContractAdditionalFields(contractDetailsDTOUI, trmSecondLegContract);
		trmSecondLegContract.set_id(secondLegContractDetailsConnect.get_id());

		// create formula pricing object, if required
		logger.info(Logger.EVENT_SUCCESS, "Cloning formula prcing objects");
		// clone and update pricing formula

		logger.debug(Logger.EVENT_SUCCESS, "Saving second leg contract in Connect DB");

		logger.debug(Logger.EVENT_SUCCESS, "Saving second leg contract in connect db");
		// save in connect db
		ContractDetailsDTO updatedTrmSecondLegContract = connectRestTemplate.putData(request, trmSecondLegContract);
		// upsert ItemDetails objects in connect
		upsertItemDetailsData(request, trmSecondLegContract);

		logger.info(Logger.EVENT_SUCCESS, "Second leg contract creation completed");

		return updatedTrmSecondLegContract;

	}

	@Deprecated
	public String updateContractAdditionalFields(
			ContractDetailsDTO contractDetailsDTO, String ctrmContractDetails) {

		ObjectMapper obj = new ObjectMapper();
		try {
			obj.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
					false);

			ContractDetailsDTO ctrmContractDetailsDTO = obj.readValue(
					ctrmContractDetails, ContractDetailsDTO.class);
			populateContractAdditionalFields(contractDetailsDTO,
					ctrmContractDetailsDTO);

			ctrmContractDetails = obj
					.writeValueAsString(ctrmContractDetailsDTO);

		} catch (IOException e) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in parsing Ctrm contract data"), e);
		}

		return ctrmContractDetails;
	}

	private void cloneComponentPriceDetails(HttpServletRequest request,
			ContractDetailsDTO secondLegContractData,
			ContractItemDetailsDTO secondLegcontractItemDetailsDTO,
			ContractItemDetailsDTO firstLegContractItemDetailsDTO)
			throws JSONException {

		logger.debug(Logger.EVENT_SUCCESS, "Cloning Component price object");

		cloneObject(request, COMPONENT_PRICE_OBJECT_ID, secondLegContractData,
				secondLegcontractItemDetailsDTO, firstLegContractItemDetailsDTO);
	}

	private void cloneSplitPriceDetails(HttpServletRequest request,
			ContractDetailsDTO secondLegContractData,
			ContractItemDetailsDTO secondLegcontractItemDetailsDTO,
			ContractItemDetailsDTO firstLegContractItemDetailsDTO)
			throws JSONException {

		logger.debug(Logger.EVENT_SUCCESS, "Cloning Split price object");

		cloneObject(request, SPLIT_PRICE_OBJECT_ID, secondLegContractData,
				secondLegcontractItemDetailsDTO, firstLegContractItemDetailsDTO);
	}

	private void cloneObject(HttpServletRequest request, String objectId,
			ContractDetailsDTO secondLegContractData,
			ContractItemDetailsDTO secondLegcontractItemDetailsDTO,
			ContractItemDetailsDTO firstLegContractItemDetailsDTO)
			throws JSONException {
		String internalContractItemRefNo = firstLegContractItemDetailsDTO
				.getInternalItemRefNo();
		Map<String, String> queryParams = new HashMap<>();
		queryParams.put("internalContractItemRefNo", internalContractItemRefNo);
		List<String> firstLegObjectData = connectRestTemplate.getObjectData(
				request, CONTRACT_APP_ID, objectId, queryParams, "");

		if (firstLegObjectData == null || firstLegObjectData.size() == 0) {
			logger.debug(
					Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML(
							"Object not available for contract "
									+ internalContractItemRefNo + " & object "
									+ objectId));
			return;
		}
		JSONObject objectCloneData = null;
		JSONObject objectDataJSON = null;
		for (String objectDataStr : firstLegObjectData) {
			objectDataJSON = new JSONObject(objectDataStr);
			objectCloneData = new JSONObject();

			objectCloneData.put(GlobalConstants._ID,
					objectDataJSON.getString(GlobalConstants._ID));
			objectCloneData.put(GlobalConstants.INTERNAL_CONTRACT_REF_NO,
					secondLegContractData.getInternalContractRefNo());
			objectCloneData.put(GlobalConstants.CONTRACT_DRAFT_ID,
					secondLegContractData.get_id());
			objectCloneData.put(GlobalConstants.INTERNAL_CONTRACT_ITEM_REF_NO,
					secondLegcontractItemDetailsDTO.getInternalItemRefNo());

			String clonedObjectData = connectRestTemplate.cloneData(request,
					objectCloneData.toString(), CONTRACT_APP_ID, objectId);

			if (StringUtils.isEmpty(clonedObjectData)) {
				logger.error(
						Logger.EVENT_FAILURE,
						ESAPI.encoder().encodeForHTML(
								"Object not cloned for parent item "
										+ internalContractItemRefNo
										+ " & object " + objectId));
			}
		}
	}

	private void populateContractAdditionalFields(
			ContractDetailsDTO contractDetailsDTO,
			ContractDetailsDTO ctrmSavedData) {
		if (contractDetailsDTO == null || ctrmSavedData == null) {
			return;
		}

		String contractState = contractDetailsDTO.getContractState();
		ctrmSavedData.setContractState(contractState);
		ctrmSavedData.set_id(contractDetailsDTO.get_id());
		ctrmSavedData.setIsOptionalFieldsEnabled(contractDetailsDTO
				.getIsOptionalFieldsEnabled());
		ctrmSavedData.setUserInputText(contractDetailsDTO.getUserInputText());
		ctrmSavedData.setGeneralDetailsDisplayValue(contractDetailsDTO
				.getGeneralDetailsDisplayValue());
		ctrmSavedData.setIntraCompanyTraderUserId(contractDetailsDTO.getIntraCompanyTraderUserId());
		ctrmSavedData.setCopySecondaryCost(contractDetailsDTO.isCopySecondaryCost());
		ctrmSavedData.setProvisionalPaymentTermId(contractDetailsDTO.getProvisionalPaymentTermId());
		
		// setting the approvalManagementDO to null to avoid blank value
		// setting.
		ctrmSavedData.setApprovalManagementDO(null);
		Map<Integer, ContractItemDetailsDTO> contractItemDetailsMap = contractDetailsDTO
				.getItemDetails()
				.stream()
				.collect(
						Collectors.toMap(ContractItemDetailsDTO::getItemNo,
								Function.identity(), (e1, e2) -> {
									return e1;
								}));
		for (ContractItemDetailsDTO ctrmContractItemDetails : ctrmSavedData
				.getItemDetails()) {

			ContractItemDetailsDTO contractItemDetailsDTO = contractItemDetailsMap
					.get(ctrmContractItemDetails.getItemNo());

			// EPC-2740 - to avoid NPE
			if (contractItemDetailsDTO == null) {
				logger.info(Logger.EVENT_FAILURE,
						"Contract item details not available for item "
								+ ctrmContractItemDetails.getItemNo());
				logger.info(Logger.EVENT_FAILURE,
						"Mismatch in itemNo between Connect & CTRM item no");
				continue;
			}

			if (contractItemDetailsDTO != null
					&& contractItemDetailsDTO.getPricing() != null) {

				if (!StringUtils.isEmpty(contractItemDetailsDTO.getPricing()
						.getPricingFormulaId())) {
					ctrmContractItemDetails.getPricing().setPricingFormulaId(
							contractItemDetailsDTO.getPricing()
									.getPricingFormulaId());

					// EPC-2531
					ctrmContractItemDetails
							.setFormulaPriceDetails(contractItemDetailsDTO
									.getFormulaPriceDetails());
				}
				ctrmContractItemDetails.getPricing().setPriceUnit(
						contractItemDetailsDTO.getPricing().getPriceUnit());
				// Adding below field in pricing for jira id - EPC-1851
				ctrmContractItemDetails.getPricing().setPricingStrategy(
						contractItemDetailsDTO.getPricing()
								.getPricingStrategy());
				ctrmContractItemDetails.getPricing()
						.setPriceMonthText(
								contractItemDetailsDTO.getPricing()
										.getPriceMonthText());
			}
			ctrmContractItemDetails
					.setFutureInstrumentText(contractItemDetailsDTO
							.getFutureInstrumentText());
			ctrmContractItemDetails.setInspectionCompany(contractItemDetailsDTO
					.getInspectionCompany());
			ctrmContractItemDetails.setValuationFormula(contractItemDetailsDTO
					.getValuationFormula());
			ctrmContractItemDetails
					.setIsOptionalFieldsEnabled(contractItemDetailsDTO
							.getIsOptionalFieldsEnabled());
			ctrmContractItemDetails.setItemDisplayValue(contractItemDetailsDTO
					.getItemDisplayValue());
			// Adding below fields for jira id - EPC-2064
			ctrmContractItemDetails.setDailyMonthly(contractItemDetailsDTO
					.getDailyMonthly());
			ctrmContractItemDetails.setDailyMonthlyQty(contractItemDetailsDTO
					.getDailyMonthlyQty());
			// Adding below fields for jira id - CPR-772
			ctrmContractItemDetails.setCustomEvent(contractItemDetailsDTO
					.getCustomEvent());
			ctrmContractItemDetails.setCustomEventDate(contractItemDetailsDTO
					.getCustomEventDate());
			// Adding below fields for jira id - EPC-2386
			if (null != contractItemDetailsDTO.getHolidayRule()
					&& !contractItemDetailsDTO.getHolidayRule().isEmpty()) {
				ctrmContractItemDetails.setHolidayRule(contractItemDetailsDTO
						.getHolidayRule());
			}

			// EPC-2874
			if (null != contractItemDetailsDTO.getEstimates()
					&& contractItemDetailsDTO.getEstimates().size() > 0) {
				// populate the secondaryCostId based on cost component
				if (!GlobalConstants.TYPE_TEMPLATE.equals(contractState)){
					populateSecondaryCostId(contractItemDetailsDTO,
							ctrmContractItemDetails);
				}
			}

			if (GlobalConstants.TYPE_TEMPLATE.equals(contractState)) {
				ctrmContractItemDetails.setEstimates(contractItemDetailsDTO
						.getEstimates());
			}

			// CPR-1067
			ctrmContractItemDetails
					.setcontractQualityDensity(contractItemDetailsDTO
							.getcontractQualityDensity());
			ctrmContractItemDetails
					.setcontractQualityMassUnit(contractItemDetailsDTO
							.getcontractQualityMassUnit());
			ctrmContractItemDetails
					.setcontractQualityVolumeUnit(contractItemDetailsDTO
							.getcontractQualityVolumeUnit());

			// EPC-3162
			ctrmContractItemDetails.setCpContractItemId(contractItemDetailsDTO
					.getCpContractItemId());
			//EPC-3819
			ctrmContractItemDetails.setTotalPrice(contractItemDetailsDTO
					.getTotalPrice());
			ctrmContractItemDetails.setTicketNumber(contractItemDetailsDTO
					.getTicketNumber());
		}
	}

	private void populateSecondaryCostId(
			ContractItemDetailsDTO contractItemDetailsDTO,
			ContractItemDetailsDTO ctrmcontractItemDetailsDTO) {

		Map<String, ContractItemEstimateDTO> estimatesMapByCostComponent = contractItemDetailsDTO
				.getEstimates()
				.stream()
				.collect(
						Collectors.toMap(
								ContractItemEstimateDTO::getCostComponent,
								Function.identity(), (e1, e2) -> {
									return e1;
								}));

		ContractItemEstimateDTO connectEstimate = null;
		for (ContractItemEstimateDTO ctrmEstimate : ctrmcontractItemDetailsDTO
				.getEstimates()) {
			connectEstimate = estimatesMapByCostComponent.get(ctrmEstimate
					.getCostComponent());
			if (connectEstimate != null) {
				ctrmEstimate.setSecondaryCostId(connectEstimate
						.getSecondaryCostId());
			}

		}
	}

	private ObjectMapper getObjectMapper() {
		ObjectMapper obj = new ObjectMapper();
		obj.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		return obj;

	}

	public void upsertItemDetailsData(HttpServletRequest request, String connectData){
		JSONObject connectDataJson = new JSONObject(connectData);
		if(connectDataJson.has("itemDetails") && connectDataJson.getJSONArray("itemDetails").length() > 0){
			processItemDetailsData(request, connectDataJson);
		}
		processContractV2Data(request, connectDataJson);
	}

	public void upsertItemDetailsData(HttpServletRequest request, ContractDetailsDTO connectData){
		ObjectMapper mapper = new ObjectMapper();
		mapper.setDateFormat(new StdDateFormat().withColonInTimeZone(true));
		try {
			String result = mapper.writeValueAsString(connectData);
			JSONObject connectDataJson = new JSONObject(result);
			System.out.println(connectDataJson.toString(4));
			if(connectDataJson.has("itemDetails") && connectDataJson.getJSONArray("itemDetails").length() > 0) {
				processItemDetailsData(request, connectDataJson);
			}
			processContractV2Data(request, connectDataJson);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}

	public void processContractV2Data(HttpServletRequest request, JSONObject connectDataJson) {
		String payloadStr = null;
		JSONObject payload = new JSONObject();
		payload.put("appId", CONTRACT_APP_ID);
		payload.put("workflowTaskName", "contract_v2_update");
		payload.put("task", "contract_v2_update");
		JSONObject output = new JSONObject();
		connectDataJson.remove("itemDetails");
		output.put("contract_v2_update", connectDataJson);
		payload.put("output", output);
		payloadStr = payload.toString();
		connectRestTemplate.putContractV2Data(request, payloadStr);
	}

	public void processItemDetailsData(HttpServletRequest request, JSONObject connectDataJson) {
		String payloadStr = null;
		JSONObject payload = new JSONObject();
		payload.put("appId", CONTRACT_APP_ID);
		payload.put("workflowTaskName", "itemDetails_update");
		payload.put("task", "itemDetails_update");
		String contract_id = connectDataJson.getString("_id");
		String internalContractRefNo = null;
		if(connectDataJson.has("internalContractRefNo")){
			internalContractRefNo = connectDataJson.getString("internalContractRefNo");
		}
		String contractRefNo = null;
		if(connectDataJson.has("contractRefNo")){
			contractRefNo = connectDataJson.getString("contractRefNo");
		}
		JSONArray itemDetails = connectDataJson.getJSONArray("itemDetails");
		JSONObject itemDetailsJson = null;
		JSONArray itemDetailsWithContractId = new JSONArray();
		for (int i = 0; i < itemDetails.length(); i++) {
			itemDetailsJson = itemDetails.getJSONObject(i);
			itemDetailsJson.put("contract_id", contract_id);
			if(internalContractRefNo != null){
				itemDetailsJson.put("internalContractRefNo", internalContractRefNo);
			}
			if(contractRefNo != null){
				itemDetailsJson.put("contractRefNo", contractRefNo);
			}
			String itemNo = itemDetailsJson.get("itemNo").toString();
			itemDetailsJson.put("itemNo",itemNo);
			itemDetailsWithContractId.put(itemDetailsJson);
		}
		JSONObject output = new JSONObject();
		output.put("itemDetails_update", itemDetailsWithContractId);
		payload.put("output", output);
		payloadStr = payload.toString();
		connectRestTemplate.putItemsData(request, payloadStr);
	}

	public void checkAndUpdateDeletedItems(HttpServletRequest request, ContractDetailsDTO connectData) {
		ObjectMapper mapper = new ObjectMapper();
		mapper.setDateFormat(new StdDateFormat().withColonInTimeZone(true));
		try {
			String result = mapper.writeValueAsString(connectData);
			JSONObject connectDataJson = new JSONObject(result);
			JSONArray itemDetails = connectDataJson.getJSONArray("itemDetails");
			JSONObject itemDetailsJson = null;
			for (int i = 0; i < itemDetails.length(); i++) {
				itemDetailsJson = itemDetails.getJSONObject(i);
				Boolean isDeleted = (Boolean) itemDetailsJson.get("isDeleted");
				if(!isDeleted){
					itemDetails.remove(i);
				}
			}
			connectDataJson.put("itemDetails",itemDetails);
			processItemDetailsData(request, connectDataJson);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}


	public ContractDetailsDTO getContractDetails(HttpServletRequest request, String internalContractRefNo)
			throws ContractNotFoundException, DuplicateRecordException {

		ContractDetailsDTO contractDetailsDTO = null;

		Map<String, String> queryParams = new HashMap<>();
		queryParams.put("internalContractRefNo", internalContractRefNo);
		List<ContractDetailsDTO> contractDetails = connectRestTemplate.getData(request, queryParams, "");

		if (contractDetails != null && contractDetails.size() > 0) {
			if (contractDetails.size() > 1) {
				logger.error(Logger.EVENT_FAILURE,
						ESAPI.encoder().encodeForHTML("Duplicate contract data for " + internalContractRefNo));
				throw new DuplicateRecordException();
			}
			contractDetailsDTO = contractDetails.get(0);
		}
		if (contractDetailsDTO == null) {
			logger.error(Logger.EVENT_FAILURE, ESAPI.encoder()
					.encodeForHTML("Contract data not available in connect DB : " + internalContractRefNo));
			throw new ContractNotFoundException();
		}
		return contractDetailsDTO;
	}

}
