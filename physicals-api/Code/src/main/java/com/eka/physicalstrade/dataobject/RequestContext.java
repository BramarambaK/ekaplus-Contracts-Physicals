package com.eka.physicalstrade.dataobject;

import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
public class RequestContext {

	private String requestId;
	private TokenData tokenData;
	private Map<String, Object> appProperties;
	private Map<String, String> headers;
	private HttpServletRequest request;

	public TokenData getTokenData() {
		return tokenData;
	}

	public void setTokenData(TokenData tokenData) {
		this.tokenData = tokenData;
	}

	public Map<String, Object> getAppProperties() {
		return appProperties;
	}

	public void setAppProperties(Map<String, Object> appProperties) {
		this.appProperties = appProperties;
	}

	public Map<String, String> getHeaders() {
		return headers;
	}

	public void setHeaders(Map<String, String> headers) {
		this.headers = headers;
	}

	public String getRequestId() {
		return requestId;
	}

	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}

	@Override
	public String toString() {
		StringJoiner sj = new StringJoiner(",");
		return sj.add(this.requestId).add(String.valueOf(tokenData.getId()))
				.add(headers.getOrDefault("X-TenantID", "emptyTenant"))
				.toString();
	}

	public HttpServletRequest getRequest() {
		return request;
	}

	public void setRequest(HttpServletRequest request) {
		this.request = request;
	}
}
