import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, timeout, catchError } from 'rxjs/operators';
import { UtilService } from '../../utils/util.service';
import { of, Subject, throwError, Observable, BehaviorSubject } from 'rxjs';
import { Urls } from '../../urls';
import * as moment from 'moment';
import { Router, NavigationEnd } from '@angular/router';
import { EnvConfig } from '@eka-framework/core';
import * as _ from 'lodash';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  createHeader = new HttpHeaders({ 'X-ObjectAction': 'CREATE' });
  readHeader = new HttpHeaders({ 'X-ObjectAction': 'READ' });
  updateHeader = new HttpHeaders({ 'X-ObjectAction': 'UPDATE' });
  deleteHeader = new HttpHeaders({ 'X-ObjectAction': 'DELETE' });
  apiCalled: any;
  timeoutMilli: number = 180000;
  appId = "5d907cd2-7785-4d34-bcda-aa84b2158415";

  refreshTrigger: Subject<string> = new Subject<string>();

  private _passcontractRef = new BehaviorSubject('');
  passcontractRef$: Observable<String>;

  setPassContractRef(val) {
    this._passcontractRef.next(val);
  }

  constructor(private router: Router,private us: UtilService, private http: HttpClient) {
    this.passcontractRef$ = this._passcontractRef.asObservable();
  }

  convertAllDatesToUnix() {}

  convertAllDatesToDatePicker() {}

  convertAllDatesToItemListFormat() {}

  getNewContractId() {
    return this.http
      .get(Urls.CREATE_CONTRACT_ID_URL)
      .pipe(this.handleError('contract temp Id creation failed'));
  }

  startNewContract() {
    return this.http.post(Urls.CREATE_CONTRACT_AUTOSAVE_URL, {}, httpOptions)
    .pipe(map(res=>{
      delete res['itemDetails'];
      return res;
    }))
  }

  getLastSavedContract(){
    return this.http.get(Urls.LAST_AUTOSAVE_CONTRACT_URL, httpOptions);
  }

  getSavedContractBy_id(id) {
    return this.http
      .get(Urls.CONTRACT_AUTOSAVE_URL + '?id=' + id, httpOptions)
      .pipe(this.handleError('Failed to get draft data from connect'));
  }

  getConnectDraft(id) {
    return this.http
      .get(Urls.CONTRACT_AUTOSAVE_URL + '?contractRefNo=' + id, httpOptions)
      .pipe(this.handleError('Failed to get draft data from connect'));
       // let workflow_payload = {
       //   appId: this.appId,
       //   workflowTaskName : "autosave_initial",
       //   task : "autosave_initial",
       //   output : { "autosave_initial":{ "test" : "karthik" } }
       // }
       // return this.http.post('/workflow',workflow_payload)
       // .pipe(map((res:any)=>res.data));
  }

  getConnectDraftCheckExists(id) {
    return this.http.get(Urls.CONTRACT_AUTOSAVE_URL + '?contractRefNo=' + id, httpOptions);
  }

  getSavedContract(id) {
    let workflow_payload = {
      appId: this.appId,
      workFlowTask : "fetch_contract"
    }
    return this.http
      .get(Urls.GET_CONTRACT_CTRM + '?contractRefNo=' + id, { headers: this.readHeader })
      //.post('/workflow/data?contractRefNo=' + id, workflow_payload)
      .pipe(
        map((data: any) => {
          if (data && data.hasOwnProperty('issueDate') && data.issueDate) {
            data.issueDate = this.us.getMyDatePickerDate(data.issueDate);
          }
          return data;
        }),
        this.handleError('failed to get contract data')
      );
  }

  clonePostConnectDraft(data) {
    let workflow_payload = {
      appId: this.appId,
      workflowTaskName : "autosave_initial",
      task : "autosave_initial",
      output : { "autosave_initial":{} }
    }
    return this.http
      .post(Urls.CREATE_CONTRACT_AUTOSAVE_URL, data, httpOptions)
      //.post('/workflow', workflow_payload)
      .pipe(this.handleError('clone contract failed'));
  }

  saveDraftContract(data, id) {
    data = this.ctrmDataCheck(data);
    let workflow_payload = {
      appId: this.appId,
      workflowTaskName : "update_draft",
      task : "update_draft",
      output : { "update_draft":data }
    }
    this.http
      .put(Urls.CONTRACT_AUTOSAVE_URL + '?id=' + id, data, httpOptions)
      //.post('/workflow?id='+id, workflow_payload)
      .pipe(this.handleError('draft autosave failed'))
      .subscribe(data => {});
  }

  saveDraftContractReturn(data, id) {
    data = this.ctrmDataCheck(data);
    let workflow_payload = {
      appId: this.appId,
      workflowTaskName : "update_draft",
      task : "update_draft",
      output : { "update_draft":data }
    }
    return this.http
      .put(Urls.CONTRACT_AUTOSAVE_URL + '?id=' + id, data, httpOptions)
      //.post('/workflow?id='+id, workflow_payload)
      .pipe(this.handleError('draft autosave failed'));
  }

  changeDatesToISO(data) {
    if (data.issueDate) {
      data.issueDate = this.us.getISO(data.issueDate);
    }
    if (data.itemDetails && data.itemDetails.length) {
      data.itemDetails.forEach(element => {
        element.deliveryFromDate = this.us.getISO(element.deliveryFromDate);
        element.deliveryToDate = this.us.getISO(element.deliveryToDate);
        element.paymentDueDate = this.us.getISO(element.paymentDueDate);
        element.laycanStartDate = this.us.getISO(element.laycanStartDate);
        element.laycanEndDate = this.us.getISO(element.laycanEndDate);
        element.customEventDate = this.us.getISO(element.customEventDate);
      });
    }
    return data;
  }

  saveCtrmDraftContract(contract) {
    let data = this.ctrmDataCheck(contract);
    let workflow_payload = {
      appId: this.appId,
      workflowTaskName : "save_draft",
      task : "save_draft",
      output : { "save_draft":data }
    }
    return this.http.post(Urls.CTRM_DRAFT_URL, data)
    //return this.http.post('/workflow', workflow_payload)
     .pipe(timeout(this.timeoutMilli),
      this.handleError('failed to save draft contract to CTRM')
    );
  }

  saveEditedContractReturn(contract) {
    let data = this.ctrmDataCheck(contract);
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    if(contract.dealType === 'Inter_Company' || contract.dealType === 'Intra_Company'){
      let displayValues = JSON.parse(contract["generalDetailsDisplayValue"]);
      let interCompanyCPNameDisplayValue = displayValues["cpProfileIdDisplayName"];
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'X-Corporate-Name': interCompanyCPNameDisplayValue
        })
      }
    }
    return this.http
      .put(Urls.SAVE_EDITED_CONTRACT, data, httpOptions) 
      .pipe(this.handleError('failed to update the edited contract'));
  }

  getFormulaName(id) {
    let data = {
      "appId": "84d7b167-1d9f-406d-b974-bea406a25f9a",
      "workFlowTask": "formula_list"
    }
    return this.http.post('/workflow/data?_id='+id, data)
           .pipe(map((res:any)=>res.data));
  }

  saveTemplate(template) {
    let data = this.ctrmDataCheck(template);
    return this.http
      .post(Urls.TEMPLATE_SAVE_URL, data)
      .pipe(this.handleError('template update failed'));
  }

  updateTemplate(template) {
    let data = this.ctrmDataCheck(template);
    return this.http
      .put(Urls.TEMPLATE_SAVE_URL, data)
      .pipe(this.handleError('template update failed'));
  }

  getDraftContract(id) {
    return this.http
      .get(Urls.GET_TEMPLATE_DATA + '?contractRefNo=' + id, {
        headers: this.readHeader
      })
      .pipe(this.handleError('failed to get draft data'));
  }

  getTemplateData(id) {
    return this.http
      .get(Urls.GET_TEMPLATE_DATA + '?contractRefNo=' + id, {
        headers: this.readHeader
      })
      .pipe(this.handleError('failed to get template data'));
  }

  updateTemplateWithItems(template) {
    let data = this.ctrmDataCheck(template);
    return this.http
      .put(Urls.TEMPLATE_SAVE_URL, data)
      .pipe(this.handleError('template update failed'));
  }

  createContract(contract) {
    let data = this.ctrmDataCheck(contract);
    data.internalContractRefNo = null;
    data.contractRefNo = null;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    if(contract.dealType === 'Inter_Company' || contract.dealType === 'Intra_Company'){
      let displayValues = JSON.parse(contract["generalDetailsDisplayValue"]);
      let interCompanyCPNameDisplayValue = displayValues["cpProfileIdDisplayName"];
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'X-Corporate-Name': interCompanyCPNameDisplayValue
        })
      }
    }
    return this.http
      .post(Urls.CTRM_SAVE, data, httpOptions)
      .pipe(this.handleError('contract creation failed'));
  }

  formatPricingForContractSave(item){
    let priceTypeId = item.pricing.priceTypeId;
    item.payInCurId = item.pricing.payInCurId || item.payInCurId;
    delete item.pricing['payInCurId'];
    if (priceTypeId === 'Fixed' || priceTypeId === 'On Call Basis Fixed' || priceTypeId === 'Futures First'){
      item.priceContractDefId = item.pricing.priceContractDefId || item.priceContractDefId;
      delete item.pricing['priceContractDefId'];
      item.futureInstrumentText = item.pricing.futureInstrumentText || item.futureInstrumentText;
      delete item.pricing['futureInstrumentText'];
    }else{
      item['priceContractDefId'] = null;
      item['futureInstrumentText'] = null;
    }
    if (priceTypeId === 'On Call Basis Fixed' || priceTypeId === 'Futures First'){
      if(item.pricing.earliestBy){
        item.earliestBy = this.us.getISO(item.pricing.earliestBy);
      }else if(item.earliestBy){
        item.earliestBy = this.us.getISO(item.earliestBy);
      }
      delete item.pricing['earliestBy'];
      item.priceLastFixDayBasedOn = item.pricing.priceLastFixDayBasedOn || item.priceLastFixDayBasedOn;
      delete item.pricing['priceLastFixDayBasedOn'];
      item.optionsToFix = item.pricing.optionsToFix || item.optionsToFix;
      delete item.pricing['optionsToFix'];
      item.fixationMethod = item.pricing.fixationMethod || item.fixationMethod;
      delete item.pricing['fixationMethod'];
    }else{
      item['earliestBy'] = null;
      item['priceLastFixDayBasedOn'] = null;
      item['optionsToFix'] = null;
      item['fixationMethod'] = null;
    }
    return item;
  }

  ctrmDataCheck(contract) {
    let data = JSON.parse(JSON.stringify(contract));
    if (data.itemDetails.length) {
      data.itemDetails = data.itemDetails.map((item, index) => {
        if (!item.hasOwnProperty('internalItemRefNo')) {
          item.internalItemRefNo = null;
        } 
        if (item.pricing) {
          let priceTypeId = item.pricing.priceTypeId;
          item = this.formatPricingForContractSave(item);
          delete item.pricing['priceInclusiveOfTax'];
          if (priceTypeId === 'FormulaPricing') {
            item.pricing.priceDf = 0.001;
          }
          if (priceTypeId === 'On Call Basis Fixed') {
            item.pricing.basisFixedQty = item.itemQty;
          }
          if (priceTypeId === 'Futures First') {
            item.pricing.futuresFixedQty = item.itemQty;
          }
          if (priceTypeId === 'Flat') {
            if(!item.pricing.fxBasisToPayin){
               item.pricing["fxBasisToPayin"] = 1;
            }
          }
        }
        
        // if(item.pricing){
        //   this.us.objPropRemoveNull(item.pricing);
        // }

        item.deliveryFromDate = this.us.getISO(item.deliveryFromDate);
        item.deliveryToDate = this.us.getISO(item.deliveryToDate);
        item.paymentDueDate = this.us.getISO(item.paymentDueDate);
        item.laycanStartDate = this.us.getISO(item.laycanStartDate);
        item.laycanEndDate = this.us.getISO(item.laycanEndDate);
        item.customEventDate = this.us.getISO(item.customEventDate);

        let latePayment = item.latePaymentInterestDetails;
        if (latePayment) {
          if (latePayment.isCompounding) {
            latePayment.isCompounding = 'Y';
          } else {
            latePayment.isCompounding = 'N';
            latePayment.frequency = null;
          }
          if (latePayment.interestRateType === 'Variable') {
            latePayment.variableTypeText = '1-M-LIBORUSD';
          }
        }
        item.latePaymentInterestDetails = latePayment;
        delete item['Min value'];
        delete item['Max value'];
        
        if(item.optionalLoadingDetails){
          item.optionalLoadingDetails = item.optionalLoadingDetails.filter(item=>{
            if (item.internalOptOriginationId === null && item.optOriginInstanceDeleted){
                return false   
            } else {
                return true;
            }
          })
        }

        if(item.optionalDischargeDetails){
          item.optionalDischargeDetails = item.optionalDischargeDetails.filter(item=>{
            if (item.internalOptDestinationId === null && item.optDestInstanceDeleted){
                return false   
            } else {
                return true;
            }
          })
        }

        return item;
      });
      data.itemDetails = data.itemDetails.filter(item=>{
        if (item.internalItemRefNo === null && item.isDeleted){
            return false   
        } else {
            return true;
        }
      })
    }
    delete data['myDate'];
    delete data['app'];
    delete data['object'];
    delete data['sys__createdBy'];
    delete data['sys__createdOn'];
    delete data['sys__updatedBy'];
    delete data['sys__updatedOn'];
    delete data['userId'];
    if (!data.hasOwnProperty('contractRefNo')) {
      data.contractRefNo = null;
    }
    if (!data.hasOwnProperty('internalContractRefNo')) {
      data.internalContractRefNo = null;
    }
    data.issueDate = this.us.getISO(data.issueDate);
    if(data.amendmentDate){
      data.amendmentDate = this.us.getISO(data.issueDate);
    }
    return data;
  }

  updateCtrmDraft(contract, ref) {
    let data = this.ctrmDataCheck(contract);
    data.internalContractRefNo = ref;
    return this.http
      .put(Urls.UPDATE_CTRM_DRAFT, data)
      .pipe(this.handleError('failed to update Draft contract'));
  }

  redirectToCTRM(appObject) {
    if (appObject === 'contract') {
      window.location.href = Urls.CTRM_CONTRACT_LIST_URL;
    } else if (appObject === 'template') {
      window.location.href = Urls.CTRM_TEMPLATE_LIST_URL;
    } else if (appObject === 'draft') {
      window.location.href = Urls.CTRM_DRAFT_LIST_URL;
    } else {
      window.location.href = Urls.TRM_HOME_URL;
    }
  }

  redirectToTRM() {
    window.location.href = Urls.TRM_HOME_URL;
  }

  redirectToDraftList() {
    window.location.href = Urls.CTRM_DRAFT_LIST_URL;
  }

  redirectToDraft() {
    window.location.href = Urls.CTRM_DRAFT_LIST_URL;
  }

  saveDataChange(id, data, changedBy) {
    data['changedBy'] = changedBy;
    data['changedOn'] = new Date();
    data['_id'] = id + 'change_data';
    this.http.post(Urls.CHANGE_DATA_TRACKER, data).subscribe(data => {
    });
  }

  getApprovalLevels() {
    let workflow_payload = {
      appId: this.appId,
      workflowTaskName : "fetch_approval_levels",
      task : "fetch_approval_levels",
      output : { "fetch_approval_levels":{} }
    }
    return this.http.post(Urls.GET_APPROVER_LIST + '?viewType=New', {}).pipe(this.handleError('failed to get approval list'));
  }

  getPendingApproversList(id) {
    return this.http.post(Urls.GET_PENDING_APPROVERS + '?viewType=PENDING&internalContractRefNo=' + id, {});
  }

  approveRejectContract(data, id) {
    return this.http.post(Urls.APPROVER_REJECT + '?internalContractRefNo=' + id, data);
  }

  reqFailedObs: Subject<string> = new Subject<string>();

  handleError(errMsg = 'request failed') {
    return catchError(errorResponse => {
      errorResponse = errorResponse && errorResponse.error;
      console.log(errorResponse);
      this.reqFailedObs.observers = this.reqFailedObs.observers.slice(-1);
      if(_.get(errorResponse, "error.errors[0]", false)){
        errMsg = errorResponse.error.errors.join('\n');
      } else if(_.get(errorResponse, "error", false) && typeof errorResponse.error === 'string'){
        errMsg = errorResponse.error;
      } else if(_.get(errorResponse, "errorLocalizedMessage", false) && typeof errorResponse.errorLocalizedMessage === 'string'){
        errMsg = errorResponse.errorLocalizedMessage;
      } else if(errorResponse !== null){
        errMsg = JSON.stringify(errorResponse);
      } else if(errorResponse === null){
        errMsg = "Unable to fetch response";
      }
      this.reqFailedObs.next(errMsg);
      return throwError('failed');
    });
  }

  deleteUpload(contractId, documentId) {
    const httpOptions = {
      headers: new HttpHeaders({
      "Content-Type":"application/json", 
      "storageType":"trmAGS"
      })
    };
    let url = `/workflow`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      id: "",
      "workflowTaskName": 'documentDelete',
      task: "documentDelete",
      output: {
        "documentDelete": {
          "otherAttributes": {
            "internalRefNo": contractId,
         "documentIds":[documentId]        
        }
        }
      }
    }
    return this.http
    .post(url, workflowtask, httpOptions)
  }

  getFileDownload(id) {
        const httpOptionsForDocument = {
      headers: new HttpHeaders({
        'storageType': 'trmAGS',
        'Content-Type': 'application/json'
      })
    };
    var data={
      documentId:id
    }
    return this.http.post('/download/',data,httpOptionsForDocument);
  }		 

  upload(data, contractId) {

  
    const httpOptionsForDocument = {
      headers: new HttpHeaders({
        'storageType': 'trmAGS',
      })
    };

    
    // data['refObjectId']="467a28cc-bc93-4e38-8ff5-0a56ae128f3b",
    // data['refObject']="supplierconnect"
    return this.http.post(
      `/file/upload/v2`,
      data,
      httpOptionsForDocument
    );
  }


  getListDocument(contractId){

  
    const httpOptions = {
      headers: new HttpHeaders({
      "Content-Type":"application/json", 
      "storageType":"trmAGS"
      })
    };
    let url = `/workflow/data`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      "workFlowTask": 'documentListContract',
      "payLoadData" : {
        "otherAttributes": {
          "entityId":contractId
      }
    }
     
    }
    return this.http
    .post(url, workflowtask, httpOptions)
  }

  getItemsListDisplayValues(keyData) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'id2values',
      task:"id2values",
      output: {
        id2values: { contractItems : keyData }
      }
    }
    return this.http.post(Urls.ID2VALUE, workFlowConfigBody)
           .pipe(map((res:any)=>res.data.contractItems));
    // return of([
    //   {
    //     "profitCenterId": "CPC-10491",
    //     "profitCenterId.displayText": "Canada Crude",
    //     "itemQty": "1200",
    //     "loadingLocationGroupTypeId": "City",
    //     "loadingLocationGroupTypeId.displayText": "City",
    //     "taxScheduleCountryId": "CYM-M4-20545",
    //     "taxScheduleCountryId.displayText": "South Africa",
    //     "deliveryToDate": "2019-10-31T00:00:00.000+0000",
    //     "internalItemRefNo": "PCI-31843",
    //     "isOptionalOrigination": "N",
    //     "itemNo": "1",
    //     "itemQtyUnitId": "QUM-M-8",
    //     "payInCurId": "CM-M-7",
    //     "payInCurId.displayText": "USD",
    //     "destinationLocationGroupTypeId": "City",
    //     "destinationLocationGroupTypeId.displayText": "City",
    //     "packingTypeId": "PTM-M-2",
    //     "dailyMonthly": "Daily",
    //     "originId": "POM-9585",
    //     "isRenewable": "Y",
    //     "isDeleted": "false",
    //     "itemDisplayValue": "{\"qualityDisplayName\":\"Gasoil 0.05%\"}",
    //     "toleranceLevel": "Buyer",
    //     "toleranceLevel.displayText": "Buyer",
    //     "originationCityId": "CIM-M4-589167",
    //     "originationCityId.displayText": "Paldau",
    //     "toleranceType": "Percentage",
    //     "toleranceType.displayText": "%",
    //     "taxScheduleId": "TSS-34",
    //     "tolerance": "0",
    //     "incotermId": "ITM-M-4",
    //     "incotermId.displayText": "CIF",
    //     "isOptionalDestination": "N",
    //     "estimates": [],
    //     "dailyMonthlyQty": "40",
    //     "productId": "PDM-4721",
    //     "productId.displayText": "",
    //     "traderUserId": "AK-7124",
    //     "traderUserId.displayText": "pooja S L",
    //     "originationCountryId": "CYM-M4-20592",
    //     "originationCountryId.displayText": "Austria",
    //     "productSpecs": "undefined,Gasoil 0.05%",
    //     "deliveryFromDate": "2019-10-01T00:00:00.000+0000",
    //     "shipmentMode": "Truck",
    //     "shipmentMode.displayText": null,
    //     "toleranceMax": "0",
    //     "isOptionalFieldsEnabled": "false",
    //     "quality": "QAT-10766",
    //     "quality.displayText": null,
    //     "cropYearId": "GCM-9108",
    //     "paymentDueDate": "2020-06-23T00:00:00.000+0000",
    //     "latePaymentInterestDetails": {
    //       "variableTypeText": "",
    //       "interestRate": "0",
    //       "variableType": "LIBORUSD",
    //       "isCompounding": "Y",
    //       "physicalItemInterestId": "PII-27656",
    //       "interestRateType": "Variable",
    //       "interestRateType.displayText": "Variable"
    //     },
    //     "holidayRule": "holidayRule-002",
    //     "holidayRule.displayText": "Next Business Day",
    //     "strategyAccId": "CSS-7357",
    //     "strategyAccId.displayText": "Canadian Crude Oil Strategy",
    //     "toleranceMin": "0",
    //     "unweighedPiPctType": "Percentage",
    //     "destinationCityId": "CIM-M4-589082",
    //     "destinationCityId.displayText": "Manama",
    //     "pricing": {
    //       "pricingFormulaId": "5ef1f1b052faff0001e6912d",
    //       "priceUnitId": "PPU-7152",
    //       "priceDf": "0.001",
    //       "pricingStrategy": "pricingStrategy-001",
    //       "priceTypeId": "FormulaPricing"
    //     },
    //     "destinationCountryId": "CYM-M4-20650",
    //     "destinationCountryId.displayText": "Bahrain"
    //   }
    // ]);
  }

  getCpAddress(cpId) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      task : 'cpAddress',
      workflowTaskName: 'cpAddress',
      output: {
        cpAddress: { "cpId": cpId }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody);
  }

  getCpDefaultPaymentTerms(cpId) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'defaultPaymentTerm',
      task:"defaultPaymentTerm",
      output: {
        defaultPaymentTerm: { "cpProfileId": cpId }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody);
  }

  getSecodaryCostDisplayValues(keyData) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'id2values',
      task:"id2values",
      output: {
        id2values: { contractItems : keyData }
      }
    }
    return this.http.post(Urls.ID2VALUE, workFlowConfigBody)
           .pipe(map((res:any)=>res.data.contractItems));
    // let workflow_payload = {
    //   appId: this.appId,
    //   workflowTaskName : "fetch_id2values",
    //   task : "fetch_id2values",
    //   output : { "fetch_id2values":keyData }
    // }
    // return this.http.post('/workflow',workflow_payload);
  }

  removeAllInternalIDs(contractData){
    contractData["contractRefNo"] = null;
    contractData["internalContractRefNo"] = null;
    if (contractData.itemDetails.length > 0){
      contractData.itemDetails.forEach(item => {
        item = this.removeAllItemInternalIDs(item);
      });
    }
    return contractData;
  }

  removeAllItemInternalIDs(item){
    item["internalItemRefNo"] = null;
    if(item.estimates && item.estimates.length > 0){
      item.estimates = item.estimates.filter(estimate=>{
        return estimate["operation"] !== 'DELETE';
      });
      item.estimates.forEach(estimate => {
          estimate["internalAccrualId"] = null;
          estimate["operation"] = null;
      });
    }
    if(item.optionalLoadingDetails && item.optionalLoadingDetails.length > 0){
      item.optionalLoadingDetails = item.optionalLoadingDetails.filter(loading=>{
        return loading["optOriginInstanceDeleted"] !== true;
      });
      item.optionalLoadingDetails.forEach(loading=>{
          loading["internalOptOriginationId"] = null;
          loading["optOriginInstanceDeleted"] = null;
      })
    }
    if(item.optionalDischargeDetails && item.optionalDischargeDetails.length > 0){
      item.optionalDischargeDetails = item.optionalDischargeDetails.filter(discharge=>{
        return discharge["optDestInstanceDeleted"] !== true;
      })
      item.optionalDischargeDetails.forEach(discharge=>{
        discharge["internalOptDestinationId"] = null;
        discharge["optDestInstanceDeleted"] = null;
      })
    }
    if(item.itemAdditionDeductions && item.itemAdditionDeductions.length > 0){
      item.itemAdditionDeductions = item.itemAdditionDeductions.filter(addDed=>{
        return addDed["isDeleted"] !== true;
      })
      item.itemAdditionDeductions.forEach(addDed=>{
        addDed["internalAddDedId"] = null;
        addDed["entryType"] = 'New';
      })
    }
    if(item.pricing.splitFormData && item.pricing.splitFormData.length > 0){
      item.pricing.splitFormData.forEach(split => {
        delete split.contractDraftId
        delete split.internalContractRefNo
        delete split.internalContractItemRefNo
        delete split._id
      });
    }
    if(item.contractItemValuationDTO && item.contractItemValuationDTO.internalItemValuationId){
      delete item.contractItemValuationDTO.internalItemValuationId
    }
    return item;
  }

  transformPricingData(currentItem) {
    let pricingFields = [
      'payInCurId',
      'earliestBy',
      'priceLastFixDayBasedOn',
      'optionsToFix',
      'fixationMethod',
      'priceContractDefId'
    ];
    pricingFields.forEach(ele => {
      if (currentItem.hasOwnProperty(ele)) {
        currentItem.pricing ? null : currentItem.pricing = {}
        currentItem.pricing[ele] = currentItem[ele];
        delete currentItem[ele];
      }
    });
    return currentItem;
  }

  getUserContext(){
    return this.http.get(Urls.USER_CONTEXT, httpOptions);
  }

  getRecommendationsGeneralDeatils(traderId) {
    let loginInuserId = sessionStorage.getItem('userID') || sessionStorage.getItem('userId')
    let keyData = {
      traderUserId : traderId,
      userId : loginInuserId
    };
    var workFlowConfigBody = 
    {
      "appId": "5d907cd2-7785-4d34-bcda-aa84b2158415",
      "workFlowTask": 'recommendation',
      "apiBody": keyData
    };
    return this.http.post(Urls.RECOMMENDATION_GENERAL_DEATAILS, workFlowConfigBody)
  }

  getRecommendationsItemDetails(fields) {
    let loginInuserId = sessionStorage.getItem('userID') || sessionStorage.getItem('userId')
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-RefId': '5d907cd2-7785-4d34-bcda-aa84b2158415',
        'X-ObjectName': 'contract'
      })
    };
    // let data = {
    //   ...fields,
    //   userId : loginInuserId
    // };
    var workFlowConfigBody = 
    {
      "appId": "5d907cd2-7785-4d34-bcda-aa84b2158415",
      "workFlowTask": 'recommendation',
      //"apiBody": data
      ...fields
    };
    return this.http.post(Urls.RECOMMENDATION_ITEM_DETAILS, workFlowConfigBody, httpOptions);
  }

  getTextToContract(txt, fields) {
    const httpOptions = {
      headers: new HttpHeaders({
        'appId': 'physicals'
      })
    };

    return this.http
      .get(Urls.TEXT_TO_FORM + txt, httpOptions)
      .pipe(
        map((res: any) => {
          let textToContract = { itemDetails: [{}] };
          if (res.status === 'buy') {
            textToContract['contractType'] = 'P';
          } else {
            textToContract['contractType'] = 'S';
          }
          if (res.tradername[0]) {
            let _tradername = res.tradername[0].toUpperCase();
            textToContract['traderUserId'] = fields[
              'traderUserId'
            ].options.find(ele => {
              let _temp = ele.value.toUpperCase();
              return _temp == _tradername;
            }).key;
          }
          if (res.dealtype[0]) {
            let _dealtype = res.dealtype[0].toUpperCase();
            textToContract['dealtype'] = fields['dealtype'].options.find(
              ele => {
                let _temp = ele.value.toUpperCase();
                return _temp == _dealtype;
              }
            ).key;
          }
          if (res.incoterm[0]) {
            let _incoterm = res.incoterm[0].toUpperCase();
            textToContract['incotermId'] = fields['incotermId'].options.find(
              ele => {
                let _temp = ele.value.toUpperCase();
                return _temp == _incoterm;
              }
            ).key;
          }
          if (res.cpname[0]) {
            let _cpProfileId = res.cpname[0].toUpperCase();
            textToContract['cpProfileId'] = fields['cpProfileId'].options.find(
              ele => {
                let _temp = ele.value.toUpperCase();
                return _temp == _cpProfileId;
              }
            ).key;
          }
          if (res.date[0]) {
            let month = moment()
              .month(res.date[1])
              .format('MM');
            let dateArr = res.date[0].split(' ');
            dateArr[1] = month;
            let _date = dateArr.join('-');
            textToContract.itemDetails[0][
              'deliveryFromDate'
            ] = this.us.getMyDatePickerDate(dateArr.join('-'));
          }
          if (res.date1[0]) {
            let month = moment()
              .month(res.date1[1])
              .format('MM');
            let dateArr = res.date1[0].split(' ');
            dateArr[1] = month;
            textToContract.itemDetails[0][
              'deliveryToDate'
            ] = this.us.getMyDatePickerDate(dateArr.join('-'));
          }
          if (res.location[0]) {
            textToContract.itemDetails[0]['destinationCountryId'] = fields[
              'destinationCountryId'
            ].options.find(ele => {
              let _temp = ele.value.toUpperCase();
              return _temp == res.location.toUpperCase();
            }).key;
          }
          // if(res.location1[0]){
          //   textToContract.itemDetails[0]['destinationCityId'] = fields['destinationCityId'].options.find(ele=>{
          //     return ele.value.toUpperCase() == res.location1.toUpperCase();;
          //   }).key;
          // }
          if (res.paymentterm[0]) {
            let _paymentterm = res.paymentterm[0].toUpperCase();
            textToContract['paymentTermId'] = fields[
              'paymentTermId'
            ].options.find(ele => {
              let _temp = ele.value.toUpperCase();
              return _temp == _paymentterm;
            }).key;
          }
          if (res.product[0]) {
            textToContract.itemDetails[0]['productId'] = fields[
              'productId'
            ].options.find(ele => {
              let _temp = ele.value.toUpperCase();
              return _temp == res.product[0].toUpperCase();
            }).key;
          }
          if (res.product[0]) {
            textToContract.itemDetails[0]['quality'] = fields[
              'quality'
            ].options.find(ele => {
              let _temp = ele.value.toUpperCase();
              return _temp == res.product[0].toUpperCase();
            }).key;
          }
          if (res.tol[0]) {
            textToContract.itemDetails[0]['tolerance'] = parseInt(res.tol[0]);
            textToContract.itemDetails[0]['toleranceType'] = 'Percentage';
            if (res.status === 'buy') {
              textToContract.itemDetails[0]['toleranceType'] = 'Seller';
            } else {
              textToContract.itemDetails[0]['toleranceType'] = 'Buyer';
            }
          }
          if (res.quantity[0]) {
            textToContract.itemDetails[0]['itemQty'] = parseInt(
              res.quantity[0]
            );
          }
          if (res.unit[0]) {
            if (res.unit[0] !== 'days') {
              let unitArr = res.unit[0].split(' ');
              let unit = unitArr[0].charAt(0) + unitArr[1].charAt(0);
              textToContract.itemDetails[0]['itemQtyUnitId'] = fields[
                'itemQtyUnitId'
              ].options.find(ele => {
                return ele.value.toUpperCase() == unit.toUpperCase();
              }).key;
            }
          }
          return textToContract;
        })
      );
  }
  emailSend(body){
    const httpOptions = {
      headers: new HttpHeaders({
      "Content-Type":"application/json"
      })
    };
    let url = `/workflow`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      id: "",
      "workflowTaskName": 'mailContract',
      task: "mailContract",
      output: {
        "mailContract":body
        }
      }
    
    return this.http
    .post(url, workflowtask, httpOptions)
  }

  getTieredData(internalContractRefNo){
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'getTieredList'
    }
    let url = `/workflow/data`;
    url = url + '?internalContractRefNo=' + internalContractRefNo
    return this.http.post(url, workflowtask, httpOptions)
  }

  getPhysicalsWorkflowLayout(){
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'physicals_workflow'
    }
    let url = `/workflow/layout`;
    return this.http.post(url, workflowtask, httpOptions)
  }

  getQualityDetails(quality) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'qualityexchange',
      task:"qualityexchange",
      output: {
        qualityexchange: { "qualityId": quality }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody);
  }

  checkIfSplitPriceContract(contract){
    return contract.itemDetails.some((item)=>(item.pricing.pricingStrategy === 'pricingStrategy-002' || item.pricing.pricingStrategy === 'pricingStrategy-003'))
  }

  checkIfSplitsAreMissing(contract){
    return contract.itemDetails.some((item)=>{
      if(item.pricing.pricingStrategy === 'pricingStrategy-002' || item.pricing.pricingStrategy === 'pricingStrategy-003'){
        return (!item.pricing.splitFormData || item.pricing.splitFormData.length === 0)
      }
    })
  }

  getConversionFactor(payload){
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'conversionFactor',
      task:"conversionFactor",
      output: {
        conversionFactor: payload 
      }
    }
    return this.http.post('/workflow',workFlowConfigBody);
  }

}
