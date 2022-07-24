package com.eka.physicalstrade.service;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.dataobject.CreditCheckItemDetail;
import com.eka.physicalstrade.dataobject.CreditCheckRequest;
import com.eka.physicalstrade.dataobject.CreditCheckResponse;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.exception.CreditRiskAPIException;
import com.eka.physicalstrade.util.CreditRiskAPIRestTemplate;

@Service
public class CreditCheckService {

	private static final Logger logger = ESAPI.getLogger(CreditCheckService.class);

	@Autowired
	private CreditRiskAPIRestTemplate creditRiskAPIRestTemplate;

	public void doCPCreditCheck(ContractDetailsDTO contractDetailsDTO) throws CreditRiskAPIException {
		RequestContext requestContext = RequestContextHolder.getCurrentContext();

		String creditRiskIntegRequired = (String) requestContext.getAppProperties()
				.getOrDefault(GlobalConstants.CREDIT_CHECK_REQUIRED_FLAG, null);

		if (null == creditRiskIntegRequired || "false".equalsIgnoreCase(creditRiskIntegRequired)) {
			logger.info(Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML("Credit check skipped - " + creditRiskIntegRequired));
			return;
		}

		CreditCheckRequest creditCheckRequest = prepareCreditCheckRequest(contractDetailsDTO);

		CreditCheckResponse creditCheckResponse = creditRiskAPIRestTemplate.checkCPCredit(creditCheckRequest);

		if ("success".equalsIgnoreCase(creditCheckResponse.getStatus())) {
			logger.info(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Credit check Success"));
			return;
		} else {
			if ("Hard Block".equalsIgnoreCase(creditCheckResponse.getBlockType())) {
				throw new CreditRiskAPIException(creditCheckResponse.getDescription(),
						creditCheckRequest.getCounterParty());
			}
		}
	}

	private CreditCheckRequest prepareCreditCheckRequest(ContractDetailsDTO contractDetailsDTO) {
		CreditCheckRequest creditCheckRequest = new CreditCheckRequest();
		List<CreditCheckItemDetail> creditCheckItemDetails = new ArrayList<>();
		creditCheckRequest.setItemDetails(creditCheckItemDetails);

		populateContractData(contractDetailsDTO, creditCheckRequest);
		CreditCheckItemDetail creditCheckItemDetail = null;
		for (ContractItemDetailsDTO contractItemDetailsDTO : contractDetailsDTO.getItemDetails()) {
			creditCheckItemDetail = getCreditCheckItemData(contractItemDetailsDTO, creditCheckRequest);
			creditCheckItemDetails.add(creditCheckItemDetail);
		}

		return creditCheckRequest;
	}

	private void populateContractData(ContractDetailsDTO contractDetailsDTO, CreditCheckRequest creditCheckRequest) {
		String generalDetailsDisplayDetails = contractDetailsDTO.getGeneralDetailsDisplayValue();

		try {
			JSONObject generalDetails = new JSONObject(generalDetailsDisplayDetails);
			creditCheckRequest.setCounterParty(generalDetails.getString("cpProfileIdDisplayName"));
			creditCheckRequest.setPaymentTerm(generalDetails.getString("paymentTermIdDisplayName"));
		} catch (Exception e) {
			logger.debug(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error in getting generalDetails display values"), e);
		}
		String contractType = contractDetailsDTO.getContractType() == "P" ? "Purchase" : "Sales";
		creditCheckRequest.setContractType(contractType);
		creditCheckRequest.setEventName(contractType+" Contract Create");
		creditCheckRequest.setOperationType("CREATE");

	}

	private CreditCheckItemDetail getCreditCheckItemData(ContractItemDetailsDTO contractItemDetailsDTO,
			CreditCheckRequest creditCheckRequest) {
		CreditCheckItemDetail creditCheckItemDetails = new CreditCheckItemDetail();
		String itemDisplayValue = contractItemDetailsDTO.getItemDisplayValue();

		JSONObject itemDisplayValues = new JSONObject(itemDisplayValue);

		creditCheckItemDetails.setPayInCurrency(itemDisplayValues.getString("payInCurIdDisplayName"));
		creditCheckItemDetails.setFromPeriod(contractItemDetailsDTO.getDeliveryFromDate());
		creditCheckItemDetails.setToPeriod(contractItemDetailsDTO.getDeliveryToDate());

		double itemValue = getItemValue(contractItemDetailsDTO);
		creditCheckItemDetails.setValue(itemValue);

		return creditCheckItemDetails;
	}

	private double getItemValue(ContractItemDetailsDTO contractItemDetailsDTO) {

		double itemValue = 0d;
		double contractPrice = 0d;
		double quantity = 0d;

		String priceType = contractItemDetailsDTO.getPricing().getPriceTypeId();
		switch (priceType) {
		case GlobalConstants.FLAT_PRICE_TYPE:
			contractPrice = contractItemDetailsDTO.getPricing().getPriceDf().doubleValue();
			break;
		case GlobalConstants.FORMULA_PRICE_TYPE:
			contractPrice = getFormulaPriceForItem(contractItemDetailsDTO);
			break;
		default:
			return 0;
		}

		quantity = contractItemDetailsDTO.getItemQty().doubleValue();
		itemValue = quantity * contractPrice;

		return itemValue;
	}

	private double getFormulaPriceForItem(ContractItemDetailsDTO contractItemDetailsDTO) {
		double contractPrice = 0d;
		String formulaPriceDetails = contractItemDetailsDTO.getFormulaPriceDetails();
		int itemNo = contractItemDetailsDTO.getItemNo();

		if (formulaPriceDetails == null) {
			logger.debug(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("formulaPriceDetails is empty for item " + itemNo));
		}
		try {
			JSONObject formulaPriceJson = new JSONObject(formulaPriceDetails);
			JSONObject contractData = formulaPriceJson.getJSONObject("contract");
			JSONArray itemDetails = contractData.getJSONArray("itemDetails");
			JSONObject itemData = itemDetails.getJSONObject(0);

			JSONObject priceDetails = itemData.getJSONObject("priceDetails");
			contractPrice = priceDetails.getDouble("contractPrice");

		} catch (Exception e) {
			logger.debug(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error in getting formula price details " + itemNo), e);
		}
		return contractPrice;
	}

}
