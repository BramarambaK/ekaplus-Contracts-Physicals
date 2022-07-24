package com.eka.physicalstrade.controllers;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;

import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.http.HttpStatus;
import org.json.JSONObject;
import org.springframework.util.ResourceUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import io.restassured.RestAssured;
import io.restassured.http.Method;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;


public class ContractManagementControllerTest {

	String token = null;
	String tenant = null;
	String userName = null;
	String password = null;
	String eka_connect_host = null;
	Map<String, Object> requestPayload = new HashMap<String, Object>();

	private static final String tokenGenerationApiPath = "/api/authenticate";

	@BeforeTest
	public void setUp() throws Exception {

		Properties prop = new Properties();
		prop.load(new FileInputStream(ResourceUtils.getFile("classpath:RestAssuredTest.properties")));
		tenant = prop.getProperty("tenant");
		userName = prop.getProperty("userName");
		password = prop.getProperty("password");
		URL url = new URL((String) prop.getProperty("eka_connect_host"));
		RestAssured.baseURI = "http://" + url.getHost();
		RestAssured.port = url.getPort();
		token = authenticateUser(userName, password);
	}
	
	@Test(enabled = true)
	public void testGetPropertyByName() {
		given().log().all().header("Authorization", token).header("X-TenantID", tenant)
				.header("Content-Type", "application/json").when().request("GET", "/property/eka_recommendation_host")
				.then().assertThat().statusCode(200)
				.body("propertyValue", is("http://172.16.0.165:4400"));
	}
	
	@Test(enabled = true)
	public void testGetPropertyByNameWithoutToken() {
		given().log().all().header("X-TenantID", tenant)
				.header("Content-Type", "application/json").when().request("GET", "/property/eka_recommendation_host")
				.then().assertThat().statusCode(401)
				.body("localizedMessage", containsString("Error in User Authentication"));
	}

	
	//RestAssured for contract creation API
	@Test(enabled = true)
	public void testContractCreation(String success) {
		String path = "/api/physicalstrade/contract";
		String payloadAsString = "[{\\\"contractIssueDate\\\":\\\"23-Jan-2020\\\",\\\"traderName\\\":\\\"admin admin\\\",\\\"dealType\\\":\\\"Third Party\\\",\\\"cpName\\\":\\\"23-7 Farms\\\",\\\"incoTerms\\\":\\\"CIF\\\",\\\"paymentTerms\\\":\\\"100PIA\\\",\\\"itemQuantityUnitId\\\":\\\"MT\\\",\\\"product\\\":\\\"Crude\\\",\\\"quality\\\":\\\"MPR\\\",\\\"profitCenter\\\":\\\"EU\\\",\\\"strategy\\\":\\\"Trading\\\",\\\"itemQuantity\\\":\\\"10\\\",\\\"tolerance\\\":\\\"1\\\",\\\"toleranceType\\\":\\\"Percentage\\\",\\\"toleranceLevel\\\":\\\"Buyer\\\",\\\"plannedShipmentQuantity\\\":\\\"10\\\",\\\"payInCurrency\\\":\\\"USD\\\",\\\"priceType\\\":\\\"Flat\\\",\\\"priceDf\\\":\\\"100\\\",\\\"priceUnitId\\\":\\\"USD\\/MT\\\",\\\"loadingType\\\":\\\"Port\\\",\\\"loadingCountry\\\":\\\"Australia\\\",\\\"loadingLocation\\\":\\\"Adelaide\\\",\\\"destinationType\\\":\\\"Port\\\",\\\"destinationCountry\\\":\\\"Albania\\\",\\\"destinationLocation\\\":\\\"Durres\\\",\\\"periodType\\\":\\\"Shipment\\\",\\\"deliveryFromDate\\\":\\\"07-Jan-2020\\\",\\\"deliveryToDate\\\":\\\"31-Jan-2020\\\",\\\"paymentDueDate\\\":\\\"19-Jan-2020\\\",\\\"invoiceDocumentPriceUnit\\\":\\\"USD\\/MT\\\",\\\"taxScheduleApplicableCountry\\\":\\\"Belgium\\\",\\\"taxSchedule\\\":\\\"NO TAX\\\",\\\"termsAndConditions\\\":\\\"English\\\",\\\"arbitration\\\":\\\"English\\\",\\\"weightFinalAt\\\":\\\"Discharge\\\",\\\"qualityFinalAt\\\":\\\"Discharge\\\",\\\"approvalStatus\\\":\\\"Yes\\\",\\\"offerType\\\":\\\"Purchase\\\"}]";
		JSONObject payloadJson = new JSONObject(payloadAsString);

		Response actualResponse = given().log().all().header("X-TenantID", tenant)
				.header("Content-Type", "application/json").header("Authorization", token).with()
				.body(payloadJson.toMap()).when().request("POST", path);
		
		JsonPath jsonPath = new JsonPath(actualResponse.asString());
		success = jsonPath.get("status");
		
		Assert.assertEquals(success,"success");
		
	}

