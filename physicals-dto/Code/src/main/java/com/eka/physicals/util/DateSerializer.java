package com.eka.physicals.util;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import com.eka.physicals.constants.GlobalConstants;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

public class DateSerializer extends JsonSerializer<Date> {

	@Override
	public void serialize(Date value, JsonGenerator gen,
			SerializerProvider provider) throws IOException {
		if (null != value) {
			// EPC:1551 fix - Creating UTC string of date with time and timezone
			// values as zero
			// Avoided using timezone part in formatting as it introduces time
			// part based on server timezone
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String dateStr = sdf.format(value);
			gen.writeString(dateStr + "T00:00:00.000+0000");

		}

	}

}