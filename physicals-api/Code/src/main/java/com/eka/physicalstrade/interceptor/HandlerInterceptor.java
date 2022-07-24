package com.eka.physicalstrade.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.MappedInterceptor;

@Component
public class HandlerInterceptor {

	@Bean
	@Autowired
	public MappedInterceptor getMappedInterceptor(
			RequestValidatorInterceptor requestValidatorInterceptor) {
		return new MappedInterceptor(new String[] { "/contract/**",
				"/generate/**", "/user/**" },
				new String[] { "/properties/**" ,"/logger/**","/common/getManifestInfo"}, requestValidatorInterceptor);
	}
}
