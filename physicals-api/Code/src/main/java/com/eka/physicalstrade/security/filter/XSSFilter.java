package com.eka.physicalstrade.security.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpStatus;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.stereotype.Component;

import com.eka.physicalstrade.exception.BadRequestException;

/**
 * 
 * @author Vijayalakshmi.Nair
 *
 *         This class is responsible for filtering out all possible xss attacks
 *
 */
@Component
public class XSSFilter implements Filter {

	public static final String _400_MESSAGE = "Bad Request , Invalid input ";
	public static final String CONTENT_TYPE = "Content-Type";
	final static Logger logger = ESAPI.getLogger(XSSFilter.class);

	@Override
	public void destroy() {
		// TODO Auto-generated method stub

	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		// once authentication is success add security headers
		this.addStdSecureResponseHeaders(httpResponse, httpRequest);
		// add cache control directives
		XSSRequestWrapper requestWrapper = new XSSRequestWrapper(httpRequest);
		// avoiding XSS check for file uploads
		if (request.getContentType() != null
				&& request.getContentType().toLowerCase()
						.indexOf("multipart/form-data") == -1) {
			String body = requestWrapper.getPostBodyAsString();
			if (requestWrapper.containsXSS(body)) {
				String msg = "{\"msg\":\"Bad request. Please check the input\"}";
				byte[] responseToSend = msg.getBytes();
				((HttpServletResponse) response).setHeader(CONTENT_TYPE,
						"application/json");
				httpResponse.setStatus(HttpStatus.SC_BAD_REQUEST);
				httpResponse.getOutputStream().write(responseToSend);
				throw new BadRequestException();
			}
		}
		/*
		 * chain.doFilter(new XSSRequestWrapper((HttpServletRequest) request),
		 * response);
		 */
		chain.doFilter(requestWrapper, response);

	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
		logger.debug(logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML("XSS Filter initialized"));
	}

	/**
	 * This method adds properties to response header to prevent click
	 * jacking,to disable reflective xss & other standard filters
	 * 
	 * @author sachin
	 * @param httpResponse
	 */
	private void addStdSecureResponseHeaders(HttpServletResponse httpResponse,
			HttpServletRequest httpRequest) {

		// It will prevent the site to be renedered as iframe in other sites
		// set as SAMEORIGIN if needs to be rendered inside iframe with same
		// origin
		httpResponse.addHeader("X-FRAME-OPTIONS", "SAMEORIGIN");

		// this prevents page from rendering if xss is detected
		httpResponse.addHeader("X-XSS-Protection", "1; mode=block");

		// Anti-MIME-Sniffing header
		httpResponse.addHeader("X-Content-Type-Options", "nosniff");

		if (httpRequest.isSecure())
			httpResponse.addHeader("Strict-Transport-Security",
					"max-age=31622400; includeSubDomains");

		// to ensure resources are loaded from trusted server or own server
		// replace once we have cdn url available
		// "default-src 'self' cdn.ekaanalytics.com"
		// String cspPolicy =
		// "default-src 'self' api.motion.ai; connect-src ws: 'self'; img-src * data: https: 'self' 'unsafe-inline'; style-src data: https: 'self' 'unsafe-inline'; script-src http: data: https: 'self' 'unsafe-inline' 'unsafe-eval' www.google-analytics.com; font-src data: http: https: 'self' 'unsafe-inline';";
		String cspPolicy = "default-src 'self' js.driftt.com *.intercom.io translate.googleapis.com whatfix.com;  connect-src ws: 'self' *.intercom.io  translate.googleapis.com; img-src * data: https: 'self' 'unsafe-inline'; style-src data: https: 'self' 'unsafe-inline'; script-src http: data: https: 'self' 'unsafe-inline' 'unsafe-eval' www.google-analytics.com js.driftt.com; font-src data: http: https: 'self' 'unsafe-inline';";
		httpResponse.addHeader("Content-Security-Policy", cspPolicy);

		// used by old browsers
		httpResponse.addHeader("X-Content-Security-Policy", cspPolicy);
		httpResponse.addHeader("X-WebKit-CSP", cspPolicy);

	}

}
