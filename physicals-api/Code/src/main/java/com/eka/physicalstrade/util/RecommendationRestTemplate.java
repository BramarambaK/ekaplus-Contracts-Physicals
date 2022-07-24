package com.eka.physicalstrade.util;

import org.json.JSONException;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.eka.physicalstrade.constants.XObjectActions;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;

/**
 * Rest template for accessing Recommendation APIs
 * 
 * @author srinivasanmurugesan
 *
 */
@Service
public class RecommendationRestTemplate {

	private static final Logger logger = ESAPI
			.getLogger(RecommendationRestTemplate.class);

	private static final String OBJECT_HEADER = "X-ObjectAction";
	private static final String REF_ID_HEADER = "X-RefId";
	private static final String OBJECT_NAME_HEADER = "X-ObjectName";
	private static final String RECCOMENDATION_HOST_PROPERTY_NAME = "eka_contract_recommendation_host";

	@Value("${recommendation.modeller.path}")
	private String RECOMMENDATION_MODELLER_PATH;

	@Value("${connect.uri.data}")
	private String CONNECT_URI_DATA;

	@Value("${connect.application}")
	private String REF_TYPE_ID;

	@Value("${connect.object.contract}")
	private String OBJECT_NAME;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public RestTemplateUtil restTemplateUtil;

	/**
	 * Get all contract data from Connect database
	 * 
	 * @param request
	 * @return
	 * @throws JSONException
	 */
	public ResponseEntity<String> pushContractData(RequestContext requestContext)
			throws JSONException {

		String url = getRecommendationHost() + RECOMMENDATION_MODELLER_PATH;
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("URL " + url));
		HttpHeaders headers = restTemplateUtil.getHttpHeader(requestContext
				.getHeaders());
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.add(REF_ID_HEADER, REF_TYPE_ID);
		headers.add(OBJECT_NAME_HEADER, OBJECT_NAME);

		JSONObject body = new JSONObject();
		body.put("userId", requestContext.getTokenData().getId());
		// body.put("contractState", "trade");

		HttpEntity<String> httpEntity = new HttpEntity<>(body.toString(),
				headers);
		logger.debug(Logger.EVENT_SUCCESS, ESAPI.encoder().encodeForHTML("Headers " + headers));
		ResponseEntity<String> responseEntity = restTemplate.exchange(url,
				HttpMethod.POST, httpEntity, String.class);
		logger.info(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Response " + responseEntity));
		return responseEntity;
	}

	private String getRecommendationHost() {
		String recommendationHost = null;
		RequestContext requestContext = RequestContextHolder.getCurrentContext();
		if (requestContext != null) {
			recommendationHost = (String) requestContext.getAppProperties()
					.get(RECCOMENDATION_HOST_PROPERTY_NAME);
		}

		if (recommendationHost == null) {
			logger.debug(
					Logger.EVENT_SUCCESS,
					ESAPI.encoder()
							.encodeForHTML(
									"Recommendation host is null. Error in getting the property data"));
		}
		return recommendationHost;
	}
}
