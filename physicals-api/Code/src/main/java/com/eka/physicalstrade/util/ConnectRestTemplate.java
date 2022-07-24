package com.eka.physicalstrade.util;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import com.eka.physicals.dto.ContractItemDetailsDTO;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicalstrade.constants.XObjectActions;
import com.eka.physicalstrade.dataobject.TokenData;
import com.eka.physicalstrade.exception.ConnectException;

/**
 * Rest template for accessing Eka-Connect APIs
 * 
 * @author srinivasanmurugesan
 *
 */
@Service
public class ConnectRestTemplate {

	private static final Logger logger = ESAPI
			.getLogger(ConnectRestTemplate.class);

	private static final String OBJECT_HEADER = "X-ObjectAction";

	@Value("${connect.uri.data}")
	private String CONNECT_URI_DATA;

	@Value("${connect.uri.data.base}")
	private String CONNECT_URI_DATA_BASE;

	@Value("${connect.uri.data.clone}")
	private String CONNECT_URI_DATA_CLONE;

	@Value("${eka_connect_host}")
	private String CONNECT_URL;

	@Value("${connect.application}")
	private String APP_ID;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public RestTemplateUtil restTemplateUtil;
	@Autowired
	CommonValidator validator;

	/**
	 * Get all contract data from Connect database
	 * 
	 * @param request
	 * @return
	 */
	public ResponseEntity<String> getAllData(HttpServletRequest request) {

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + CONNECT_URI_DATA));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());

		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		ResponseEntity<String> responseEntity = restTemplate.exchange(
				CONNECT_URI_DATA, HttpMethod.GET, httpEntity, String.class);

		return responseEntity;
	}

	/**
	 * Get Contract object data from Connect database for an id
	 * 
	 * @param id
	 * @param request
	 * @return
	 */
	public ResponseEntity<String> getData(String id, HttpServletRequest request) {

		String url = validator.cleanData(CONNECT_URI_DATA + "/" + id);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));

		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers : " + headers));
		ResponseEntity<String> responseEntity = restTemplate.exchange(url,
				HttpMethod.GET, httpEntity, String.class);

		return responseEntity;
	}

	/**
	 * Get Contract object data from Connect database for an id
	 * 
	 * @param id
	 * @param request
	 * @return
	 */
