package com.eka.consumer.formulaprice;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import com.eka.consumer.http.HttpProperties;
import com.eka.consumer.interceptor.RestTemplateRequestLoggerInterceptor;

@SpringBootApplication
@ComponentScan(basePackages = "com.eka.consumer")
public class FormulaPriceConsumerApplication {

	@Autowired
	private HttpProperties httpProperties;

	public static void main(String[] args) {
		SpringApplication.run(FormulaPriceConsumerApplication.class, args);
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
