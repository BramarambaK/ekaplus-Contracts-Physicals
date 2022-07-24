package com.eka.physicalstrade;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;

import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.http.HttpStatus;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.springframework.util.ResourceUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import io.restassured.RestAssured;
import io.restassured.http.Method;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

public class CtrmAPITest {

	String token = null;
	String tenant = null;
	String userName = null;
	String password = null;
	String eka_ctrm_host = null;
	String eka_connect_host = null;
	Map<String, Object> requestPayload = new HashMap<String, Object>();

	private static final String tokenGenerationApiPath = "/api/authenticate";
	private static final String CTRM_BASE_API = "/api/contract";
	private static final String USER_CONTEXT_API = "/api/user/data";

	@BeforeTest
	public void setUp() throws Exception {

		Properties prop = new Properties();
		prop.load(new FileInputStream(ResourceUtils.getFile("classpath:RestAssuredTest.properties")));
		tenant = prop.getProperty("tenant");
		userName = prop.getProperty("userName");
		password = prop.getProperty("password");
		eka_connect_host = (String) prop.getProperty("eka_connect_host");
		eka_ctrm_host = (String) prop.getProperty("eka_ctrm_host");
		URL url = new URL(eka_ctrm_host);
		RestAssured.baseURI = "http://" + url.getHost();
		RestAssured.port = url.getPort();
		token = authenticateUser(userName, password);
	}

	@Test(enabled = true)
	public void testCreateContract() throws Exception {

		FileInputStream fileInputStream = new FileInputStream(ResourceUtils.getFile("classpath:contract.json"));
		Map<String, Object> jsonMap = new JSONObject(new JSONTokener(fileInputStream)).toMap();

		Response response = callAPI(Method.POST, CTRM_BASE_API + "/trade", jsonMap);
		verify200OKResponse(response);
		response.then().assertThat().body("contractRefNo", is(notNullValue()));

	}

	@Test(enabled = true)
	public void testCreateTemplate() throws Exception {

		FileInputStream fileInputStream = new FileInputStream(ResourceUtils.getFile("classpath:contract.json"));
		Map<String, Object> jsonMap = new JSONObject(new JSONTokener(fileInputStream)).toMap();

		Response response = callAPI(Method.POST, CTRM_BASE_API + "/template", jsonMap);
		verify200OKResponse(response);
		response.then().assertThat().body("contractRefNo", is(notNullValue()));

	}

	@Test(enabled = true)
	public void testCreateDraft() throws Exception {

		FileInputStream fileInputStream = new FileInputStream(ResourceUtils.getFile("classpath:contract.json"));
		Map<String, Object> jsonMap = new JSONObject(new JSONTokener(fileInputStream)).toMap();

		Response response = callAPI(Method.POST, CTRM_BASE_API + "/draft", jsonMap);
		verify200OKResponse(response);
		response.then().assertThat().body("contractRefNo", is(notNullValue()));

	}

	@Test(enabled = true)
	public void testGetApprovalNew() throws Exception {

		Response response = callAPI(Method.GET, CTRM_BASE_API + "/approval/New", null);
		verify200OKResponse(response);
		response.then().assertThat().body("operationType", is("New"));

	}

	@Test(enabled = false)
	public void testGetApprovalPending() throws Exception {
		String internalContractRefNo = "";
		Response response = callAPI(Method.GET, CTRM_BASE_API + "/approval/Pending/" + internalContractRefNo, null);
		verify200OKResponse(response);
		response.then().assertThat().body("operationType", is("Pending"));

	}

	@Test(enabled = true)
	public void testManageApproveReject() throws Exception {
		Response response = callAPI(Method.GET, CTRM_BASE_API + "/approval/manage", null);
		verify200OKResponse(response);
		response.then().assertThat().body("operationType", is(notNullValue()));

	}

	@Test(enabled = true)
	public void testUserContext() throws Exception {
		Response response = callAPI(Method.GET, USER_CONTEXT_API, null);
		verify200OKResponse(response);
		response.then().assertThat().body("userId", is(notNullValue()));

	}

	private String authenticateUser(String username, String password) throws UnsupportedEncodingException {
		Map<String, Object> body = new HashMap<String, Object>();
		body.put("userName", username);
		body.put("password", password);
		String base64encodedUsernamePassword = Base64.getEncoder()
				.encodeToString((username + ":" + password).getBytes("utf-8"));
		Response response = given().header("Content-Type", "application/json")
				.header("Authorization", "Basic " + base64encodedUsernamePassword).header("X-TenantID", tenant)
				.body(body).when().post(eka_connect_host + tokenGenerationApiPath);
		JsonPath jsonPath = new JsonPath(response.asString());
		return jsonPath.getString("auth2AccessToken.access_token");
	}

	private void verify200OKResponse(Response response) {
		Assert.assertEquals(response.getStatusCode(), HttpStatus.SC_OK);
	}

	private Response callAPI(Method httpMethod, String path, Map<String, Object> payload) {
		switch (httpMethod) {
		case GET:
			return given().log().all().header("Authorization", token).header("X-TenantID", tenant)
					.header("Content-Type", "application/json").when().request(httpMethod.name(), path);
		case POST:
		case PUT:
		case DELETE:
			return given().log().all().header("Authorization", token).header("X-TenantID", tenant)
					.header("Content-Type", "application/json").with().body(payload).when()
					.request(httpMethod.name(), path);

		default:
			return null;
		}
	}

}