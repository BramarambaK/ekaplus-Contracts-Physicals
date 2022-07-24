package com.eka.physicalstrade.commons;

import java.util.Enumeration;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.exception.ConnectException;

@Component
public class PropertyConsumer {

	@Value("${eka_connect_host}")
	private String ekaConnectHost;

	@Autowired
	RestTemplate restTemplate;
	
	final static Logger logger = LoggerFactory.getLogger(PropertyConsumer.class);

	private static final String _PROPERTY_VALUE_KEY = "propertyValue";

	public String getPropertyFromConnect(String propertyName, String uid,HttpServletRequest request) {

		String propertyUri = ekaConnectHost + "/property/" + uid + "/" + propertyName;

		HttpHeaders httpHeaders = getHeaders(request);
		
		
		String envPropsStr = "";

		try {

			HttpEntity<Map> entityForPropRequest = new HttpEntity<Map>(httpHeaders);

			// Call Property API
			logger.info(StringUtils.normalizeSpace("Making a POST call to propertyAPI at endpoint: " + propertyUri + " with request header: "
					+ httpHeaders));
			ResponseEntity<Map> responseEntity = restTemplate.exchange(propertyUri, HttpMethod.GET,
					entityForPropRequest, Map.class);

			if (HttpStatus.OK.equals(responseEntity.getStatusCode())) {

				logger.info(StringUtils.normalizeSpace("Response from property API: " + responseEntity.getBody()));

				envPropsStr = (String) responseEntity.getBody().get(_PROPERTY_VALUE_KEY);

			} else {
				logger.error("PropertyAPI response is not in key-value format.");
				throw new ConnectException("PropertyAPI response is not in key-value format.");
			}

		} catch (HttpStatusCodeException ex) {

			logger.error("Failed to call Property API: ", ex.getResponseBodyAsString());

			throw new ConnectException("Failed to call Property API: " + ex.getResponseBodyAsString());

		}

		return envPropsStr;
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

}