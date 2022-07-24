package com.eka.physicals.util;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.TimeZone;

import com.eka.physicals.constants.GlobalConstants;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class DateDeserializer extends JsonDeserializer<Date> {

	@Override
	public Date deserialize(JsonParser p, DeserializationContext ctxt)
			throws IOException, JsonProcessingException {

		String dateStr = p.getText();

		if (null != dateStr && !dateStr.isEmpty()) {

			DateTimeFormatter dft = DateTimeFormatter
					.ofPattern(GlobalConstants.DATE_FORMAT_ISO_DATE_FORMAT);
			LocalDate ld = LocalDate.parse(dateStr, dft);

			TimeZone defaultTimezone = TimeZone.getDefault();
			TimeZone.setDefault(TimeZone
					.getTimeZone(GlobalConstants.TIME_ZONE_UTC));
			Date date = Date.from(ld.atStartOfDay(ZoneOffset.of("+0"))
					.toInstant());
			// Resetting the default timezone
			TimeZone.setDefault(defaultTimezone);
			return date;
		}

		return null;
	}
}