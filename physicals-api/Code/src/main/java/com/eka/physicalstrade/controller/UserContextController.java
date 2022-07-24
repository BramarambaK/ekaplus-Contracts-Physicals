package com.eka.physicalstrade.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.eka.physicalstrade.util.CommonValidator;

@RestController
public class UserContextController {

	@Autowired
	private CTRMRestTemplate ctrmRestTemplate;
	@Autowired
	CommonValidator validator;

	/**
	 * API to get the TRM user context based on token
	 * 
	 * @param httpServletRequest
	 * @return
	 */
	@GetMapping(value = "/user/data")
	public Object getUserInfo(
			HttpServletRequest httpServletRequest) {

		ResponseEntity<String> response = ctrmRestTemplate
				.getUserContextDetails(httpServletRequest);

		return response;
	}
}
