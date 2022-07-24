package com.eka.consumer.service;

import java.util.Map;

import com.eka.consumer.exception.ConnectDataSaveException;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class ConnectDataSaveRestTemplate {

    private static final Logger logger = ESAPI
            .getLogger(ConnectDataSaveRestTemplate.class);

    @Value("${connect.host}")
    private String connectHost;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PropertyConnectRestTemplate propertyConnectRestTemplate;

    private String connectWorkflowAPI = "/workflow";

    public ResponseEntity<String> appendDataToCollection(String tenantId,
                                                         String accessToken, String data) {

        logger.debug(
                Logger.EVENT_SUCCESS,
                ESAPI.encoder().encodeForHTML(
                        "Saving data to connect collection.."));

        String url = connectHost + connectWorkflowAPI;

        HttpHeaders headers = getHeaders(accessToken, tenantId);

        logger.info(Logger.EVENT_SUCCESS, "URI for connect data save : " + url);
        logger.info(Logger.EVENT_SUCCESS,
                "Headers " + headers.toSingleValueMap());
        logger.info(Logger.EVENT_SUCCESS, "Body for saving priceData to connect - itemGmrFormulaPriceCollection_create" + data);

        HttpEntity<String> httpEntity = new HttpEntity<>(data, headers);
        ResponseEntity<String> responseEntity = null;
        try {
            responseEntity = restTemplate.exchange(url, HttpMethod.POST,
                    httpEntity, String.class);
        } catch (HttpStatusCodeException exp) {
            logger.error(Logger.EVENT_FAILURE, exp.getMessage());
            throw new ConnectDataSaveException(
                    exp.getResponseBodyAsString(), exp);
        } catch (Exception e) {
            logger.error(Logger.EVENT_FAILURE, e.getMessage());
            throw new ConnectDataSaveException(e.getMessage(), e);
        }

        return responseEntity;
    }

    private HttpHeaders getHeaders(String accessToken, String tenantID) {
        HttpHeaders headers = new HttpHeaders();

        headers.add("Authorization", accessToken);
        headers.add("Content-Type", "application/json");
        headers.add("X-TenantID", tenantID);
        return headers;
    }

}
