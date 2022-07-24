import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Urls } from '../../urls';
import { map, mergeMap, catchError, defaultIfEmpty, concatMap } from 'rxjs/operators';
import { of, throwError, BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { MasterDataService } from '../create-contract/master-data.service';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class ComponentService {
 
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'my-auth-token'
    })
  };
  // private _checktiered = new BehaviorSubject(false);
  // checktiered$: Observable<Boolean>;

  // private _checkGmr = new BehaviorSubject(false);
  // checkGmr$: Observable<Boolean>;
  
  // setCheckGmr(flag) {
  //   this._checkGmr.next(flag);
  // }

  // setChecktiered(flag) {
  //   this._checktiered.next(flag);
  // }
 
  constructor( private mdm: MasterDataService, private http: HttpClient
          ) { 
            // this.checktiered$ = this._checktiered.asObservable();
            // this.checkGmr$ = this._checkGmr.asObservable();
          }

  updateComponent(contract,response,itemindex){
   this.getComponent(contract).subscribe((result:any)=>{
      var contractRefNo = response.data.contractDetails.internalContractRefNo
      var internalItemRefNo = response.data.contractDetails['itemDetails'][itemindex].internalItemRefNo
      var payload = result.data
      for(var i = 0 ; i<result.data.length ; i++){
        payload[i].internalContractRefNo = contractRefNo
        payload[i].internalContractItemRefNo = internalItemRefNo
      }
      this.savecomponentwithitemdetails(payload).subscribe((res:any)=>{})
   })
  }
  updateComponentMultiple(response){
    this.getComponent(response.data.contractDetails).subscribe((result:any)=>{
      var contractRefNo = response.data.contractDetails.internalContractRefNo
      var payload = result.data
      for(var i = 0 ; i<result.data.length ; i++){
        payload[i].internalContractRefNo = contractRefNo
        for(var j = 0 ; j<response.data.contractDetails['itemDetails'].length ; j++)
        if(String(payload[i].itemNo) === String(response.data.contractDetails['itemDetails'][j].itemNo))
        payload[i].internalContractItemRefNo = response.data.contractDetails['itemDetails'][j].internalItemRefNo
      }
      this.savecomponentwithitemdetails(payload).subscribe((res:any)=>{})
   })
  }
  savecomponentwithitemdetails(data){
    let url = `/workflow`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workflowTaskName: 'Component_save',
      task: 'Component_save',
      output: {
       'Component_save': data
      }
    }
    return this.http
    .post(url, workflowtask, this.httpOptions)
  }
  getComponent(contractDetails) {
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'component_list'
    }
    let url = `/workflow/data`;
    url = url + '?componentDraftId=' +contractDetails._id
    return this.http.post(url, workflowtask, this.httpOptions)
  }

  getComponentFromSetup(productId){
    let url = `/workflow/data`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'mdm_component',
      payLoadData:{'productId':productId}
    }
    return this.http
    .post(url, workflowtask, this.httpOptions)
  }

  getTieredDataBasedonDraftId(contractDetails) {
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'getTieredList'
    }
    let url = `/workflow/data`;
    url = url + '?contractDraftId=' +contractDetails._id
    return this.http.post(url, workflowtask, this.httpOptions)
  }

  getTieredData(internalContractRefNo){
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'getTieredList'
    }
    let url = `/workflow/data`;
    url = url + '?internalContractRefNo=' + internalContractRefNo
    return this.http.post(url, workflowtask, this.httpOptions)
  }

  saveSplitsWithNewDraftId(contractData, id){
    let allContractSplits = [];
    for(let i=0; i<contractData.itemDetails.length; i++){
      if(_.has(contractData, ['itemDetails',i,'pricing','splitFormData',0])){
        let splits = contractData.itemDetails[i].pricing.splitFormData;
        allContractSplits = allContractSplits.concat(splits);
      }
    }
    allContractSplits.forEach(split=>split['contractDraftId'] = id);
    return this.saveTieredPriceSplits('Tiered_Pricing_Save',allContractSplits);
  }

  updateSplitsWithContractItemRefs(contract){
    if(contract.itemDetails.some((item)=>(item.pricing.pricingStrategy === 'pricingStrategy-002' || item.pricing.pricingStrategy === 'pricingStrategy-003'))){
      let workflowtask =  {
        appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
        workflowTaskName: 'Tiered_Pricing_edit',
        task: 'Tiered_Pricing_edit',
        output: {
        'Tiered_Pricing_edit': []
        }
      } 
      let url = `/workflow`;
      return this.getTieredDataBasedonDraftId(contract).pipe(concatMap((result:any)=>{
        let tieredData = result.data;
        let itemDetails = contract['itemDetails'];
        for(let j=0;j<itemDetails.length; j++){
          for(let i=0;i<tieredData.length;i++){
            if(tieredData[i]["itemNumber"] == itemDetails[j]["itemNo"] && !tieredData[i]['internalContractItemRefNo']){
              tieredData[i]['internalContractRefNo'] = contract.internalContractRefNo;
              tieredData[i]['internalContractItemRefNo'] = contract.itemDetails[j].internalItemRefNo;
              if(tieredData[i] && tieredData[i]._id){
                workflowtask.output.Tiered_Pricing_edit.push(tieredData[i]);
              } 
            }  
          } 
        }
        if(workflowtask.output.Tiered_Pricing_edit.length>0){
          return this.http.post(url, workflowtask, this.httpOptions)
        }else{
          return of([])
        }
      }))
    }else{
      return of([])
    }
  }

  splitDataCURD(contractdata, appObject, action){

    let editObject =[];
    let createObject=[];
    let deleteObject=[];
    let workflowtask:any;
    let url = `/workflow`;

    if(Array.isArray(contractdata['itemDetails'])){
      let itemDetails:any = contractdata['itemDetails'];
      for(let j=0; j < itemDetails.length; j++){
        let splitFormData = itemDetails[j].pricing.splitFormData;
        if(itemDetails[j].pricing && (itemDetails[j].pricing.pricingStrategy === 'pricingStrategy-002' ||itemDetails[j].pricing.pricingStrategy === 'pricingStrategy-003') && splitFormData && splitFormData.length>0){
          for(let i=0;i<splitFormData.length;i++){
           if(splitFormData[i] && splitFormData[i]._id){
              if(splitFormData[i]["ui_action"]==="edit"){
               editObject.push(splitFormData[i])
              }else if(splitFormData[i]["ui_action"]==="delete"){
                deleteObject.push(splitFormData[i])
              }
           }else if(splitFormData[i] && !splitFormData[i]._id){
              splitFormData[i]["contractDraftId"] = contractdata._id;
              if(appObject === 'contract' && action === 'edit'){
                splitFormData[i]['internalContractRefNo'] = contractdata.internalContractRefNo;
                splitFormData[i]['internalContractItemRefNo'] = itemDetails[j].internalItemRefNo;
              }
              createObject.push(splitFormData[i]);
            }
          } 
        }
      }
    }
    
    let splitObs = []
    if(createObject.length>0){
      splitObs = splitObs.concat(this.saveTieredPriceSplits('Tiered_Pricing_Save',createObject));
    }
    if(editObject.length>0){
      splitObs = splitObs.concat(this.saveTieredPriceSplits('Tiered_Pricing_edit',editObject));
    }
    if(deleteObject.length>0){
      splitObs = splitObs.concat(this.saveTieredPriceSplits('Tiered_Pricing_delete',deleteObject));
    }

    if(splitObs.length>0){
      return forkJoin(splitObs)
    }else{
      return of([])
    }
   
  }

  saveTieredPriceSplits(taskId, splits){
    let url = `/workflow`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workflowTaskName: taskId,
      task: taskId,
      output: {
       [taskId] : splits
      }
    }
    return this.http
    .post(url, workflowtask, this.httpOptions)
  }

  updateSplitFormData(contract, tieredData){
    let itemDetails = contract.itemDetails;
    for(let j=0;j<itemDetails.length; j++){
      for(let i=0;i<tieredData.length;i++){
        if(tieredData[i]["itemNumber"] == itemDetails[j]["itemNo"]){
          let splitFormData = contract.itemDetails[j].pricing.splitFormData;
          for(let k=0; k<splitFormData.length; k++){
            if(splitFormData[k].splitId == tieredData[i].splitId){
              contract.itemDetails[j].pricing.splitFormData[k] = tieredData[i];
            }
          }
        }  
      } 
    }
    return contract;
  }

  deleteItemSplits(itemSplits){
    let workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workflowTaskName: 'Tiered_Pricing_delete',
      task: 'Tiered_Pricing_delete',
      output: {
        'Tiered_Pricing_delete' : []
      }
    } 
    if(itemSplits.length>0){
      workflowtask.output.Tiered_Pricing_delete = itemSplits;
      return this.http.post('/workflow', workflowtask, this.httpOptions)
    }else{
      return of([]);
    }
  }

  getGmrDetailsofContract(contractDetails){
    let url = `/workflow/data`;
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'call_contract_gmr',
      payLoadData: {
        'contractDetails':contractDetails
      } 
    }
    return this.http
    .post(url, workflowtask, this.httpOptions)
    // let url = `/contract/gmr/` + internalContractItemRefNo;
    // return this.http.get(url,this.httpOptions)
  }

  cloneComponent(id,index,totallength){
    this.getComponentForClone(id,index).subscribe((result:any)=>{
      let payLoad = result.data
      for(var i = 0 ; i<result.data.length ; i++){
        payLoad[i].itemNo = String(totallength)
      }
      
      this.savecomponentwithitemdetails(payLoad).subscribe((res:any)=>{})
   })

  }

  getComponentForClone(id,index) {
    var workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workFlowTask: 'component_list',
      "filterData": {
        "filter": [
          {
            "fieldName": "componentDraftId",
            "value": [id],
            "operator": "in"
          },
        {
        "fieldName": "itemNo",
            "value": [String(index)],
            "operator": "in"
        }
        ]
      }
    }
    let url = `/workflow/data`;
    return this.http.post(url, workflowtask, this.httpOptions)
  }

  cloneContractComponent(oldId,newId){
    let _id = {
      _id: oldId
    }
    this.getComponent(_id).subscribe((result:any)=>{
      var payload = result.data
      for(var i = 0 ; i<result.data.length ; i++){
        if( payload[i].gmrRefNo ==='NA')
        payload[i].componentDraftId = newId
      }
      this.savecomponentwithitemdetails(payload).subscribe((res:any)=>{})
   })
  }

  getMdmUnitConversion(data,unit,productId,itemQtyOptions,itemUnit){
    let  workFlowConfigBody : any = {
      appId: "5d907cd2-7785-4d34-bcda-aa84b2158415",
      workFlowTask: 'mdm_api',
      payLoadData: '',
    }
    let url = `/workflow/mdm`;
    let differentQtyUnit = [];
    let differentQtyUnitKey = [];
		
		for(let i=0; i < data.length; i++){
			if(data[i].qtyUnit != unit){
				differentQtyUnit.push(data[i].qtyUnit)
			}
    }
   
    for(let j=0; j < differentQtyUnit.length;j++){
      for(let i=0; i < itemQtyOptions.length; i++){
        if(itemQtyOptions[i].value == differentQtyUnit[j]){
          differentQtyUnitKey.push(itemQtyOptions[i].key);
        }
      }
    }
    let postData = [];
		for(let i=0; i < differentQtyUnitKey.length; i++){
      postData.push({
        "dependsOn": [  
          productId,  
          differentQtyUnitKey[i],
          itemUnit   
        ],
        "serviceKey": "quantityConversionFactor"
      });
    }
    workFlowConfigBody.data = postData;
    return this.http.post(url, workFlowConfigBody); 
  }

  checkContractGMR(internalContractRefNo){
    let workflowData = {
      "filterData":
      {
        "filter": [
          {
            "fieldName": "internalContractRefNo",
            "value": internalContractRefNo,
            "operator": "eq"
          }
        ]
      },
      "appId": "5d907cd2-7785-4d34-bcda-aa84b2158415",
      "workFlowTask": "allContractGMRs"
    };
    return this.http.post(`/workflow/data`, workflowData)
  }

  deleteExposureData(contractRefNo,i){
    let workflowtask = {
      appId: '5d907cd2-7785-4d34-bcda-aa84b2158415',
      workflowTaskName: 'delete_exposure',
      task: 'delete_exposure',
      output: {
        ['delete_exposure']: {
          "filterData": {
            "filter": [
              {
                "fieldName": "itemRefNo",
                "value": `${contractRefNo}.${i}`,
                "operator": "eq"
              }
            ]
          }
        }
        }
    } 
    return this.http.post(`/workflow`, workflowtask, this.httpOptions)
  }

}
