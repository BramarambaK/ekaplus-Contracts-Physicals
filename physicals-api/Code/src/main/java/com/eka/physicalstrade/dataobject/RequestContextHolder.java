package com.eka.physicalstrade.dataobject;

import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;

public class RequestContextHolder {

	private static Logger logger = ESAPI.getLogger(RequestContextHolder.class
			.getName());

	private static ThreadLocal<RequestContext> currentContext = new ThreadLocal<>();

	public static void setCurrentContext(RequestContext contextInfo) {
		logger.debug(
				Logger.EVENT_SUCCESS,
				ESAPI.encoder().encodeForHTML(
						"Setting currentContext to " + currentContext));
		currentContext.set(contextInfo);
	}

	public static RequestContext getCurrentContext() {
		return currentContext.get();
	}

	public static void remove() {
		currentContext.remove();
	}

}
