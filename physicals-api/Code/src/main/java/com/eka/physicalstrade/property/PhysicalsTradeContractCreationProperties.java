package com.eka.physicalstrade.property;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.eka.physicalstrade.commons.PropertyConsumer;

@Component
public class PhysicalsTradeContractCreationProperties {

	private String trmEndPoint = "/contract";
	
	@Value("${connect.application}")
	private String PhysicalsTradeUDID;
	
	@Autowired
	public PropertyConsumer propertyConsumer;
	
	private static final String TRM_HOST_KEY = "eka_trm_physicals_api_host";
	
	public String getTRMUrl(HttpServletRequest request) {

		String uploadHost = propertyConsumer.getPropertyFromConnect(TRM_HOST_KEY, PhysicalsTradeUDID,request);

		return uploadHost + trmEndPoint;
	}
	
	
	
}
