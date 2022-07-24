package com.eka.physicalstradecontroller;

import static org.junit.Assert.assertEquals;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicals.dto.ContractItemDetailsDTO;
import com.eka.physicals.dto.ContractPricingDetailsDTO;
import com.eka.physicalstrade.controller.ContractManagementController;
import com.eka.physicalstrade.dataobject.APIResponse;
import com.eka.physicalstrade.exception.CTRMRestException;
import com.eka.physicalstrade.exception.CloneObjectDataNotFoundException;
import com.eka.physicalstrade.exception.ContractDataParsingException;
import com.eka.physicalstrade.exception.ContractNotFoundException;
import com.eka.physicalstrade.exception.ContractOperationNotAllowed;
import com.eka.physicalstrade.exception.DuplicateRecordException;
import com.eka.physicalstrade.util.CTRMRestTemplate;
import com.eka.physicalstrade.util.ConnectRestTemplate;

@PropertySource("classpath:environment-test.properties")
@RunWith(MockitoJUnitRunner.Silent.class)
public class ContractManagementControllerTest {

	@InjectMocks
	ContractManagementController contractManagementController;

	@Mock
	HttpServletRequest request;

	@Mock
	CTRMRestTemplate ctrmRestTemplate;

	@Mock
	ConnectRestTemplate connectRestTemplate;

