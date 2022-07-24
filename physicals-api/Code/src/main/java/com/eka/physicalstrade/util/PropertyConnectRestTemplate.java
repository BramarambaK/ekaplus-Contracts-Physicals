package com.eka.physicalstrade.util;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.constants.XObjectActions;
import com.eka.physicalstrade.exception.PropertyRetrivalException;

/**
 * Rest template for accessing Eka-Connect APIs
 * 
 * @author srinivasanmurugesan
 *
 */
@Service
public class PropertyConnectRestTemplate {

	private static final Logger logger = ESAPI
			.getLogger(PropertyConnectRestTemplate.class);

	private static final String OBJECT_HEADER = "X-ObjectAction";

	@Value("${eka_connect_host}")
	private String CONNECT_URL;

	@Value("${connect.api.property.physicals}")
	private String APP_PROPERTIES_PATH;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public RestTemplateUtil restTemplateUtil;

	public Map<String, Object> getAppProperties(HttpServletRequest request) {

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + APP_PROPERTIES_PATH));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		if (headers.getContentType() == null)
			headers.setContentType(MediaType.APPLICATION_JSON);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());

		HttpEntity<String> httpEntity = new HttpEntity<>("{}", headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		String url = CONNECT_URL + APP_PROPERTIES_PATH;
		try {
			ParameterizedTypeReference<HashMap<String, Object>> responseType = new ParameterizedTypeReference<HashMap<String, Object>>() {
			};

			ResponseEntity<HashMap<String, Object>> responseEntity = restTemplate
					.exchange(url, HttpMethod.POST, httpEntity, responseType);
			logger.info(Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML("Response "));
			return responseEntity.getBody();
		} catch (Exception ex) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in getting app properties : " + url), ex);
			throw new PropertyRetrivalException(APP_PROPERTIES_PATH);
		}
	}
}
