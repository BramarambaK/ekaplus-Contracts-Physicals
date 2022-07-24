package com.eka.physicalstrade.service;

import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.apache.kafka.common.serialization.StringSerializer;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicalstrade.constants.GlobalConstants;
import com.eka.physicalstrade.dataobject.RequestContext;

@Service("formulaPriceItemProducer")
public class FormulaPriceItemProducer implements DataPublisher {

	private static Logger logger = ESAPI
			.getLogger(FormulaPriceItemProducer.class);

	@Value(value = "${kafka.bootstrapAddress}")
	private String bootstrapServer;

	@Value("${formula.price.details.topic}")
	private String topic;

	public void publish(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO) {

		logger.info(Logger.EVENT_SUCCESS, "Processing Formula Pricing for "
				+ contractDetailsDTO.get_id());

		// Create kafka producer setting properties
		Properties producerConfig = getProducerConfig(bootstrapServer);
		KafkaProducer<String, String> producer = new KafkaProducer<String, String>(
				producerConfig);

		try {
			// Create producer record

			List<ContractItemDetailsDTO> itemDetails = contractDetailsDTO
					.getItemDetails();
			Headers headers = prepareKafkaHeaders(requestContext);
			final String internalContractRefNo = contractDetailsDTO
					.getInternalContractRefNo();
			itemDetails
					.stream()
					.filter(item -> null != item.getFormulaPriceDetails())
					.forEach(
							(item) -> {
								String key = contractDetailsDTO.get_id() + "::"
										+ item.getItemNo();
								String message = populateInternalRefNos(
										item.getFormulaPriceDetails(),
										internalContractRefNo,
										item.getInternalItemRefNo());
								ProducerRecord<String, String> producerRecord = new ProducerRecord<String, String>(
										topic, null, null, key, message,
										headers);
								// send the producer record to kafka topic
								producer.send(producerRecord);
								logger.info(Logger.EVENT_SUCCESS,
										"Message send : key " + key);
							});

			logger.info(Logger.EVENT_SUCCESS,
					"Formula Pricing Message sent successfully "
							+ contractDetailsDTO.get_id());

		} catch (Exception e) {
			logger.error(Logger.EVENT_FAILURE,
					"Error while sending formula price details to kafka ", e);
		} finally {
			producer.flush();
			producer.close();
		}

	}

	private Properties getProducerConfig(String bootstrapServer) {

		Properties producerConfig = new Properties();
		producerConfig.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
				bootstrapServer);
		producerConfig.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
				StringSerializer.class.getName());
		producerConfig.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
				StringSerializer.class.getName());

		return producerConfig;
	}

	private Headers prepareKafkaHeaders(RequestContext requestContext) {
		Headers headers = new RecordHeaders();
		Map<String, String> httpHeaders = requestContext.getHeaders();

		headers.add(new RecordHeader(GlobalConstants.AUTHORIZATION
				.toLowerCase(), httpHeaders.get(
				GlobalConstants.AUTHORIZATION.toLowerCase()).getBytes()));
		headers.add(new RecordHeader(GlobalConstants.TENANT_ID.toLowerCase(),
				httpHeaders.get(GlobalConstants.TENANT_ID.toLowerCase())
						.getBytes()));
		if (httpHeaders.containsKey(GlobalConstants.X_REQUEST_ID.toLowerCase())) {
			headers.add(new RecordHeader(GlobalConstants.X_REQUEST_ID
					.toLowerCase(), httpHeaders.get(
					GlobalConstants.X_REQUEST_ID.toLowerCase()).getBytes()));

		}

		return headers;
	}

	private String populateInternalRefNos(String formulaPriceDetails,
			String internalContractRefNo, String internalContractItemRefNo) {

		String formulaPriceDetailsWithRefNo = formulaPriceDetails;

		try {
			JSONObject formulaPriceJson = new JSONObject(formulaPriceDetails);

			JSONObject contractJson = formulaPriceJson
					.getJSONObject("contract");

			contractJson.put("refNo", internalContractRefNo);

			JSONArray itemDetailsArray = contractJson
					.getJSONArray("itemDetails");

			JSONObject itemDetailsJson = null;
			for (int i = 0; i < itemDetailsArray.length(); i++) {
				itemDetailsJson = itemDetailsArray.getJSONObject(i);
				itemDetailsJson.put("refNo", internalContractItemRefNo);
			}

			formulaPriceDetailsWithRefNo = formulaPriceJson.toString();

		} catch (JSONException e) {
			logger.error(Logger.EVENT_FAILURE,
					"Error in parsing formula price details "
							+ formulaPriceDetails);
		}

		return formulaPriceDetailsWithRefNo;
	}
}