	//RestAssured for cancel contract API
	@Test(enabled = true)
	public void testCancelContract(String success) {
		String path = "/cancelContract";
		String payloadAsString = "";
		
		JSONObject payloadJson = new JSONObject(payloadAsString);

		Response actualResponse = given().log().all().header("X-TenantID", tenant)
				.header("Content-Type", "application/json").header("Authorization", token).with()
				.body(payloadJson.toMap()).when().request("POST", path);
		
		JsonPath jsonPath = new JsonPath(actualResponse.asString());
		success = jsonPath.get("status");
		
		Assert.assertEquals(success,"success");
		
	}
	
	//RestAssured for Bulk Contract API
		@Test(enabled = true)
		public void testBulkAmendContract(String success) {
			String path = "/api/physicalstrade/contract/header/bulk";
			String payloadAsString = "";
			
			JSONObject payloadJson = new JSONObject(payloadAsString);

			Response actualResponse = given().log().all().header("X-TenantID", tenant)
					.header("Content-Type", "application/json").header("Authorization", token).with()
					.body(payloadJson.toMap()).when().request("POST", path);
			
			JsonPath jsonPath = new JsonPath(actualResponse.asString());
			success = jsonPath.get("status");
			
			Assert.assertEquals(success,"success");
			
		}
	
