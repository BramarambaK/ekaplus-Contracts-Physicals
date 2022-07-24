package com.eka.physicalstrade;

import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.http.HttpProperties;
import com.eka.physicalstrade.interceptor.RestTemplateRequestLoggerInterceptor;

@SpringBootApplication
@ComponentScan(basePackages = "com.eka.physicalstrade")
@EnableAspectJAutoProxy
@EnableAsync
public class PhysicalsTradeApplication {

	@Autowired
	private HttpProperties httpProperties;

	public static void main(String[] args) {
		SpringApplication.run(PhysicalsTradeApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate(RestTemplateBuilder builder) {

		// Do any additional configuration here
		RestTemplate restTemplate = builder
		// .setConnectTimeout(Duration.ofMinutes(5))
				.interceptors(new RestTemplateRequestLoggerInterceptor())
				// .setReadTimeout(Duration.ofMinutes(5))
				.build();
		
		restTemplate.setRequestFactory(new BufferingClientHttpRequestFactory(
				getClientHttpRequestFactory(
						httpProperties.getHttpConnectionTimeOut(),
						httpProperties.getHttpReadTimeOut())));
		
		List<ClientHttpRequestInterceptor> clientHttpRequestInterceptors = restTemplate
				.getInterceptors();

		if (CollectionUtils.isEmpty(clientHttpRequestInterceptors)) {
			clientHttpRequestInterceptors = new ArrayList<>();
		}

		clientHttpRequestInterceptors
				.add(new RestTemplateRequestLoggerInterceptor());

		return restTemplate;
	}

	@PostConstruct
	void setTimeZone() {
		TimeZone.setDefault(TimeZone.getTimeZone("GMT"));
	}

	@Bean
	public FilterRegistrationBean<CorsFilter> corsFilter() {
		List<String> exposedHeaderList = new ArrayList<String>();
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		exposedHeaderList.add(GlobalConstants.AUTHORIZATION);
		exposedHeaderList.add(GlobalConstants.ACCEPT);
		exposedHeaderList.add(GlobalConstants.CACHE_CONTROL);
		config.setAllowCredentials(true);
		config.addAllowedOrigin(GlobalConstants.STAR);
		config.addAllowedHeader(GlobalConstants.STAR);
		config.addAllowedMethod(GlobalConstants.PUT);
		config.addAllowedMethod(GlobalConstants.GET);
		config.addAllowedMethod(GlobalConstants.POST);
		config.addAllowedMethod(GlobalConstants.OPTIONS);
		config.addAllowedMethod(GlobalConstants.DELETE);
		config.setExposedHeaders(exposedHeaderList);
		source.registerCorsConfiguration(GlobalConstants.SLASH_STAR, config);
		FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<CorsFilter>(
				new CorsFilter(source));
		bean.setOrder(0);
		return bean;
	}

	// https://stackoverflow.com/questions/45713767/spring-rest-template-readtimeout
	public static ClientHttpRequestFactory getClientHttpRequestFactory(
			int httpConnectionTimeOut, int httpReadTimeOut) {
		SimpleClientHttpRequestFactory clientHttpRequestFactory = new SimpleClientHttpRequestFactory();
		// Connect timeout
		clientHttpRequestFactory.setConnectTimeout(httpConnectionTimeOut);

		// Read timeout
		clientHttpRequestFactory.setReadTimeout(httpReadTimeOut);
		return clientHttpRequestFactory;
	}

}