//	public List<ContractDetailsDTO> getDataCombinedV2(HttpServletRequest request,
//			Map<String, String> queryParams, String payload) {
//
//		try {
//			List<ContractDetailsDTO> contractDetailsDTOs = null;
//			contractDetailsDTOs = getContractV2Data(request, queryParams, payload);
//			List<ContractItemDetailsDTO> ContractItemDetailsDTO = null;
//			ContractItemDetailsDTO = getItemDetailsData(request, queryParams, payload);
//			ContractDetailsDTO contractDetailsDTO1 = null;
//			contractDetailsDTO1 = contractDetailsDTOs.get(0);
//			contractDetailsDTO1.setItemDetails(ContractItemDetailsDTO);
//			return contractDetailsDTOs;
//		} catch (Exception e) {
//			List<ContractDetailsDTO> contractDetailsDTOs = null;
//			contractDetailsDTOs = getOldContractData(request, queryParams, payload);
//			return contractDetailsDTOs;
//		}
//	}

	/**
	 * Get Old Big Contract object data from Connect database for an id
	 *
	 * @param id
	 * @param request
	 * @return
	 */
	public List<ContractDetailsDTO> getData(HttpServletRequest request,
											Map<String, String> queryParams, String payload) {

		List<ContractDetailsDTO> ContractDetailsDTO = null;
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());
		HttpEntity<String> httpEntity = new HttpEntity<>(payload, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers : " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Query Params : " + queryParams));

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(CONNECT_URI_DATA);

		if (queryParams != null) {
			for (Entry<String, String> entry : queryParams.entrySet()) {
				builder.queryParam(entry.getKey(), entry.getValue());

			}
		}
		String url = builder.toUriString();
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));

		ResponseEntity<List<ContractDetailsDTO>> responseEntity = null;

		try {

			responseEntity = restTemplate.exchange(url, HttpMethod.GET,
					httpEntity,
					new ParameterizedTypeReference<List<ContractDetailsDTO>>() {
					});

			ContractDetailsDTO = responseEntity.getBody();
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(
					"Error in getting contract data from connect for "
							+ queryParams);
		}

		return ContractDetailsDTO;

	}

	/**
	 * Get object data from Connect database for an app , object & queryParam or
	 * payload
	 * 
	 * @param id
	 * @param request
	 * @return
	 */
	public List<String> getObjectData(HttpServletRequest request, String appId,
			String objectId, Map<String, String> queryParams, String payload) {

		List<String> objectData = null;
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());
		HttpEntity<String> httpEntity = new HttpEntity<>(payload, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers : " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Query Params : " + queryParams));

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(CONNECT_URI_DATA_BASE + "/" + appId + "/"
						+ objectId);

		if (queryParams != null) {
			for (Entry<String, String> entry : queryParams.entrySet()) {
				builder.queryParam(entry.getKey(), entry.getValue());

			}
		}
		String url = builder.toUriString();
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));

		ResponseEntity<List<String>> responseEntity = null;

		try {

			responseEntity = restTemplate.exchange(url, HttpMethod.GET,
					httpEntity, new ParameterizedTypeReference<List<String>>() {
					});

			objectData = responseEntity.getBody();
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(
					"Error in getting object data from connect for "
							+ queryParams);
		}

		return objectData;
	}

	/**
	 * Create Contract data in Eka-Connect
	 * 
	 * type can be trade/draft/template
	 * 
	 * @param request
	 * @param data
	 * @param type
	 * @return
	 */
	public ResponseEntity<String> postData(HttpServletRequest request,
			String data, String type) {

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Post : URL " + CONNECT_URI_DATA));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.CREATE.name());

		HttpEntity<String> httpEntity = new HttpEntity<>(data, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Request " + data));
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(CONNECT_URI_DATA,
					HttpMethod.POST, httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error "
									+ httpClientErrorException
											.getResponseBodyAsString()),
					httpClientErrorException);
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(e.getLocalizedMessage());
		}
		return responseEntity;

	}

	/**
	 * Create Contract data in Eka-Connect
	 * 
	 * type can be trade/draft/template
	 * 
	 * @param request
	 * @param data
	 * @param type
	 * @return
	 */
	public ContractDetailsDTO postData(HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTO) {

		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.CREATE.name());

		HttpEntity<ContractDetailsDTO> httpEntity = new HttpEntity<>(
				contractDetailsDTO, headers);
		ResponseEntity<ContractDetailsDTO> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(CONNECT_URI_DATA,
					HttpMethod.POST, httpEntity, ContractDetailsDTO.class);
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(e.getLocalizedMessage());
		}
		return responseEntity.getBody();

	}

	/**
	 * Update contract data in Eka-Connect for an id
	 * 
	 * @param request
	 * @param data
	 * @param id
	 * @return
	 */
	@Deprecated
	public ResponseEntity<String> putData(HttpServletRequest request,
			String data, String id) {

		String url = validator.cleanData(CONNECT_URI_DATA + "/" + id);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.UPDATE.name());

		HttpEntity<String> httpEntity = new HttpEntity<>(data, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		ResponseEntity<String> responseEntity = null;

		try {
			responseEntity = restTemplate.exchange(url, HttpMethod.PUT,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error "
									+ httpClientErrorException
											.getResponseBodyAsString()),
					httpClientErrorException);
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(e.getLocalizedMessage());
		}
		return responseEntity;

	}

	/**
	 * Update contract data in Eka-Connect for an id
	 * 
	 * @param request
	 * @param data
	 * @param id
	 * @return
	 */
	public ContractDetailsDTO putData(HttpServletRequest request,
			ContractDetailsDTO contractDetailsDTO) {

		String url = validator.cleanData(CONNECT_URI_DATA + "/"
				+ contractDetailsDTO.get_id());
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.UPDATE.name());

		HttpEntity<ContractDetailsDTO> httpEntity = new HttpEntity<>(
				contractDetailsDTO, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		ResponseEntity<ContractDetailsDTO> responseEntity = null;

		try {
			responseEntity = restTemplate.exchange(url, HttpMethod.PUT,
					httpEntity, ContractDetailsDTO.class);

		} catch (HttpClientErrorException httpClientErrorException) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error "
									+ httpClientErrorException
											.getResponseBodyAsString()),
					httpClientErrorException);

			throw new ConnectException(
					httpClientErrorException.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(e.getLocalizedMessage());
		}
		return responseEntity.getBody();

	}

	/**
	 * Delete contract data
	 * 
	 * @param request
	 * @param id
	 * @return
	 */
	public ResponseEntity<String> deleteData(HttpServletRequest request,
			String id) {

		String url = validator.cleanData(CONNECT_URI_DATA + "/" + id);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Post : URL " + url));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.DELETE.name());

		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		ResponseEntity<String> responseEntity = restTemplate.exchange(url,
				HttpMethod.DELETE, httpEntity, String.class);

		return responseEntity;

	}

	public TokenData getUserInfo(HttpServletRequest request) {

		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		if (headers.getContentType() == null)
			headers.setContentType(MediaType.APPLICATION_JSON);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());

		String url = CONNECT_URL + "/api/userinfo";
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		try {
			ResponseEntity<TokenData> responseEntity = restTemplate.exchange(
					url, HttpMethod.GET, httpEntity, TokenData.class);

			return responseEntity.getBody();
		} catch (HttpClientErrorException hcee) {

			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in getting user info " + url), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());

		} catch (Exception ex) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in getting user info " + url), ex);
			throw new ConnectException(ex.getLocalizedMessage());
		}

	}

	/**
	 * Update contract V2 with only generalDetails in Eka-Connect
	 *
	 * @param request
	 * @param data
	 * @return
	 */
	public ResponseEntity<String> putContractV2Data(HttpServletRequest request,
											   String data) {
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Contract V2 data save to connect started"));

		String url = CONNECT_URL + "/workflow";
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);

		HttpEntity<String> httpEntity = new HttpEntity<>(data,
				headers);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Body " + data));
		ResponseEntity<String> responseEntity = null;

		try {
			responseEntity = restTemplate.exchange(url, HttpMethod.POST,
					httpEntity, String.class);
			logger.info(Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML("Connect contract v2 object successfully updated in connect DB "));
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException("Error in saving contract v2 object data to connect");
		}
		return responseEntity;

	}

	/**
	 * Update contract items in Eka-Connect for an id
	 *
	 * @param request
	 * @param data
	 * @return
	 */
	public ResponseEntity<String> putItemsData(HttpServletRequest request,
										  String data) {
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("ItemDetailsObject save to connect started"));

		String url = CONNECT_URL + "/workflow";
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);

		HttpEntity<String> httpEntity = new HttpEntity<>(data,
				headers);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Body " + data));
		ResponseEntity<String> responseEntity = null;

		try {
			responseEntity = restTemplate.exchange(url, HttpMethod.POST,
					httpEntity, String.class);
			logger.info(Logger.EVENT_SUCCESS,
					ESAPI.encoder().encodeForHTML("Connect ItemDetails objects successfully updated in connect DB "));
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException("Error in saving contract itemDetails object to connect");
		}
		return responseEntity;

	}

	/**
	 * Clone object data in Eka-Connect
	 * 
	 * @param request
	 * @param data
	 * @param type
	 * @return
	 */
	public String cloneData(HttpServletRequest request, String data,
			String appId, String object) {

		String response = null;
		String cloneURL = CONNECT_URI_DATA_CLONE + "/" + appId + "/" + object;

		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Post : Clone URL " + CONNECT_URI_DATA_CLONE));
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);

		HttpEntity<String> httpEntity = new HttpEntity<>(data, headers);

		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(cloneURL, HttpMethod.POST,
					httpEntity, String.class);

			if (HttpStatus.OK.equals(responseEntity.getStatusCode())) {
				response = responseEntity.getBody();
			}
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(e.getLocalizedMessage());
		}
		return response;

	}

	public List<ContractDetailsDTO> getContractV2Data(HttpServletRequest request,
											Map<String, String> queryParams, String payload) {

		List<ContractDetailsDTO> contractDetailsDTOs = null;
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());
		HttpEntity<String> httpEntity = new HttpEntity<>(payload, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers : " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Query Params : " + queryParams));

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(CONNECT_URL + "/data/" + APP_ID + "/a90bb5d7-59ce-441f-a478-0fdc233c6d17");

		if (queryParams != null) {
			for (Entry<String, String> entry : queryParams.entrySet()) {
				builder.queryParam(entry.getKey(), entry.getValue());

			}
		}
		String url = builder.toUriString();
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));

		ResponseEntity<List<ContractDetailsDTO>> responseEntity = null;

		try {

			responseEntity = restTemplate.exchange(url, HttpMethod.GET,
					httpEntity,
					new ParameterizedTypeReference<List<ContractDetailsDTO>>() {
					});

			contractDetailsDTOs = responseEntity.getBody();
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(
					"Error in getting contract V2 data from connect for "
							+ queryParams);
		}

		return contractDetailsDTOs;
	}

	public List<ContractItemDetailsDTO> getItemDetailsData(HttpServletRequest request,
														  Map<String, String> queryParams, String payload) {

		List<ContractItemDetailsDTO> ContractItemDetailsDTO = null;
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		headers.add(OBJECT_HEADER, XObjectActions.READ.name());
		HttpEntity<String> httpEntity = new HttpEntity<>(payload, headers);
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Headers : " + headers));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Query Params : " + queryParams));

		String contractV2DataUrl = CONNECT_URL + "/data/" + APP_ID + "/f7bad03a-8206-4294-80b0-47549f58d163";

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl(contractV2DataUrl);

		if (queryParams != null) {
			for (Entry<String, String> entry : queryParams.entrySet()) {
				builder.queryParam(entry.getKey(), entry.getValue());

			}
		}
		String url = builder.toUriString();
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL " + url));

		ResponseEntity<List<ContractItemDetailsDTO>> responseEntity = null;

		try {

			responseEntity = restTemplate.exchange(url, HttpMethod.GET,
					httpEntity,
					new ParameterizedTypeReference<List<ContractItemDetailsDTO>>() {
					});

			ContractItemDetailsDTO = responseEntity.getBody();
		} catch (HttpClientErrorException hcee) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error " + hcee.getResponseBodyAsString()), hcee);
			throw new ConnectException(hcee.getLocalizedMessage());
		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML("Error " + e.getMessage()), e);
			throw new ConnectException(
					"Error in getting itemDetails object data from connect for "
							+ queryParams);
		}

		return ContractItemDetailsDTO;
	}
}
