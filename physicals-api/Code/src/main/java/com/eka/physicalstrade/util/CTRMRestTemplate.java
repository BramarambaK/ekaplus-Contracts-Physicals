package com.eka.physicalstrade.util;

import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.eka.physicals.dto.CancelContract;
import com.eka.physicals.dto.ContractApprovalDTO;
import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractEntity;
import com.eka.physicals.dto.ContractItemsEntity;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.dataobject.APIResponse;
import com.eka.physicalstrade.exception.CTRMRestException;
import com.eka.physicalstrade.exception.CTRMRestTemplateException;

@Service
public class CTRMRestTemplate {

	private static final Logger logger = ESAPI
			.getLogger(CTRMRestTemplate.class);

	private static final String USER_CONTEXT_API = "/api/user/data";
	private static final String EXPOSURE_UPDATE_API = "/api/contract/exposure/";
	@Value("${ctrm.contract.api.basepath}")
	private String CTRM_CONTRACT_BASE_URI;

	@Value("${ctrm.contract.api.data}")
	private String CTRM_CONTRACT_BASE_DATA_URI;

	@Value("${ctrm.host.property.name}")
	private String CTRM_HOST_PROPERTY_NAME;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public RestTemplateUtil restTemplateUtil;

	@Autowired
	CommonValidator validator;

