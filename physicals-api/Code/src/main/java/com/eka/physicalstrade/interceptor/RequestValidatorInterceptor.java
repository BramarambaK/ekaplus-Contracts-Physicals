package com.eka.physicalstrade.interceptor;

import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.AsyncHandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.dataobject.RequestContext;
import com.eka.physicalstrade.dataobject.RequestContextHolder;
import com.eka.physicalstrade.dataobject.TokenData;
import com.eka.physicalstrade.exception.InvalidTokenException;
import com.eka.physicalstrade.exception.PropertyRetrivalException;
import com.eka.physicalstrade.util.ConnectRestTemplate;
import com.eka.physicalstrade.util.PropertyConnectRestTemplate;
import com.eka.physicalstrade.util.RestTemplateUtil;

@Component
public class RequestValidatorInterceptor implements AsyncHandlerInterceptor {

	private static final Logger logger = ESAPI
			.getLogger(RequestValidatorInterceptor.class);

	@Autowired
	private PropertyConnectRestTemplate propertyConnectRestTemplate;
	@Autowired
	private ConnectRestTemplate connectRestTemplate;
	@Autowired
	private RestTemplateUtil restTemplateUtil;

	public static final String X_TENANT_ID = "X-TenantID";
	public static final String REGEX_DOT = "\\.";
	public static final String SOURCE_DEVICE_ID = "sourceDeviceId";
	
	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		//addRequestId();
		setTenantNameAndRequestIdToLog(request);

		RequestContext requestContext = new RequestContext();
		RequestContextHolder.setCurrentContext(requestContext);
		requestContext.setRequest(request);
		requestContext.setRequestId(MDC.get("requestId"));
		
		RequestResponseLogger.logRequest(request);

		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"ContractPhysicals PreHandle started for " + request.getRequestURI()));
		
		TokenData tokenData = getValidateToken(request);
		Map<String, Object> appProperties = getAppProperties(request);
		Map<String, String> requestHeadersMap = addRequestHeaders(request);
		requestContext.setTokenData(tokenData);
		requestContext.setAppProperties(appProperties);
		requestContext.setHeaders(requestHeadersMap);
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"ContractPhysicals PreHandle completed for " + request.getRequestURI()));

		return true;
	}

	@Override
	public void afterConcurrentHandlingStarted(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		removeRequestContext();
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Request completed " + request.getRequestURI()));

	};

	@Override
	public void postHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler,
			@Nullable ModelAndView modelAndView) throws Exception {
		
		RequestResponseLogger.logResponseHeaderDetails(response);
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Request completed " + request.getRequestURI()));
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		
		String requestURI = request.getRequestURI();
		String requestMethod = request.getMethod();
		
		response.addHeader("requestId",RequestContextHolder.getCurrentContext().getRequestId());
		if(ex!=null){
			RequestResponseLogger.logResponseHeaderDetails(response);
		}
		
		removeRequestContext();
		removeRequestId();
		
		logger.info(Logger.EVENT_SUCCESS, "********* ContractPhysicals User Request completed......"+"Request Details: " + requestMethod + " " + requestURI);
	}
	
	public TokenData getValidateToken(HttpServletRequest request)
			throws InvalidTokenException, PropertyRetrivalException {
		TokenData tokenData = connectRestTemplate.getUserInfo(request);
		return tokenData;
	}

	private Map<String, Object> getAppProperties(HttpServletRequest request) {

		Map<String, Object> properties = propertyConnectRestTemplate
				.getAppProperties(request);

		return properties;
	}

	private void addRequestId() {
		MDC.put(GlobalConstants.X_REQUEST_ID, UUID.randomUUID().toString());
	}
	
	private void setTenantNameAndRequestIdToLog(HttpServletRequest request) {
		String requestId = null;
		String tenantName = null;
		String sourceDeviceId = null;
		if (null != request.getHeader("requestId")) {
			requestId = request.getHeader("requestId");
		} else {
			requestId = UUID.randomUUID().toString().replace("-", "")+"-GEN";

		}
		if (null != request.getHeader("sourceDeviceId")) {
			sourceDeviceId = request.getHeader("sourceDeviceId");
		} else {
			sourceDeviceId = "na";

		}

		if (null == request.getHeader(X_TENANT_ID)) {
			tenantName = request.getServerName();
			tenantName = tenantName.split(REGEX_DOT)[0];
		} 
		else{
		tenantName = request.getHeader(X_TENANT_ID);
		}

		MDC.put("requestId", requestId);
		MDC.put("tenantName", tenantName);
		MDC.put("sourceDeviceId", sourceDeviceId);
	}


	private void removeRequestId() {
		MDC.remove("requestId");
		MDC.remove("tenantName");
		MDC.remove("sourceDeviceId");
	}

	private Map<String, String> addRequestHeaders(HttpServletRequest request) {
		return restTemplateUtil.getHeadersAsMap(request);
	}

	private void removeRequestContext() {
		RequestContextHolder.remove();
		removeRequestId();
	}
}
