package com.eka.physicalstrade.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.AbstractEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//@RestController
public class PropertiesController {
	//@Autowired
	private Environment env;

	@GetMapping(value = "/properties")
	public List<String> listEnvironmentProps() {

		List<String> properties = new ArrayList<>();

		Map<String, Object> map = new HashMap();
		for (Iterator it = ((AbstractEnvironment) env).getPropertySources()
				.iterator(); it.hasNext();) {
			PropertySource propertySource = (PropertySource) it.next();
			if (propertySource instanceof MapPropertySource) {
				map.putAll(((MapPropertySource) propertySource).getSource());
			}
		}
		// loop a Map
		for (Map.Entry<String, Object> entry : map.entrySet()) {
			properties.add(entry.getKey() + " : " + entry.getValue());
		}

		return properties;
	}

}
