package com.eka.consumer.formulaprice;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.Payload;

import com.eka.consumer.constants.GlobalConstants;
import com.eka.consumer.dataobject.FormulaPriceData;
import com.eka.consumer.exception.HeadersMissingException;
import com.eka.consumer.service.CollectionDataService;
import com.eka.consumer.service.ConnectDataService;

@EnableKafka
@Configuration
public class FormulaPriceConsumerListener {

	private static final Logger logger = ESAPI
			.getLogger(FormulaPriceConsumerListener.class);

	@Value(value = "${kafka.bootstrapAddress}")
	private String bootstrapAddress;

	@Value(value = "${kafka.consumergroup.groupid}")
	private String groupId;
	@Autowired
	private CollectionDataService collectionDataService;
	@Autowired
	private ConnectDataService connectDataService;

	@Bean
	public ConsumerFactory<String, String> consumerFactory() {
		Map<String, Object> props = new HashMap<>();
		props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
		props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
		props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
				StringDeserializer.class);
		props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
				StringDeserializer.class);
		return new DefaultKafkaConsumerFactory<>(props);
	}

	@Bean
	public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {

		ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
		factory.setConsumerFactory(consumerFactory());
		return factory;
	}

	@KafkaListener(topics = "#{'${formula_price_details_topic}'}", groupId = "#{'${kafka.consumergroup.groupid}'}")
	public void listen(@Payload String message, @Headers MessageHeaders headers) {

		logger.info(Logger.EVENT_SUCCESS,
				"Formula price message processing started");

		FormulaPriceData formulaPriceData = new FormulaPriceData();
		verifyAndPopulateHeader(headers, formulaPriceData);
		formulaPriceData.setFormulaPriceDetails(message);

		if (formulaPriceData.getRequestId() != null) {
			logger.info(Logger.EVENT_SUCCESS,
					"Collection Data update started for REQUEST-ID "
							+ formulaPriceData.getRequestId());
		}

		collectionDataService
				.updateItemGmrFormulaPriceCollection(formulaPriceData);
		connectDataService
				.updateConnectItemGmrFormulaPriceCollection(formulaPriceData);

		logger.info(Logger.EVENT_SUCCESS,
				"Formula price message processing computed");
	}

	private void verifyAndPopulateHeader(MessageHeaders headers,
			FormulaPriceData formulaPriceData) {
		String accessToken = null;
		String tenantId = null;
		String requestId = null;
		if (headers.containsKey(GlobalConstants.AUTHORIZATION.toLowerCase())) {

			accessToken = new String(
					(byte[]) headers.get(GlobalConstants.AUTHORIZATION
							.toLowerCase()));
			/*
			 * accessToken = headers.get(
			 * GlobalConstants.AUTHORIZATION.toLowerCase(), String.class);
			 */
		}
		if (headers.containsKey(GlobalConstants.TENANTID.toLowerCase())) {
			tenantId = new String((byte[]) headers.get(GlobalConstants.TENANTID
					.toLowerCase()));
		}

		if (headers.containsKey(GlobalConstants.X_REQUEST_ID.toLowerCase())) {
			requestId = new String(
					(byte[]) headers.get(GlobalConstants.X_REQUEST_ID
							.toLowerCase()));
			// Remove once processed
			MDC.put(GlobalConstants.X_REQUEST_ID, requestId);
		}

		if (accessToken == null || tenantId == null) {
			throw new HeadersMissingException(
					accessToken == null ? GlobalConstants.AUTHORIZATION
							.toLowerCase() : GlobalConstants.TENANTID
							.toLowerCase());
		}

		formulaPriceData.setAccessToken(accessToken);
		formulaPriceData.setTenantId(tenantId);
		formulaPriceData.setRequestId(requestId);

	}
}
