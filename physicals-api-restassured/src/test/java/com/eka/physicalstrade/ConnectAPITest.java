package com.eka.physicalstrade;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.containsString;

import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
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
import io.restassured.response.ResponseBody;

public class ConnectAPITest {

	String token = null;
	String tenant = null;
	String userName = null;
	String password = null;
	String eka_connect_host = null;
	Map<String, Object> requestPayload = new HashMap<String, Object>();

	private static final String tokenGenerationApiPath = "/api/authenticate";
	private static final String CONNECT_DATA_API = "/data/5d907cd2-7785-4d34-bcda-aa84b2158415/contract";
	private static final String USER_INFO_API = "/api/userinfo";

	@BeforeTest
	public void setUp() throws Exception {

		Properties prop = new Properties();
		prop.load(new FileInputStream(ResourceUtils.getFile("classpath:RestAssuredTest.properties")));
		tenant = prop.getProperty("tenant");
		userName = prop.getProperty("userName");
		password = prop.getProperty("password");
		eka_connect_host = (String) prop.getProperty("eka_connect_host");
		URL url = new URL(eka_connect_host);
		RestAssured.baseURI = "http://" + url.getHost();
		RestAssured.port = url.getPort();
		token = authenticateUser(userName, password);
	}

	@Test(enabled = true)
	public void testGenerateId() throws Exception {
		String payload = "{\"itemDetails\":[],\"contractState\":\"autoSave\"}";
		Map<String, Object> jsonMap = new JSONObject(payload).toMap();
		Response response = callAPI(Method.POST, CONNECT_DATA_API, jsonMap);
		verify200OKResponse(response);
		response.then().assertThat().body("_id", is(notNullValue()));

	}

	@Test(enabled = true)
	public void testPostData() throws Exception {

		FileInputStream fileInputStream = new FileInputStream(ResourceUtils.getFile("classpath:contract.json"));
		Map<String, Object> jsonMap = new JSONObject(new JSONTokener(fileInputStream)).toMap();

		Response response = callAPI(Method.POST, CONNECT_DATA_API, jsonMap);
		verify200OKResponse(response);
		response.then().assertThat().body("_id", is(notNullValue())).and().body("contractState", is("trade"));

		fileInputStream.close();

	}

	@Test(enabled = true)
	public void testPutData() throws Exception {

		Object _id = getUnderscoreId();
		FileInputStream fileInputStream = new FileInputStream(ResourceUtils.getFile("classpath:contract.json"));
		Map<String, Object> jsonMap = new JSONObject(new JSONTokener(fileInputStream)).toMap();
		jsonMap.put("_id", _id);

		Response putResponse = callAPI(Method.PUT, CONNECT_DATA_API + "/" + _id, jsonMap);
		verify200OKResponse(putResponse);
		putResponse.then().assertThat().body("_id", is(notNullValue())).and().body("contractState", is("trade"));
		fileInputStream.close();

	}

	@Test(enabled = true)
	public void testGetData() throws Exception {
		Response response = callAPI(Method.GET, CONNECT_DATA_API, null);
		verify200OKResponse(response);
	}

	@Test(enabled = true)
	public void testGetById() throws Exception {
		Object _id = getUnderscoreId();
		Response response = callAPI(Method.GET, CONNECT_DATA_API + "/" + _id, null);
		verify200OKResponse(response);
		response.then().assertThat().body("_id", is(Arrays.asList(_id)));
	}

	@Test(enabled = true)
	public void testGetUserInfo() throws Exception {

		Response response = callAPI(Method.GET, USER_INFO_API, null);
		verify200OKResponse(response);
		response.then().assertThat().body("userName", is(notNullValue()));
	}

	@Test(enabled = false)
	public void testGetPropertyByName() {
		RestAssured.given().log().all().header("Authorization", token).header("X-TenantID", tenant)
				.header("Content-Type", "application/json").when().request("GET", "/property/eka_recommendation_host")
				.then().assertThat().statusCode(200).body("propertyValue", is("http://172.16.0.165:4400"));
	}

	@Test(enabled = false)
	public void testGetPropertyByNameWithoutToken() {
		given().log().all().header("X-TenantID", tenant).header("Content-Type", "application/json").when()
				.request("GET", "/property/eka_recommendation_host").then().assertThat().statusCode(401)
				.body("localizedMessage", containsString("Error in User Authentication"));
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

	private Object getUnderscoreId() {
		String payload = "{\"itemDetails\":[],\"contractState\":\"autoSave\"}";
		Map<String, Object> generateIdPayload = new JSONObject(payload).toMap();
		Response response = callAPI(Method.POST, CONNECT_DATA_API, generateIdPayload);
		verify200OKResponse(response);
		JsonPath jsonPathForSavedData = new JsonPath(response.asString());
		Object _id = null;
		_id = jsonPathForSavedData.get("_id");
		return _id;
	}
}