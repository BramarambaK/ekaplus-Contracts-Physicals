package com.eka.consumer.service;

import java.util.Map;

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

import com.eka.consumer.exception.CollectionUpdateFailureException;
import com.eka.consumer.exception.PlatformURLMissingException;

@Service
public class PlatformRestTemplate {

	private static final Logger logger = ESAPI
			.getLogger(PlatformRestTemplate.class);

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private PropertyConnectRestTemplate propertyConnectRestTemplate;

	private String collectionAPI = "/collection/v1/append/data";

	public ResponseEntity<String> appendDataToCollection(String tenantId,
			String accessToken, String data) {

		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Appending data to platform collection.."));

		String platformURL = getPlatformURL(tenantId, accessToken);
		String url = platformURL + collectionAPI;

		HttpHeaders headers = getHeaders(accessToken, platformURL);

		logger.info(Logger.EVENT_SUCCESS, "URI : " + url);
		logger.info(Logger.EVENT_SUCCESS,
				"Headers " + headers.toSingleValueMap());
		logger.info(Logger.EVENT_SUCCESS, "Body " + data);

		HttpEntity<String> httpEntity = new HttpEntity<>(data, headers);
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(url, HttpMethod.PUT,
					httpEntity, String.class);
		} catch (HttpStatusCodeException exp) {
			logger.error(Logger.EVENT_FAILURE, exp.getMessage());
			throw new CollectionUpdateFailureException(
					exp.getResponseBodyAsString(), exp);
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE, e.getMessage());
			throw new CollectionUpdateFailureException(e.getMessage(), e);
		}

		return responseEntity;
	}

	private HttpHeaders getHeaders(String accessToken, String platformUrl) {
		HttpHeaders headers = new HttpHeaders();

		String host = platformUrl.split("://")[1];

		headers.add("Authorization", accessToken);
		headers.add("Content-Type", "application/json");
		headers.add("Host", host);
		return headers;
	}

	private String getPlatformURL(String tenantId, String accessToken) {
		Map<String, Object> properties = propertyConnectRestTemplate
				.getAppProperties(tenantId, accessToken);

		String platformURL = null;
		if (properties.get("eka_platform_host") == null) {
			throw new PlatformURLMissingException(tenantId);
		}
		platformURL = (String) properties.get("eka_platform_host");

		return platformURL;
	}
}