	public ResponseEntity<String> contractOperation(HttpServletRequest request,
			String type, ContractDetailsDTO contractDetailsDTO,
			HttpMethod operationType) throws CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("CTRM Contract Opertions.."));

		String url = validator.cleanData(getCTRMHost() + CTRM_CONTRACT_BASE_URI
				+ "/" + type);

		HttpHeaders headers = prepareHeaders(request);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Method : " + operationType));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL : " + url));
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers " + headers.toSingleValueMap()));
		// EPC-2660
		if (contractDetailsDTO.getSolutionType() == null) {
			contractDetailsDTO.setSolutionType("2");
		}
		HttpEntity<ContractDetailsDTO> httpEntity = new HttpEntity<>(
				contractDetailsDTO, headers);
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(url, operationType,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	public APIResponse contractOperationWithTRMResponse(
			HttpServletRequest request, String type,
			ContractDetailsDTO contractDetailsDTO, HttpMethod operationType)
			throws CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("CTRM Contract Opertions.."));

		String url = validator.cleanData(getCTRMHost() + CTRM_CONTRACT_BASE_URI
				+ "/" + type);

		HttpHeaders headers = prepareHeaders(request);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Method : " + operationType));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL : " + url));
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers " + headers.toSingleValueMap()));
		// EPC-2660
		if (contractDetailsDTO.getSolutionType() == null) {
			contractDetailsDTO.setSolutionType("2");
		}
		HttpEntity<ContractDetailsDTO> httpEntity = new HttpEntity<>(
				contractDetailsDTO, headers);
		ResponseEntity<APIResponse> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(url, operationType,
					httpEntity, APIResponse.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity.getBody();
	}

	public ResponseEntity<String> cancelContractOperation(
			HttpServletRequest request, String type,
			CancelContract cancelContract, HttpMethod operationType)
			throws CTRMRestException {

		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"CTRM Contract Cancel Operations.."));

		String url = validator.cleanData(getCTRMHost() + CTRM_CONTRACT_BASE_URI
				+ "/" + type);

		HttpHeaders headers = prepareHeaders(request);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Method : " + operationType));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL : " + url));
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers " + headers.toSingleValueMap()));

		HttpEntity<CancelContract> httpEntity = new HttpEntity<>(
				cancelContract, headers);
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(url, operationType,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	/**
	 * method which amends bulk contracts
	 * 
	 * @author Rushikesh Bhosale
	 * @param request
	 * @param resourceType
	 * @param requestBody
	 * @param http
	 *            method
	 * @return
	 * @throws CTRMRestException
	 */

	public ResponseEntity<String> bulkContractOperation(
			HttpServletRequest request, String type,
			List<ContractEntity> contractEntityList, HttpMethod operationType)
			throws CTRMRestException {

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder()
						.encodeForHTML("CTRM Bulk Contract Operations.."));

		String url = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "/" + type;
		HttpHeaders headers = prepareHeaders(request);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Method : " + operationType));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL : " + url));
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers " + headers.toSingleValueMap()));

		HttpEntity<List<ContractEntity>> httpEntity = new HttpEntity<>(
				contractEntityList, headers);
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(url, operationType,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	/**
	 * method which amends bulk contract items
	 * 
	 * @author Rushikesh Bhosale
	 * @param request
	 * @param resourceType
	 * @param requestBody
	 * @param http
	 *            method
	 * @return
	 * @throws CTRMRestException
	 */

	public ResponseEntity<String> bulkContractItemOperation(
			HttpServletRequest request, String type,
			List<ContractItemsEntity> contractItemEntityList,
			HttpMethod operationType) throws CTRMRestException {

		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"CTRM Bulk Contract Item Operations.."));

		String url = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "/" + type;
		HttpHeaders headers = prepareHeaders(request);

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Method : " + operationType));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL : " + url));
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers " + headers.toSingleValueMap()));

		HttpEntity<List<ContractItemsEntity>> httpEntity = new HttpEntity<>(
				contractItemEntityList, headers);
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(url, operationType,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	/**
	 * Generic method which accepts any contract data
	 * 
	 * @author Ranjan.Jha
	 * @param request
	 * @param resourceType
	 * @param requestBody
	 * @param http
	 *            method
	 * @return
	 * @throws CTRMRestException
	 */
	public ResponseEntity<String> contractOperationHandleAnyRequest(
			HttpServletRequest request, String resourceType,
			String requestBody, HttpMethod operationType)
			throws CTRMRestException {

		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"contractOperationHandleAnyRequest."));

		HttpHeaders headers = prepareHeaders(request);
		HttpEntity<String> httpEntity = new HttpEntity<>(requestBody, headers);
		ResponseEntity<String> responseEntity = null;
		String url = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "/"
				+ resourceType;

		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Method : " + operationType));
		logger.debug(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("URL : " + url));
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers " + headers.toSingleValueMap()));

		try {
			responseEntity = restTemplate.exchange(validator.cleanData(url),
					operationType, httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	public ResponseEntity<String> getContract(HttpServletRequest request,
			String type, String contractRefNo) throws CTRMRestException {

		HttpHeaders headers = prepareHeaders(request);

		String url = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "/" + type + "/"
				+ contractRefNo;
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		ResponseEntity<String> responseEntity = null;

		try {
			responseEntity = restTemplate.exchange(url, HttpMethod.GET,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in getting contract from trm"),
					httpClientErrorException);
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in getting contract from trm"),
					httpServerErrorException);
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			logger.error(
					Logger.EVENT_FAILURE,
					ESAPI.encoder().encodeForHTML(
							"Error in getting contract from trm"), e);
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	public ResponseEntity<String> getContractAll(HttpServletRequest request,
			String type) {

		HttpHeaders headers = prepareHeaders(request);

		String url = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "/" + type;
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		ResponseEntity<String> responseEntity = restTemplate.exchange(url,
				HttpMethod.GET, httpEntity, String.class);

		return responseEntity;
	}

	/**
	 * Delete contract data
	 * 
	 * @param request
	 * @param id
	 * @return
	 */
	public ResponseEntity<String> deleteContract(HttpServletRequest request,
			String type, String id) {

		HttpHeaders headers = prepareHeaders(request);

		String url = validator.cleanData(CTRM_CONTRACT_BASE_URI + "/" + type
				+ "/" + id);
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		ResponseEntity<String> responseEntity = restTemplate.exchange(url,
				HttpMethod.DELETE, httpEntity, String.class);

		return responseEntity;

	}

	/**
	 * Get contract approval details for viewType or based on viewType and
	 * internalContractRefNo
	 * 
	 * @param request
	 * @param viewType
	 * @param internalContractRefNo
	 * @return
	 */
	public ResponseEntity<ContractApprovalDTO> getContractApprovalDetails(
			HttpServletRequest request, String viewType,
			String internalContractRefNo) {

		HttpHeaders headers = prepareHeaders(request);

		String urlPath = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "/approval/"
				+ viewType;

		if (!StringUtils.isEmpty(internalContractRefNo)) {
			urlPath += "/" + internalContractRefNo;
		}

		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		ResponseEntity<ContractApprovalDTO> responseEntity = restTemplate
				.exchange(validator.cleanData(urlPath), HttpMethod.GET,
						httpEntity, ContractApprovalDTO.class);

		return responseEntity;

	}

	/**
	 * Approve or Reject contract
	 * 
	 * @param request
	 * @param viewType
	 * @param internalContractRefNo
	 * @return
	 */
	public ResponseEntity<String> approveRejectContract(
			HttpServletRequest request, String internalContractRefNo,
			ContractApprovalDTO contractApprovalDTO) {

		HttpHeaders headers = prepareHeaders(request);

		String urlPath = getCTRMHost() + CTRM_CONTRACT_BASE_URI
				+ "/approval/manage";

		if (!StringUtils.isEmpty(internalContractRefNo)) {
			urlPath += "/" + internalContractRefNo;
		}

		HttpEntity<ContractApprovalDTO> httpEntity = new HttpEntity<>(
				contractApprovalDTO, headers);
		ResponseEntity<String> responseEntity = restTemplate.exchange(
				validator.cleanData(urlPath), HttpMethod.POST, httpEntity,
				String.class);

		return responseEntity;

	}

	/**
	 * Generic method which returns cp address
	 * 
	 * @author Ranjan.Jha
	 * @param request
	 * @param resourceType
	 * @param requestBody
	 * @param http
	 *            method
	 * @return
	 * @throws CTRMRestException
	 */
	public ResponseEntity<String> fetchCPAddress(HttpServletRequest request,
			String resourceType, String requestBody, HttpMethod operationType)
			throws CTRMRestException {

		HttpHeaders headers = prepareHeaders(request);

		HttpEntity<String> httpEntity = new HttpEntity<>(requestBody, headers);

		ResponseEntity<String> responseEntity = null;

		try {
			String url = validator.cleanData(getCTRMHost()
					+ CTRM_CONTRACT_BASE_DATA_URI + "/" + resourceType);
			responseEntity = restTemplate.exchange(url, operationType,
					httpEntity, String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(
					httpClientErrorException.getResponseBodyAsString(),
					httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(
					httpServerErrorException.getResponseBodyAsString(),
					httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;
	}

	public ResponseEntity<String> getUserContextDetails(
			HttpServletRequest request) {

		HttpHeaders headers = prepareHeaders(request);

		String url = validator.cleanData(getCTRMHost() + USER_CONTEXT_API);
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		ResponseEntity<String> responseEntity = restTemplate.exchange(url,
				HttpMethod.GET, httpEntity, String.class);

		return responseEntity;
	}

	public void updateContractExposure(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {

		HttpHeaders headers = restTemplateUtil.getHttpHeader(requestContext
				.getHeaders());

		String url = validator.cleanData(getCTRMHost() + EXPOSURE_UPDATE_API)
				+ getContractItemRefNos(contractDetailsDTO);
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
		restTemplate.exchange(url, HttpMethod.POST, httpEntity, String.class);

	}
	
	/**
	 * Validate approval level for intercompany transactions
	 * 
	 * @param request
	 * @return
	 * @throws CTRMRestException
	 */
	public ResponseEntity<String> validateIntercompanyUser(HttpServletRequest request) throws CTRMRestException {

		HttpHeaders headers = prepareHeaders(request);
		String urlPath = getCTRMHost() + CTRM_CONTRACT_BASE_URI + "intercompany/approval/validate";
		HttpEntity<String> httpEntity = new HttpEntity<>("", headers);

		ResponseEntity<String> responseEntity = null;

		try {
			responseEntity = restTemplate.exchange(validator.cleanData(urlPath), HttpMethod.GET, httpEntity,
					String.class);
		} catch (HttpClientErrorException httpClientErrorException) {
			throw new CTRMRestException(httpClientErrorException.getResponseBodyAsString(), httpClientErrorException);

		} catch (HttpServerErrorException httpServerErrorException) {
			throw new CTRMRestException(httpServerErrorException.getResponseBodyAsString(), httpServerErrorException);
		} catch (Exception e) {
			throw new CTRMRestTemplateException(e.getLocalizedMessage());
		}

		return responseEntity;

	}

	private HttpHeaders prepareHeaders(HttpServletRequest request) {
		HttpHeaders headers = restTemplateUtil.httpHeadersReplicate(request);
		return headers;
	}

	private String getCTRMHost() {

		RequestContext requestContext = RequestContextHolder
				.getCurrentContext();
		String ctrmHost = null;
		if (requestContext != null) {
			ctrmHost = (String) requestContext.getAppProperties().get(
					CTRM_HOST_PROPERTY_NAME);
		}

		if (ctrmHost == null) {
			logger.debug(
					Logger.EVENT_SUCCESS,
					ESAPI.encoder()
							.encodeForHTML(
									"CTRM host is null. Error in getting the property data"));
		}
		return ctrmHost;
	}

	private String getContractItemRefNos(ContractDetailsDTO contractDetailsDTO) {
		String contractItemRefNos = null;
		if (contractDetailsDTO != null) {
			contractItemRefNos = contractDetailsDTO.getItemDetails().stream()
					.map(itemDetail -> itemDetail.getInternalItemRefNo())
					.collect(Collectors.joining(","));
		}

		return contractItemRefNos;
	}
}
