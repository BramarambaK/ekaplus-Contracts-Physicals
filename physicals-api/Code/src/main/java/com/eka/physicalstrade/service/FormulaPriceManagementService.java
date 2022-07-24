package com.eka.physicalstrade.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.exception.CloneObjectDataNotFoundException;
import com.eka.physicalstrade.exception.PricingAPIException;
import com.eka.physicalstrade.util.ConnectRestTemplate;
import com.eka.physicalstrade.util.PricingAPIRestTemplate;

@Service
public class FormulaPriceManagementService {

	private static final Logger logger = ESAPI
			.getLogger(FormulaPriceManagementService.class);

	@Autowired
	private PricingAPIRestTemplate pricingAPIRestTemplate;
	@Autowired
	private ConnectRestTemplate connectRestTemplate;
	@Autowired
	@Qualifier("itemFormulaPricePublisher")
	private ItemFormulaPricePublisher itemFormulaPricePublisher;

	@Value("${pricing.application.uuid}")
	private String PRICING_APP_ID;
	@Value("${pricing.object.formula}")
	private String FORMULA_OBJECT;

	public void populateFormulaPriceDetails(HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTO) throws PricingAPIException {

		List<CompletableFuture<String>> pricingAPIFutures = new ArrayList<CompletableFuture<String>>();
		Map<String, List<String>> pricingErrorMessageMap = new HashMap<>();
		RequestContext requestContext = RequestContextHolder
				.getCurrentContext();

		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Formula pricing api call started"));

		String _id = contractDetailsDTO.get_id();
		Date asOfDate = new Date();

		for (ContractItemDetailsDTO contractItemDetailsDTO : contractDetailsDTO
				.getItemDetails()) {

			if (contractItemDetailsDTO.getIsDeleted()) {
				logger.info(
						Logger.EVENT_SUCCESS,
						ESAPI.encoder().encodeForHTML(
								"Skipping Item as it is marked as deleted "
										+ contractItemDetailsDTO.getItemNo()));
				continue;
			}

			if ("FormulaPricing".equals(contractItemDetailsDTO.getPricing()
					.getPriceTypeId())) {
				CompletableFuture<String> pricingAPIFuture = pricingAPIRestTemplate
						.getPriceForItem(_id, asOfDate, contractItemDetailsDTO,
								requestContext);
				pricingAPIFutures.add(pricingAPIFuture);

			}
		}

		if (pricingAPIFutures != null && !pricingAPIFutures.isEmpty()) {
			CompletableFuture.allOf(pricingAPIFutures
					.toArray(new CompletableFuture[pricingAPIFutures.size()]));

			for (CompletableFuture<String> priceResponse : pricingAPIFutures) {
				try {
					logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder()
							.encodeForHTML(priceResponse.get()));
				} catch (ExecutionException e) {
					String message = e.getMessage();
					String itemNo = "0";
					if (e.getCause() instanceof PricingAPIException) {
						PricingAPIException pe = (PricingAPIException) e
								.getCause();
						message = pe.getMessage();
						itemNo = String.valueOf(pe.getItemNo());
					}
					List<String> itemNos = pricingErrorMessageMap.get(message);
					if (itemNos == null) {
						itemNos = new ArrayList<>();
					}
					itemNos.add(itemNo);
					pricingErrorMessageMap.put(message, itemNos);

					logger.debug(Logger.EVENT_FAILURE,
							"Error in getting formula price" + e.getMessage());
				} catch (InterruptedException e) {
					String message = e.getMessage();
					pricingErrorMessageMap.put(message, Arrays.asList("0"));

					logger.debug(Logger.EVENT_FAILURE,
							"Error in getting formula price" + message);
				}
			}

			if (!pricingErrorMessageMap.isEmpty()) {
				String message = pricingErrorMessageMap
						.entrySet()
						.stream()
						.map((entry) -> entry.getKey() + " , for Item : "
								+ entry.getValue())
						.collect(Collectors.joining("\n"));
				throw new PricingAPIException(message);
			}
		}
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Formula pricing api call completed"));
	}

	public void processBulkPricing(HttpServletRequest request) {

		RequestContext requestContext = RequestContextHolder
				.getCurrentContext();
		Map<String, String> queryParams = new HashMap<>();
		queryParams.put("contractState", "trade");
		queryParams.put("itemDetails.pricing.priceTypeId", "FormulaPricing");
		int start = 0;
		int limit = 50;
		JSONObject connectPayloadJson = null;
		JSONObject pagination = null;
		while (true) {
			connectPayloadJson = new JSONObject();
			pagination = new JSONObject();
			try {
				connectPayloadJson.put("pagination", pagination);
				pagination.put("start", start);
				pagination.put("limit", limit);
				start = start + limit;

			} catch (JSONException e) {
				logger.error(Logger.EVENT_FAILURE, "Error in JSON parsing", e);
			}
			String connectPayload = connectPayloadJson.toString();
			List<ContractDetailsDTO> contractDetails = connectRestTemplate
					.getData(request, queryParams, connectPayload);
			if (contractDetails == null || contractDetails.isEmpty()) {

				logger.info(
						Logger.EVENT_SUCCESS,
						ESAPI.encoder().encodeForHTML(
								"No Contracts to process for Bulk Pricing"));

				break;
			}

			logger.info(Logger.EVENT_SUCCESS, "CONTRACT PAGINATION OBJECT "
					+ pagination.toString());
			logger.info(Logger.EVENT_SUCCESS, "CONTRACT RETRIEVED SIZE "
					+ contractDetails.size());

			/*
			 * CompletableFuture.runAsync(() -> processContracts(request,
			 * requestContext, contractDetails));
			 */

		}

		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Bulk Pricing processing completed for Contracts : "));
	}

	public String cloneFormula(HttpServletRequest request, String formulaId)
			throws JSONException, CloneObjectDataNotFoundException {
		String data = getFormulaClonePayload(formulaId);
		String clonedFormula = connectRestTemplate.cloneData(request, data,
				PRICING_APP_ID, FORMULA_OBJECT);
		if (StringUtils.isEmpty(clonedFormula)) {
			throw new CloneObjectDataNotFoundException(FORMULA_OBJECT);
		}

		JSONObject formulaObject = new JSONObject(clonedFormula);
		String clonedFormulaId = formulaObject.getString(GlobalConstants._ID);

		return clonedFormulaId;
	}

	private String getFormulaClonePayload(String _id) throws JSONException {
		JSONObject payload = new JSONObject();
		payload.put(GlobalConstants._ID, _id);
		payload.put(GlobalConstants._AUTO_CREATED, true);
		return payload.toString();
	}

	private void processContracts(HttpServletRequest request,
			RequestContext requestContext,
			List<ContractDetailsDTO> contractDetails) {
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Bulk Pricing processing started for Contracts : "
								+ contractDetails.size()));

		for (ContractDetailsDTO contractDetailsDTO : contractDetails) {
			CompletableFuture.runAsync(() -> {
				populateFormulaPriceDetails(request, contractDetailsDTO);
				itemFormulaPricePublisher.publish(requestContext,
						contractDetailsDTO);
			});
		}
	}
}
