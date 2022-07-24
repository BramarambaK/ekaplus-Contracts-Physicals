package com.eka.physicals.util;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

public class SerializerDeserializerTest {

	public static final String ORACLE_DEFAULT_DATE_FORMAT = "dd-MMM-yyyy";

	public static void main(String args[]) {
		Sample s = new Sample();
		s.setIssueDate(new Date());

		ObjectMapper om = new ObjectMapper();
		try {
			String str = om.writeValueAsString(s);
			System.out.println("string " + str);

		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}

		String sampleStr = "{\"issueDate\":\"2020-03-31T00:00:00.000+0000\"}";

		try {
			Sample sample1 = om.readValue(sampleStr, Sample.class);
			String oracleDate = convertDateToString(sample1.getIssueDate(),
					ORACLE_DEFAULT_DATE_FORMAT);
			System.out.println(oracleDate);
			System.out.println(sample1.getIssueDate());

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static String convertDateToString(Date date, String format) {

		String dt = null;
		try {
			// logger.debug(SystemUser.getInstance(), " Date input " + date);
			if (date != null) {
				SimpleDateFormat sdf = new SimpleDateFormat(format);
				dt = sdf.format(date);
				// logger.debug(SystemUser.getInstance(), "Final Date : " + dt);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return dt;

	}

	public static class Sample {

		@JsonSerialize(using = DateSerializer.class)
		@JsonDeserialize(using = DateDeserializer.class)
		private Date issueDate;

		public Date getIssueDate() {
			return issueDate;
		}

		public void setIssueDate(Date issueDate) {
			this.issueDate = issueDate;
		}
	}
}
