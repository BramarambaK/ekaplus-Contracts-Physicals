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
public class ConnectDataService {
    private static final Logger logger = ESAPI
            .getLogger(ConnectDataService.class);

    @Autowired
    private ConnectDataSaveRestTemplate connectDataSaveRestTemplate;

    public void updateConnectItemGmrFormulaPriceCollection(
            FormulaPriceData formulaPriceData) {

        String accessToken = formulaPriceData.getAccessToken();
        String tenantId = formulaPriceData.getTenantId();
        String formulaPriceDetails = formulaPriceData.getFormulaPriceDetails();

        String connectDataPayload = getPayload(formulaPriceDetails);

        if (connectDataPayload == null) {
            logger.error(Logger.EVENT_FAILURE,
                    "Error in creating connect itemGmrFormulaPrice  create data payload ");
            return;
        } else {
            String logMsg = String.format("Formula price payload for connect save API %s", connectDataPayload);
            logger.info(Logger.EVENT_SUCCESS, logMsg);
        }

        connectDataSaveRestTemplate.appendDataToCollection(tenantId, accessToken,
                connectDataPayload);

        logger.info(Logger.EVENT_SUCCESS,
                "Formula price details successfully saved in connect");

    }

    private String getPayload(String formulaPriceDetails) {
        String payloadStr = null;
        try {
            JSONObject formulaPriceDetailsJson = new JSONObject(
                    formulaPriceDetails);
            JSONObject payload = new JSONObject();
            JSONObject output = new JSONObject();
            JSONArray collectionData = new JSONArray();

            output.put(GlobalConstants.CONNECT_ITEM_GMR_FORMULA_PRICE_COLLECTION_CREATE_TASK, collectionData);

            payload.put("appId",
                    GlobalConstants.PHYSICALS_APP_ID);
            payload.put("workflowTaskName",
                    GlobalConstants.CONNECT_ITEM_GMR_FORMULA_PRICE_COLLECTION_CREATE_TASK);
            payload.put("task", GlobalConstants.CONNECT_ITEM_GMR_FORMULA_PRICE_COLLECTION_CREATE_TASK);
            payload.put("output", output);

            JSONObject priceData = null;

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

                priceData = new JSONObject();

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

                priceData.put("asOfDate",asOfDate);
                priceData.put("internalContractRefNo",internalContractRefNo);
                priceData.put("internalContractItemRefNo",internalContractItemRefNo);
                priceData.put("gmrRefNo",gmrRefNo);
                priceData.put("contractPrice",contractPrice);
                priceData.put("marketPrice",marketPrice);
                priceData.put("priceUnit",priceUnit);
                priceData.put("internalPriceUnitId",internalPriceUnitId);
                collectionData.put(priceData);

                payloadStr = payload.toString();
            }

        } catch (JSONException e) {
            logger.error(Logger.EVENT_FAILURE,
                    "Error in parsing formula price details", e);
        }
        return payloadStr;
    }

}
