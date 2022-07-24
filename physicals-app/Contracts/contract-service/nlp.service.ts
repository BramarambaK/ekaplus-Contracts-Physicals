import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Urls } from '../../urls';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { MasterDataService } from '../create-contract/master-data.service';
import { PercentService } from '../create-contract/side-bar/side-bar.component';
import { ContractService } from './contract-service.service';

@Injectable({
  providedIn: 'root'
})
export class NLPService {

  itemIndex
  itemNo

  generalFields = [
    "dealType",
    "traderUserId",
    "cpProfileId",
    "paymentTermId",
    "applicableLawId",
    "arbitrationId",
    "incotermId",
    "contractType",
    "totalQtyUnitId"
  ]

  dateFields = [
    "deliveryFromDate",
    "deliveryToDate"
  ]

  numeric = [
    "itemQty",
    "tolerance",
    "priceDf"
  ]

  alpha = [
    "productIdDisplayName",
    "toleranceTypeDisplayName",
    "toleranceLevelDisplayName",
    "payInCurIdDisplayName",
    "priceUnitIdDisplayName",
    "shipmentModeDisplayName",
    "originationCountryIdDisplayName",
    "destinationCountryIdDisplayName",
    "dealTypeDisplayName",
    "traderUserIdDisplayName",
    "contractTypeDisplayName",
    "paymentTermIdDisplayName",
    "applicableLawIdDisplayName",
    "arbitrationIdDisplayName",
    "incotermIdDisplayName",
    "totalQtyUnitIdDisplayName"
  ]

  dependants = [
    "itemQtyUnitIdDisplayName",
    "priceTypeIdDisplayName",
    "cpProfileIdDisplayName"
  ]

  pricingList = [
    'priceDf',
    'payInCurId',
    'priceUnitId',
    'priceTypeId'
  ];

  constructor(private cs: ContractService, private ps: PercentService, private mdm: MasterDataService, private http: HttpClient) { }

  getTextToContract(txt, fields, itemIndex = 0, nlpItemNo = 1) {
    const httpOptions = {
      headers: new HttpHeaders({
        'appId': 'physicals',
        'X-Object': 'contract'
      })
    };

    this.itemIndex = itemIndex;
    this.itemNo = nlpItemNo;

    var workFlowConfigBody = 
    {
        appId: "admin",
        workFlowTask : "nlpApi",
        payLoadData : {
          apitype: "sentence",
          appId: "5d907cd2-7785-4d34-bcda-aa84b2158415",
          object: "e6cdb0cd-0ab3-426f-8a2e-c49544dd1f51",
          sentence: txt
        }
    }

    return this.http.post('/workflow/data', workFlowConfigBody, httpOptions)
      .pipe(
        catchError(e => {
          this.cs.reqFailedObs.observers = this.cs.reqFailedObs.observers.slice(-1);
          this.cs.reqFailedObs.next('NLP server error !');
          return throwError('failed');
        }),
        mergeMap((res:any) => {
          if(res.data){
            let nlpResult = res.data.tags;
            return this.processNLPdata(nlpResult, fields);
          }else if(res.message){
            this.cs.reqFailedObs.next(res.message);
            return throwError(res.message);
          }else{
            return throwError("Inappropriate respose body");
          }
       })
      );
  }

  processNLPdata(nlpResult, fields) {
    let keyMap = { nlpFields: {} };
    let matchedTextValues = {};
    this.numeric.forEach(fieldName => {
      if (nlpResult[fieldName]) {
        keyMap[fieldName] = parseInt(nlpResult[fieldName]);
        keyMap.nlpFields[fieldName] = true;
        matchedTextValues[fieldName] = parseInt(nlpResult[fieldName]);
      }
    })

    // this.dateFields.forEach(fieldName => {
    //   if (nlpResult[fieldName]) {
    //     keyMap[fieldName] = nlpResult[fieldName];
    //     keyMap.nlpFields[fieldName] = true;
    //     matchedTextValues[fieldName] = nlpResult[fieldName];
    //   }
    // })

    let serviceKeyMap = {};
    let mdmApiData = [];
    this.alpha.forEach(fieldName => {
      if (nlpResult[fieldName]) {
        let field = fieldName.replace('DisplayName','');
        if (!fields[field].dependsOn) {
          let option = fields[field].options.find(ele => ele.value.toLowerCase() === nlpResult[fieldName].toLowerCase());
          if(option){
            keyMap[field] = option.key;
            keyMap.nlpFields[field] = true;
            matchedTextValues[field] = nlpResult[fieldName];
          }
        }
      }
    })

    this.dependants.forEach(fieldName => {
      let field = fieldName.replace('DisplayName','');
      if (nlpResult[fieldName] && keyMap[fields[field].dependsOn[0]]) {
        serviceKeyMap[fields[field].serviceKey] = fieldName;
        let fieldMdmData = { serviceKey: fields[field].serviceKey, dependsOn: [] };
        // fields[fieldName].dependsOn.forEach(element => {
        //   fieldMdmData.dependsOn.push(keyMap[element])
        // });
        fieldMdmData.dependsOn.push(keyMap[fields[field].dependsOn[0]])
        mdmApiData.push(fieldMdmData);
      }
    });

    return this.getDependsOnData(nlpResult, mdmApiData, serviceKeyMap, keyMap, matchedTextValues);

  }

  getDependsOnData(nlpResult, mdmApiData, serviceKeyMap, keyMap, matchedTextValues) {
    let contractNlpMap = { itemDetails : [], nlpFields : {} };
    let nlpAutoTrainData = { itemDetails : [] }
    return this.mdm.getMultipleMdmData(mdmApiData).pipe(
      map((mdmRes: any) => {
        Object.entries(serviceKeyMap).forEach((opt: any) => {
          let option = mdmRes[opt[0]].find(ele => ele.value.toLowerCase() === nlpResult[opt[1]].toLowerCase());
          if(option){
            let field = opt[1].replace('DisplayName','');
            keyMap[field] = option.key;
            keyMap.nlpFields[field] = true;
            matchedTextValues[opt[1]] = option.value;
          }
        })
        if (keyMap["priceTypeId"]) {
          keyMap["pricing"] = {};
          matchedTextValues["pricing"] = {};
          this.pricingList.forEach(pricingField => {
            if (keyMap[pricingField]) {
              keyMap.pricing[pricingField] = keyMap[pricingField];
              delete keyMap[pricingField];
              keyMap.nlpFields[pricingField] = true;
              matchedTextValues.pricing[pricingField] = matchedTextValues[pricingField];
              delete matchedTextValues[pricingField];
            }
          });
        }
        this.generalFields.forEach(field=>{
          if(keyMap[field]){
            contractNlpMap[field] = keyMap[field];
            delete keyMap[field];
            nlpAutoTrainData[field+"DisplayName"] = matchedTextValues[field];
            delete matchedTextValues[field];
          } 
        })
        contractNlpMap.nlpFields = keyMap.nlpFields;
        contractNlpMap.itemDetails[this.itemIndex] = keyMap;
        contractNlpMap.itemDetails[this.itemIndex]["itemNo"] = this.itemNo;
        nlpAutoTrainData.itemDetails[this.itemIndex] = matchedTextValues;
        nlpAutoTrainData.itemDetails[this.itemIndex]["itemNo"] = this.itemNo;
        contractNlpMap["generalDetailsDisplayValue"] = JSON.stringify(nlpAutoTrainData);
        return contractNlpMap;
      })
    )
  }

}