	@Test
	public void createContractTest() throws JSONException, CTRMRestException, CloneObjectDataNotFoundException, ContractDataParsingException {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		// contractDetailsDTO.setId("id");
		// contractDetailsDTO.setAgentRefNo("BR_253_");
		// contractDetailsDTO.setAgentCommType("Percentage");
		ContractItemDetailsDTO contractItemDetailsDTO = new ContractItemDetailsDTO();
		ContractPricingDetailsDTO contractPricingDetailsDTO = new ContractPricingDetailsDTO();
		contractPricingDetailsDTO.setPriceTypeId("Flat");
		contractPricingDetailsDTO.setPricingFormulaId("12121");
		contractPricingDetailsDTO.setPriceDf(new BigDecimal(120));
		contractPricingDetailsDTO.setPriceUnitId("PPU-2000");
		contractItemDetailsDTO.setInternalItemRefNo("PCI-7983");
		contractItemDetailsDTO.setItemNo(1);
		contractItemDetailsDTO.setProductId("PDM-M-12");
		contractItemDetailsDTO.setPricing(contractPricingDetailsDTO);
		List<ContractItemDetailsDTO> contractItemDetailsList = new ArrayList<>();
		contractItemDetailsList.add(contractItemDetailsDTO);
		contractDetailsDTO.setContractRefNo("P-375-NAT");
		contractDetailsDTO.setInternalContractRefNo("PCM-7958");
		contractDetailsDTO.setTemplateId("tempId");
		Date issueDate = new Date(2018 - 11 - 17);
		contractDetailsDTO.setIssueDate(issueDate);
		contractDetailsDTO.setDealType("Third_Party");
		contractDetailsDTO.setContractType("P");
		contractDetailsDTO.setItemDetails(contractItemDetailsList);
		JSONObject itemPricingObj = new JSONObject();
		itemPricingObj.put("priceTypeId", "Flat");
		String nullValue = null;
		itemPricingObj.put("pricingFormulaId", nullValue);
		itemPricingObj.put("priceDf", 120);
		itemPricingObj.put("priceUnitId", "PPU-2000");
		JSONArray itemDetailsArray = new JSONArray();
		JSONObject itemDetailsObj = new JSONObject();
		itemDetailsObj.put("internalItemRefNo", "PCI-7983");
		itemDetailsObj.put("itemNo", 1);
		itemDetailsObj.put("productId", "PDM-M-12");
		itemDetailsObj.put("pricing", itemPricingObj);
		itemDetailsArray.put(itemDetailsObj);
		JSONObject contractObj = new JSONObject();
		contractObj.put("contractRefNo", "P-375-NAT");
		contractObj.put("internalContractRefNo", "PCM-7958");
		contractObj.put("issueDate", "2018-11-17");
		contractObj.put("dealType", "Third_Party");
		contractObj.put("contractType", "P");
		contractObj.put("itemDetails", itemDetailsArray);
		contractObj.put("reasonForModification", nullValue);
		contractObj.put("approvalManagementDO", nullValue);
		JSONObject dataObj = new JSONObject();
		JSONObject sourceCollection = new JSONObject();
		sourceCollection.put("contractRefNo", "P-375-NAT");
		dataObj.put("contractDetails", contractObj);
		dataObj.put("sourceContractDetails", sourceCollection);
		JSONObject obj = new JSONObject();
		obj.put("status", "success");
		obj.put("data", dataObj);
		obj.put("errors", nullValue);

		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				obj.toString(), HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(ctrmRestTemplate)
				.contractOperation(ArgumentMatchers.any(),
						ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());

		ResponseEntity<String> connectResponse = new ResponseEntity<String>(
				obj.toString(), HttpStatus.OK);
		Mockito.doReturn(connectResponse)
				.when(connectRestTemplate)
				.postData(ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());
		String data = "arb";
		String type = "catch";

		ResponseEntity<APIResponse> actualResponse = contractManagementController
				.createContract(contractDetailsDTO, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void editContractTest() throws JSONException, CTRMRestException, CloneObjectDataNotFoundException, ContractDataParsingException {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		JSONObject obj = new JSONObject();
		obj.put("id", "id");
		obj.put("agentRefNo", "BR_253_");
		obj.put("agentCommType", "Percentage");
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				obj.toString(), HttpStatus.OK);
		/*Mockito.doReturn(expectedResponse)
				.when(ctrmRestTemplate)
				.contractOperation(ArgumentMatchers.any(),
						ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());*/
		String data = "arb";
		String type = "catch";
		ResponseEntity<APIResponse> actualResponse = contractManagementController
				.editContract(contractDetailsDTO, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void getContractTest() throws ContractNotFoundException, ContractOperationNotAllowed {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		List<ContractDetailsDTO> contractDetailsDTOs = new ArrayList<>();
		contractDetailsDTOs.add(contractDetailsDTO);
		ResponseEntity<List<ContractDetailsDTO>> connectResponse = new ResponseEntity<List<ContractDetailsDTO>>(
				contractDetailsDTOs, HttpStatus.OK);
		ResponseEntity<ContractDetailsDTO> expectedResponse = new ResponseEntity<ContractDetailsDTO>(
				contractDetailsDTO, HttpStatus.OK);
		Mockito.doReturn(connectResponse)
				.when(connectRestTemplate)
				.getData(ArgumentMatchers.anyString(),
						ArgumentMatchers.any(HttpServletRequest.class));

		String contractRefNo = "12121";
		ResponseEntity<ContractDetailsDTO> actualResponse = null;
		try {
			actualResponse = contractManagementController.getContract(
					contractRefNo, request);
		} catch (DuplicateRecordException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void getContractsTest() {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				contractDetailsDTO.toString(), HttpStatus.OK);
		Mockito.doReturn(expectedResponse).when(ctrmRestTemplate)
				.getContractAll(ArgumentMatchers.any(), ArgumentMatchers.any());
		ResponseEntity<String> actualResponse = contractManagementController
				.getContracts(request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void createContractTemplateTest() throws JSONException, CTRMRestException {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				contractDetailsDTO.toString(), HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(ctrmRestTemplate)
				.contractOperation(ArgumentMatchers.any(),
						ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());
		ResponseEntity<String> actualResponse = contractManagementController
				.createContractTemplate(contractDetailsDTO, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void editContractTemplateTest() throws JSONException, CTRMRestException {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				contractDetailsDTO.toString(), HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(ctrmRestTemplate)
				.contractOperation(ArgumentMatchers.any(),
						ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());
		ResponseEntity<String> actualResponse = contractManagementController
				.editContractTemplate(contractDetailsDTO, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void getContractDraftTest() {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				"success", HttpStatus.OK);
		Mockito.doReturn(expectedResponse).when(connectRestTemplate)
				.getData(ArgumentMatchers.anyString(), ArgumentMatchers.any());
		String id = "12121";
		ResponseEntity<String> actualResponse = contractManagementController
				.getAutoSaveDraftById(request, id);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void getContractTemplateTest() throws ContractNotFoundException, ContractOperationNotAllowed {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		ResponseEntity<ContractDetailsDTO> expectedResponse = new ResponseEntity<ContractDetailsDTO>(
				contractDetailsDTO, HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(connectRestTemplate)
				.getData(ArgumentMatchers.any(),
						ArgumentMatchers.any(HttpServletRequest.class));
		String contractRefNo = "12121";
		ResponseEntity<ContractDetailsDTO> actualResponse = null;
		try {
			actualResponse = contractManagementController.getContractTemplate(
					request, contractRefNo);
		} catch (DuplicateRecordException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void createContractDraftAutoSaveTest() {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				"success", HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(connectRestTemplate)
				.postData(ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());
		String contractData = "data";
		ResponseEntity<String> actualResponse = contractManagementController
				.createContractDraftAutoSave(contractData, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void updateContractDraftAutoSaveTest() {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				"success", HttpStatus.OK);
		/*Mockito.doReturn(expectedResponse)
				.when(connectRestTemplate)
				.putData(ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());*/
		String contractData = "data";
		String id = "12121";
		ResponseEntity<String> actualResponse = contractManagementController
				.updateContractDraftAutoSave(id, contractData, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void createContractDraftTest() throws JSONException, CTRMRestException {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				contractDetailsDTO.toString(), HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(ctrmRestTemplate)
				.contractOperation(ArgumentMatchers.any(),
						ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());
		ResponseEntity<String> actualResponse = contractManagementController
				.createContractDraft(contractDetailsDTO, request);
		assertEquals(expectedResponse, actualResponse);

	}

	@Test
	public void editContractDraftTest() throws JSONException, CTRMRestException {

		ReflectionTestUtils.setField(this.contractManagementController,
				"ctrmRestTemplate", ctrmRestTemplate);
		ReflectionTestUtils.setField(this.contractManagementController,
				"connectRestTemplate", connectRestTemplate);
		ContractDetailsDTO contractDetailsDTO = new ContractDetailsDTO();
		contractDetailsDTO.set_id("id");
		contractDetailsDTO.setAgentRefNo("BR_253_");
		contractDetailsDTO.setAgentCommType("Percentage");
		ResponseEntity<String> expectedResponse = new ResponseEntity<String>(
				contractDetailsDTO.toString(), HttpStatus.OK);
		Mockito.doReturn(expectedResponse)
				.when(ctrmRestTemplate)
				.contractOperation(ArgumentMatchers.any(),
						ArgumentMatchers.any(), ArgumentMatchers.any(),
						ArgumentMatchers.any());
		ResponseEntity<String> actualResponse = contractManagementController
				.editContractDraft(contractDetailsDTO, request);
		assertEquals(expectedResponse, actualResponse);

	}

}
