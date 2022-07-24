package com.eka.consumer.dataobject;

public class FormulaPriceData {

	private String accessToken;
	private String tenantId;
	private String requestId;
	private String formulaPriceDetails;

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public String getTenantId() {
		return tenantId;
	}

	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}

	public String getFormulaPriceDetails() {
		return formulaPriceDetails;
	}

	public void setFormulaPriceDetails(String formulaPriceDetails) {
		this.formulaPriceDetails = formulaPriceDetails;
	}

	public String getRequestId() {
		return requestId;
	}

	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}

}
