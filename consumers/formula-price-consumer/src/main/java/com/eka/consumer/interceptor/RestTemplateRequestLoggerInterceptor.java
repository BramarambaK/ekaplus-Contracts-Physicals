package com.eka.consumer.interceptor;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import com.eka.consumer.constants.GlobalConstants;

public class RestTemplateRequestLoggerInterceptor implements
		ClientHttpRequestInterceptor {

	private static final Logger logger = ESAPI
			.getLogger(RestTemplateRequestLoggerInterceptor.class);

	@Override
	public ClientHttpResponse intercept(HttpRequest request, byte[] body,
			ClientHttpRequestExecution execution) throws IOException {
		ClientHttpResponse clientHttpResponse = null;

		String uri = request.getURI().getRawPath();
		HttpHeaders httpHeaders = request.getHeaders();
		httpHeaders.set("X-RequestId", MDC.get(GlobalConstants.X_REQUEST_ID));
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Client http request starts : " + uri));
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Headers : " + uri + " : " + request.getHeaders()));
		logger.info(Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("Body : " + uri + " : " + body));
		Instant start = Instant.now();
		clientHttpResponse = execution.execute(request, body);
		Instant end = Instant.now();

		logger.info(
				Logger.EVENT_SUCCESS,
				//ESAPI.encoder().encodeForHTML(
						"Response : " + clientHttpResponse);
		
		logger.info(
				Logger.EVENT_SUCCESS,
				//ESAPI.encoder().encodeForHTML(
						"Response : " + clientHttpResponse.getHeaders().toString());

		long elapsedTime = Duration.between(start, end).toMillis();
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Client http request time elapsed : " + uri + " : "
								+ elapsedTime));
		logger.info(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Client http request ends : " + uri));

		return clientHttpResponse;
	}

}
