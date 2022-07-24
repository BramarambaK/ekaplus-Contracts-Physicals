import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { Urls } from '../../urls';
import { catchError, tap } from 'rxjs/operators';
import { ContractService } from '../contract-service/contract-service.service';
import { UtilService } from '../../utils/util.service';
import { EnvConfig } from '@eka-framework/core';
import { ApplicationService } from '@app/views/application/application.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  workFlowConfigBody : any = {
    workFlowTask: 'mdm_api',
    payLoadData: ''
  }

  constructor(private us:UtilService, private http: HttpClient, private cs: ContractService) {}

  handleError(errMsg = 'request failed') {
    return catchError(e => {
      this.cs.reqFailedObs.observers = this.cs.reqFailedObs.observers.slice(-1);
      this.cs.reqFailedObs.next(errMsg);
      return of('error');
    });
  }

  getMdm() {
    let data = [
      {
        serviceKey: 'carryChargeRateTypeList'
      },
      {
        serviceKey: 'cpPersonInCharge'
      },
      {
        serviceKey: 'corporateLevelTemplateList'
      },
      {
        serviceKey: 'PortOperations'
      },
      {
        serviceKey: 'variableInterestCurve'
      },
      {
        serviceKey: 'LatePaymentInt'
      },
      {
        serviceKey: 'corporateStrategy'
      },
      {
        serviceKey: 'physicalproductquantitylist'
      },
      {
        serviceKey: 'productCurrencyList'
      },
      {
        serviceKey: 'Tolerance'
      },
      {
        serviceKey: 'AbsolutePercentage'
      },
      {
        serviceKey: 'countriesComboDataFromDB'
      },
      {
        serviceKey: 'priceUnitsByCurrency'
      },
      {
        serviceKey: 'CostType'
      },
      {
        serviceKey: 'costComponent',
        dependsOn: ['SECONDARY_COST', 'CONTRACT']
      },
      {
        serviceKey: 'corporateStrategy'
      },
      {
        serviceKey: 'incoterm'
      },
      {
        serviceKey: 'ticketModeOfTransport'
      },
      {
        serviceKey: 'CarryChargeFrequencyId'
      },
      {
        serviceKey: 'productpricetypelist'
      },
      {
        serviceKey: 'userListByRole',
        dependsOn: ['trader']
      },
      {
        serviceKey: 'qualityComboDropDrown'
      },
      {
        serviceKey: 'productComboDropDrown'
      },
      {
        serviceKey: 'dealType',
        dependsOn: ['DealType']
      },
      {
        serviceKey: 'paytermlist_phy'
      },
      {
        serviceKey: 'applicableLaw'
      },
      {
        serviceKey: 'ContractRulesAndArbitrationList'
      },
      {
        serviceKey: 'businesspartnercontactperson',
        dependsOn: ["ALL"]
      },
      {
        serviceKey: 'allDistinctPriceUnits'
      },
      {
        serviceKey: "PriceFixLatestBy"
      },
      {
        serviceKey: "PriceFixBy"
      },
      {
        serviceKey: "FixationMethod"
      },
      {
        serviceKey: "estimateFor"
      },
      {
        serviceKey: "CostRateType"
      },
      {
        serviceKey: "CostIncExp"
      },
      {
        serviceKey: "taxScheduleCountrystate"
      },
      {
        serviceKey: "pricingStrategy"
      },
      {
        serviceKey: "dailyMonthly"
      },
      {
        serviceKey: "defineActualsEventType"
      },
      {
        serviceKey: "holidayRuleOil"
      },
      {
        serviceKey: "currencylist"
      },
      {
        serviceKey: "legalEntityList"
      }
    ];
    
    this.workFlowConfigBody.appId = EnvConfig.vars.app_uuid;
    this.workFlowConfigBody.data = data;

    return this.http.post(Urls.MDM_URL, this.workFlowConfigBody).pipe(this.handleError('Failed to get mdm data'));
  }

  mapMdmFields(mdmFields, formData) {
    let formFields = formData.fields;
    let mapping = {
      // General details
      corporateLevelTemplateList: 'templateId',
      dealType: 'dealType',
      // "contractType":"contractType",
      userListByRole: 'traderUserId',
      businessPartnerCombo: 'cpProfileId',
      paytermlist_phy: 'paymentTermId',
      applicableLaw: 'applicableLawId',
      ContractRulesAndArbitrationList: 'arbitrationId',
      incoterm: 'incotermId',
      businesspartnercontactperson: 'agentProfileId',
      brokerPersonInCharge: 'agentPersonInCharge',
      allDistinctPriceUnits: 'agentCommPriceUnitId',
      cpPersonInCharge: 'cpPersonInCharge',

      // Item details
      productComboDropDrown: 'productId',
      AbsolutePercentage: 'toleranceType',
      Tolerance: 'toleranceLevel',
      productCurrencyList: 'payInCurId',

      //new price types
      PriceFixLatestBy: 'priceLastFixDayBasedOn',
      PriceFixBy: 'optionsToFix',
      FixationMethod: 'fixationMethod',
      ticketModeOfTransport: 'shipmentMode',
      countriesComboDataFromDB: 'originationCountryId',
      userProfitCenterList: 'profitCenterId',
      corporateStrategy: 'strategyAccId',
      costComponent: 'costComponent',
      CostType: 'costType',
  

      PortOperations: 'qualityFinalizationPoint',
      LatePaymentInt: 'interestRateType',
      variableInterestCurve: 'latePaymentInterestRate',
      CarryChargeFrequencyId: 'frequency',
      estimateFor: 'estimateFor',
      CostRateType: 'rateType',
      CostIncExp: 'incExpense',

      taxScheduleCountrystate:'taxScheduleCountryId',
      pricingStrategy: 'pricingStrategy',
      //"":"optionLoad",
      //"":"optionDischarge",
      phyPackingtypesizeByCItemOrProductList: 'packingTypeId',
      dailyMonthly : 'dailyMonthly',
      defineActualsEventType: 'customEvent',
      holidayRuleOil: 'holidayRule',
      physicalproductquantitylist: 'totalQtyUnitId',
      legalEntityList: 'legalEntityId'
    };

    let mdmKeys = Object.keys(mapping);
    let formFieldKeys = Object.values(mapping);
    let len = mdmKeys.length;
    for (let i = 0; i < len; i++) {
      let mdmKey = mdmKeys[i];
      let fieldKey = formFieldKeys[i];
      if(formFields[fieldKey]){
        formFields[fieldKey].options = mdmFields[mdmKey];
      }else{
        console.log(fieldKey+ 'not present in object field list');
      }
    }
    formFields['destinationCountryId'].options = mdmFields['countriesComboDataFromDB'];
    formFields['weightFinalizationPoint'].options = mdmFields['PortOperations'];
    formFields['payInCurId'].options = mdmFields['productCurrencyList'];
    formFields['costUnitCurrency'].options = mdmFields['currencylist'];
    formFields['costUnitRate'].options = mdmFields['allDistinctPriceUnits'];
    formFields['differentialPriceUnit'].options = mdmFields['allDistinctPriceUnits'];
    formFields['provisionalPaymentTermId'].options = mdmFields['paytermlist_phy'];
    formFields['valuationIncotermId'].options = mdmFields['incoterm'];
    formFields['valuationCountryId'].options = mdmFields['countriesComboDataFromDB'];
    formData.fields = formFields;
    return formData;
  }

  getCityData(countryId, type) {
    const postData = [
      {
        serviceKey: 'cityComboDataFromDB',
        dependsOn: [countryId, type]
      }
    ];
    this.workFlowConfigBody.data = postData;
    return this.http.post(Urls.MDM_URL, this.workFlowConfigBody).pipe(this.handleError('Failed to get city combo data'));
  }

  getMultipleMdmData(postData) {
    this.workFlowConfigBody.data = postData;
    return this.http.post(Urls.MDM_URL, this.workFlowConfigBody).pipe(this.handleError('Failed to get mdm data'));
  }

  getComboKeys(serviceKey, dependsOn) {
    const postData = [
      {
        serviceKey: serviceKey,
        dependsOn: dependsOn
      }
    ];
    this.workFlowConfigBody.appId = "5d907cd2-7785-4d34-bcda-aa84b2158415";
    this.workFlowConfigBody.data = postData;
    return this.http.post(Urls.MDM_URL, this.workFlowConfigBody).pipe(this.handleError('Failed to get mdm data'));
  }

  getQualitySpec(id,x= 'mdm_quality') {
    let url = `/workflow/data`;
    var  httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token'
      })
    };
    let workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workflowTaskName: x,
      task: x,
      output: {
        [x]: {id:id}
      }
    }
    return this.http
    .post(url, workflowtask, httpOptions)
  }
  getDocumentType() {
    const data = [
      {
        serviceKey: 'listOfDocumentNameByDocumentSetName'
      }
    ];
    this.workFlowConfigBody.data = data;
    return this.http.post(Urls.MDM_URL, this.workFlowConfigBody);
  }

  getMdmForAdditionDeduction(product, fields, priceUnit){
    const data = [
      {
        "serviceKey": "addDedNameList",
        "dependsOn" : [product]
      },
      {
        "serviceKey": "addDed",
      },
      {
        "serviceKey": "rateTypePrice",
      },
      {
        "serviceKey": "weightBasisForAddDedForItem",
        "dependsOn" : [product]
      },
      {
        "serviceKey": "priceUnitsForContractPrice",
        "dependsOn" : [product,priceUnit]
      }
    ];
    const mapping = {
      "addDedNameList" : "addDedNameId",
      "addDed" : "addDedType",
      "rateTypePrice" : "rateTypePrice",
      "weightBasisForAddDedForItem" : "weightBasisId",
      "priceUnitsForContractPrice" : "costPriceUnitId"
    }
    this.workFlowConfigBody.data = data;
    return this.http.post(Urls.MDM_URL, this.workFlowConfigBody).pipe(
      tap((res:any)=>{
         Object.keys(res).forEach(serviceKey=>{
           let field = mapping[serviceKey];
           if(field){
             fields[field].options = res[serviceKey];
           }
         })
      })
    )
  }

  updatecontracts(data){
    let url = `/workflow`;
    return this.http
    .post(url, data, this.workFlowConfigBody)
  }

  getInterCompanyMDM(dealType, postData, interCompanyTargetCpName) {
    this.workFlowConfigBody.appId = "5d907cd2-7785-4d34-bcda-aa84b2158415";
    this.workFlowConfigBody.data = postData;
    var  httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Corporate-Name': interCompanyTargetCpName
      })
    };
    if(dealType === 'Inter_Company'){
      return this.http.post(Urls.MDM_URL, this.workFlowConfigBody, httpOptions).pipe(this.handleError('Failed to get mdm data'));
    }else{
      return this.http.post(Urls.MDM_URL, this.workFlowConfigBody).pipe(this.handleError('Failed to get mdm data'));
    }
  }

  getPriceUnitDecimal(productId){
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'productPriceUnitAttributes',
      task:"productPriceUnitAttributes",
      output: {
        productPriceUnitAttributes: { "productId": productId }
      }
    }
    //return this.http.post('/workflow',workFlowConfigBody).pipe(this.cs.handleError('Failed to fetch productPriceUnitAttributes'));
    return of(5);
  }

  getProductBaseQtyUnitId(productId){
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'productBaseQtyUnitId',
      task:"productBaseQtyUnitId",
      output: {
        productBaseQtyUnitId: { "productId": productId }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody).pipe(this.cs.handleError('Failed to fetch productPriceUnitAttributes'));
  }

}
