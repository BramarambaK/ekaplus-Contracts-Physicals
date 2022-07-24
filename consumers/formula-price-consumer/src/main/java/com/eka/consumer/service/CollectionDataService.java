package com.eka.consumer.service;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eka.consumer.constants.GlobalConstants;
import com.eka.consumer.dataobject.FormulaPriceData;

@Service
public class CollectionDataService {

	private static final Logger logger = ESAPI
			.getLogger(CollectionDataService.class);

	@Autowired
	private PlatformRestTemplate platformRestTemplate;

	public void updateItemGmrFormulaPriceCollection(
			FormulaPriceData formulaPriceData) {

		String accessToken = formulaPriceData.getAccessToken();
		String tenantId = formulaPriceData.getTenantId();
		String formulaPriceDetails = formulaPriceData.getFormulaPriceDetails();

		String collectionDataPayload = getPayload(formulaPriceDetails);

		if (collectionDataPayload == null) {
			logger.error(Logger.EVENT_FAILURE,
					"Error in creating collection data payload ");
			return;
		}

		platformRestTemplate.appendDataToCollection(tenantId, accessToken,
				collectionDataPayload);

		logger.info(Logger.EVENT_SUCCESS,
				"Formula price details sucessfully appended in collection");

	}

	private String getPayload(String formulaPriceDetails) {
		String payloadStr = null;
		try {
			JSONObject formulaPriceDetailsJson = new JSONObject(
					formulaPriceDetails);
			JSONObject payload = new JSONObject();
			JSONArray collectionData = new JSONArray();

			payload.put("collectionName",
					GlobalConstants.ITEM_GMR_FORMULA_PRICE_COLLECTION);
			payload.put("collectionDescription",
					GlobalConstants.ITEM_GMR_FORMULA_PRICE_COLLECTION);
			payload.put("dataLoadOption", "append");
			payload.put("collectionHeader", getCollectionHeader());
			payload.put("collectionData", collectionData);

			JSONArray priceData = null;

			JSONObject contractJson = formulaPriceDetailsJson
					.getJSONObject("contract");

			JSONArray itemDetailsArray = contractJson
					.getJSONArray("itemDetails");

			String asOfDate = contractJson.getString("asOfDate");
			String internalContractRefNo = contractJson.getString("refNo");

			JSONObject itemDetailsJson = null;
			JSONObject priceDetails = null;
			String gmrRefNo = "";
			String internalContractItemRefNo = null;
			double contractPrice = 0d;
			double marketPrice = 0d;
			String priceUnit = "";
			String internalPriceUnitId = "";
			for (int i = 0; i < itemDetailsArray.length(); i++) {
				itemDetailsJson = itemDetailsArray.getJSONObject(i);

				priceData = new JSONArray();

				internalContractItemRefNo = itemDetailsJson.getString("refNo");
				priceDetails = itemDetailsJson.getJSONObject("priceDetails");
				priceUnit = priceDetails.getString("priceUnit");
				internalPriceUnitId = priceDetails
						.getString("internalPriceUnitId");
				contractPrice = Double.valueOf(priceDetails
						.getString("contractPrice"));
				marketPrice = Double.valueOf(priceDetails
						.getString("marketPrice"));

				if (itemDetailsJson.has("gmrDetails")) {
					JSONArray gmrDetails = itemDetailsJson
							.getJSONArray("gmrDetails");
					JSONObject gmrDetail = gmrDetails.getJSONObject(0);
					if (gmrDetail != null) {
						gmrRefNo = gmrDetail.getString("refNo");
					}
				}

				priceData.put(asOfDate);
				priceData.put(internalContractRefNo);
				priceData.put(internalContractItemRefNo);
				priceData.put(gmrRefNo);
				priceData.put(contractPrice);
				priceData.put(marketPrice);
				priceData.put(priceUnit);
				priceData.put(internalPriceUnitId);
				collectionData.put(priceData);

				payloadStr = payload.toString();
			}

		} catch (JSONException e) {
			logger.error(Logger.EVENT_FAILURE,
					"Error in parsing formula price details", e);
		}

		return payloadStr;
	}

	private JSONArray getCollectionHeader() {

		JSONArray collectionHeader = new JSONArray();

		try {
			collectionHeader.put(new JSONObject(
					"{'fieldName':'As Of Date','dataType':'String'}"));
			collectionHeader
					.put(new JSONObject(
							"{'fieldName':'Internal Contract Ref No','dataType':'String'}"));
			collectionHeader
					.put(new JSONObject(
							"{'fieldName':'Internal Contract Item Ref No','dataType':'String'}"));
			collectionHeader.put(new JSONObject(
					"{'fieldName':'GMR Ref No','dataType':'String'}"));
			collectionHeader.put(new JSONObject(
					"{'fieldName':'Contract Price','dataType':'Number'}"));
			collectionHeader.put(new JSONObject(
					"{'fieldName':'Market Price','dataType':'Number'}"));
			collectionHeader.put(new JSONObject(
					"{'fieldName':'Price Unit','dataType':'String'}"));
			collectionHeader
					.put(new JSONObject(
							"{'fieldName':'Internal Price Unit Id','dataType':'String'}"));

		} catch (JSONException e) {
			logger.error(Logger.EVENT_FAILURE,
					"Error in creating collection header", e);
		}

		return collectionHeader;

	}
}
