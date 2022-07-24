package com.eka.physicalstrade.model;

import org.springframework.stereotype.Component;

@Component
public class PhysicalsTradeProperties {
	private String platform_url;
	private String eka_mdm_host;
	
	private String eka_validateToken_url;
	private String eka_UserAuthentication_url;
	public String getPlatform_url() {
		return platform_url;
	}
	public void setPlatform_url(String platform_url) {
		this.platform_url = platform_url;
	}
	public String getEka_mdm_host() {
		return eka_mdm_host;
	}
	public void setEka_mdm_host(String eka_mdm_host) {
		this.eka_mdm_host = eka_mdm_host;
	}
	public String getEka_validateToken_url() {
		return eka_validateToken_url;
	}
	public void setEka_validateToken_url(String eka_validateToken_url) {
		this.eka_validateToken_url = eka_validateToken_url;
	}
	public String getEka_UserAuthentication_url() {
		return eka_UserAuthentication_url;
	}
	public void setEka_UserAuthentication_url(String eka_UserAuthentication_url) {
		this.eka_UserAuthentication_url = eka_UserAuthentication_url;
	}
	
	
	
	
}