	private String authenticateUser(String username, String password) throws UnsupportedEncodingException {
		Map<String, Object> reqBody = new HashMap<String, Object>();
		reqBody.put("userName", username);
		reqBody.put("pwd", password);
		String base64encodedUsernamePassword = Base64.getEncoder()
				.encodeToString((username + ":" + password).getBytes("utf-8"));
		Response response = given().header("Content-Type", "application/json")
				.header("Authorization", "Basic " + base64encodedUsernamePassword).header("X-TenantID", tenant)
				.body(reqBody).when().post(tokenGenerationApiPath);
		JsonPath jsonPath = new JsonPath(response.asString());
		return jsonPath.getString("auth2AccessToken.access_token");
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
		}
		return null;
	}

	private Map<String, Object> generatePayloadFromString(String payload) {
		return new JSONObject(payload).toMap();
	}

	private void verify200OKResponse(Response response) {
		Assert.assertEquals(response.getStatusCode(), HttpStatus.SC_OK);
	}

	@Test(enabled = true)
	public void testNewsPageAPIs() {
		// call app meta--
		Response appMetaResponse = callAPI(Method.POST, "/meta/app/physicals", new HashMap<>());
		verify200OKResponse(appMetaResponse);
		appMetaResponse.then().assertThat().body("name", is("physicals"));

		// call mdm--
		String mdmPayloadString = "{\"workFlowTask\":\"mdm_api\",\"payLoadData\":\"\",\"appId\":\"5d907cd2-7785-4d34-bcda-aa84b2158415\",\"data\":[{\"serviceKey\":\"carryChargeRateTypeList\"},{\"serviceKey\":\"cpPersonInCharge\"},{\"serviceKey\":\"corporateLevelTemplateList\"},{\"serviceKey\":\"PortOperations\"},{\"serviceKey\":\"variableInterestCurve\"},{\"serviceKey\":\"LatePaymentInt\"},{\"serviceKey\":\"corporateStrategy\"},{\"serviceKey\":\"physicalproductquantitylist\"},{\"serviceKey\":\"productCurrencyList\"},{\"serviceKey\":\"Tolerance\"},{\"serviceKey\":\"AbsolutePercentage\"},{\"serviceKey\":\"countriesComboDataFromDB\"},{\"serviceKey\":\"priceUnitsByCurrency\"},{\"serviceKey\":\"CostType\"},{\"serviceKey\":\"costComponent\",\"dependsOn\":[\"SECONDARY_COST\",\"CONTRACT\"]},{\"serviceKey\":\"corporateStrategy\"},{\"serviceKey\":\"incoterm\"},{\"serviceKey\":\"ticketModeOfTransport\"},{\"serviceKey\":\"CarryChargeFrequencyId\"},{\"serviceKey\":\"productpricetypelist\"},{\"serviceKey\":\"userListByRole\"},{\"serviceKey\":\"physicalproductquantitylist\"},{\"serviceKey\":\"qualityComboDropDrown\"},{\"serviceKey\":\"productComboDropDrown\"},{\"serviceKey\":\"dealType\",\"dependsOn\":[\"DealType\"]},{\"serviceKey\":\"paytermlist_phy\"},{\"serviceKey\":\"applicableLaw\"},{\"serviceKey\":\"ContractRulesAndArbitrationList\"},{\"serviceKey\":\"businesspartnercontactperson\",\"dependsOn\":[\"ALL\"]},{\"serviceKey\":\"allDistinctPriceUnits\"},{\"serviceKey\":\"PriceFixLatestBy\"},{\"serviceKey\":\"PriceFixBy\"},{\"serviceKey\":\"FixationMethod\"},{\"serviceKey\":\"estimateFor\"},{\"serviceKey\":\"CostRateType\"},{\"serviceKey\":\"CostIncExp\"},{\"serviceKey\":\"taxScheduleCountrystate\"}]}";
		Response mdmResponse = callAPI(Method.POST, "/workflow/mdm",
				generatePayloadFromString(mdmPayloadString));
		verify200OKResponse(mdmResponse);
		mdmResponse.then().assertThat().body("PortOperations.size()", greaterThan(0));
		
		// call contract object--
		Response objectMetaResponse = callAPI(Method.GET, "/meta/object/contract", new HashMap<>());
		verify200OKResponse(objectMetaResponse);
		appMetaResponse.then().assertThat().body("name", is("contract"));

		// call contract latest--
		Response latestContractResponse = callAPI(Method.GET, "contract/latest", new HashMap<>());
		verify200OKResponse(latestContractResponse);
		
		// call contract approval--
		Response approvalNewResponse = callAPI(Method.GET, "contract/approval?viewType=New", new HashMap<>());
		verify200OKResponse(approvalNewResponse);
		approvalNewResponse.then().assertThat().body("operationType", is("New"));

		// call autosave initial--
		Response autosaveInitial = callAPI(Method.POST, "contract/draft/autosave/initial", new HashMap<>());
		verify200OKResponse(autosaveInitial);
		autosaveInitial.then().assertThat().body("contractState", is("autoSave"));

		// call ID2Values--
		String ID2ValuesPayloadString = "{\"appId\":\"5d907cd2-7785-4d34-bcda-aa84b2158415\",\"workflowTaskName\":\"id2values\",\"task\":\"id2values\",\"output\":{\"id2values\":{\"contractItems\":[{\"itemNo\":1,\"productId\":\"PDM-4751\",\"quality\":\"QAT-5694\",\"itemQty\":1250,\"itemQtyUnitId\":\"QUM-M-8\",\"tolerance\":2,\"toleranceType\":\"Percentage\",\"toleranceLevel\":\"Buyer\",\"pricing\":{\"priceTypeId\":\"Flat\",\"pricingFormulaId\":null,\"priceDf\":123,\"priceUnitId\":\"PPU-7226\",\"differentialPrice\":null,\"differentialPriceUnit\":null,\"payInCurId\":\"CM-M-7\",\"priceContractDefId\":null,\"futureInstrumentText\":null,\"priceFutureContractId\":null,\"priceMonthText\":null,\"futurePrice\":null,\"futurePriceUnitId\":null,\"basisPrice\":null,\"basisPriceUnitId\":null,\"fxInstToBasis\":null,\"priceInclusiveOfTax\":null,\"earliestBy\":null,\"priceLastFixDayBasedOn\":null,\"optionsToFix\":null,\"fixationMethod\":null},\"shipmentMode\":\"Truck\",\"deliveryFromDate\":\"15-02-2020\",\"deliveryToDate\":\"14-03-2020\",\"loadingLocationGroupTypeId\":\"City\",\"originationCityId\":\"CIM-M4-587521\",\"originationCountryId\":\"CYM-M4-20601\",\"destinationLocationGroupTypeId\":\"City\",\"destinationCityId\":\"CIM-M4-589345\",\"destinationCountryId\":\"CYM-M4-20589\",\"paymentDueDate\":{\"date\":{\"year\":2020,\"month\":2,\"day\":27},\"jsdate\":\"2020-02-26T18:30:00.000Z\",\"formatted\":\"27-Feb-2020\",\"epoc\":1582741800},\"strategyAccId\":\"CSS-K-7320\",\"taxScheduleCountryId\":\"CYM-M4-20545\",\"taxScheduleId\":\"TSS-34\",\"latePaymentInterestDetails\":{\"physicalItemInterestId\":1,\"interestRateType\":\"Variable\",\"variableType\":\"LIBORUSD\",\"interestRate\":null,\"isCompounding\":true,\"frequency\":null},\"unweighedPiPctType\":\"Percentage\",\"optionalLoadingDetails\":[{\"originationCountryId\":null,\"originationCityId\":null,\"freightDf\":null,\"freightDfPriceUnitId\":null,\"internalOptOriginationId\":null,\"optOriginInstanceDeleted\":null}],\"optionalDischargeDetails\":[{\"destinationCountryId\":null,\"destinationCityId\":null,\"freightDf\":null,\"freightDfPriceUnitId\":null,\"internalOptDestinationId\":null,\"optDestInstanceDeleted\":null}],\"isOptionalFieldsEnabled\":false,\"qualityPdScheduleId\":null,\"profitCenterId\":\"CPC-K-10403\",\"inspectionCompany\":null,\"unweighedPiPctValue\":null,\"laycanStartDate\":null,\"laycanEndDate\":null,\"valuationFormula\":null,\"internalItemRefNo\":null,\"traderUserId\":\"AK-USR-1\",\"incotermId\":\"ITM-M-4\"}]}}}";
		Response ID2ValuesResponse = callAPI(Method.POST, "/workflow",
				generatePayloadFromString(ID2ValuesPayloadString));
		verify200OKResponse(ID2ValuesResponse);
		mdmResponse.then().assertThat().body("data.contractItems.size()", greaterThan(0));
	}
}
