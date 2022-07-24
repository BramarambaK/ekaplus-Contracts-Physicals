import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { UtilService } from '../../../utils/util.service';
import { ContractService } from '../../contract-service/contract-service.service';
import { TableService } from '../../contract-service/table.service';

import { ConfirmationService } from 'primeng/api';
import { ApproveContractPopupComponent } from '../approve-contract-popup/approve-contract-popup.component';
import { ItemNoService } from '../../item-no.service';

import { IMyDpOptions } from 'mydatepicker';
import { ContractObjectService } from '../../contract-service/contract-object.service';
import { concatMap, last, tap, timeoutWith } from 'rxjs/operators';
import { PercentService } from '../side-bar/side-bar.component';
import { ComponentService } from '../../component-service/component.service';
import { concat, forkJoin, of } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],

  providers: [ConfirmationService]
})
export class ItemsListComponent implements OnInit {
  FormData;
  appObject;
  fields;
  itemsData;
  headerList1;
  contract;
  action;
  records: any = [];
  columsSelected: any;
  columnLabel: any;
  header1: string[];
  selectedItemNo;
  selectedTableRowIndex;
  apiCalled = false;
  tableLoading = true;
  rowSelected = new Array(1000000).fill(false);

  // data tables variable
  config;
  headerLabel = [];
  headerKeys = [];
  selectedColumns = [];
  filter = false;
  render = true;
  resize = true;
  reorder = true;
  actions = true;
  workflowOutCome = false;
  flag = false;
  sharedData;
  selection;
  isRowAction = false;
  dataBackup;
  splitData:any=[];

  @ViewChild(ApproveContractPopupComponent)
  approvePopup: ApproveContractPopupComponent;
  @ViewChild('confirm') contractPopup;
  @ViewChild('contractDraftPopup') contractDraftPopup;
  @ViewChild('contractCreated') contractCreated;
  @ViewChild('draftCreated') draftCreated;
  @ViewChild('updateContractPopup') updateContractPopup;
  @ViewChild('updateTemplatePopup') updateTemplatePopup;
  @ViewChild('dt')
  private table;
  @ViewChild('reqFailed') reqFailedPopup;
  showWarning: boolean = false;
  showError: boolean = false;
  errorMsg: string = "";
  globalProperties
  dateFormat = 'dd-mmm-yyyy'

  deliveryFromDateOptions: IMyDpOptions = {
    dateFormat: this.dateFormat,
    height: '28px',
    width: '100px'
  };

  disableUntil(date, dateOptions) {
    let disableTillDate = this.subtractOneDay(date);
    let copy = JSON.parse(JSON.stringify(this[dateOptions]));
    copy.disableUntil = disableTillDate;
    this[dateOptions] = copy;
  }

  subtractOneDay(date){
    let _temp = this.us.getMomentDate(date).subtract(1, "days").toObject();
    let disableTillDate = { 'day' : _temp.date, 'month': _temp.months + 1, 'year': _temp.years};
    return disableTillDate;
  }

  internalContractRef
  navigationId
  selectedData: any;
  tieredData:any=[];
  gmrDetails:any = [];
  gmrExistsForSelectedItem:any = false;

  secondLegContractDetails
  originalItemQty

  constructor(
    private confirmationService: ConfirmationService,
    private componentService:ComponentService,
    private cs: ContractService,
    private us: UtilService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private tableService: TableService,
    private itemNoService: ItemNoService,
    private cos: ContractObjectService,
    private ps: PercentService
  ) {

    this.cs.reqFailedObs.subscribe(err => {
      this.apiCalled = false;
      this.reqFailedPopup.open(err);
    });

    this.FormData = this.route.snapshot.parent.data.FormData;
    this.appObject = this.FormData.appObject;
    this.action = this.FormData.action;
    this.fields = this.FormData.fields;
    this.contractId = this.route.snapshot.params.id;
    if (this.action === 'create' || this.action === 'clone') {
      this.navigationId = this.contractId;
      this.getContract();
    } else {
      this.internalContractRef = this.FormData.id;
      this.navigationId = this.internalContractRef;
      let getContractObs
      switch (this.appObject) {
        case 'contract':
          getContractObs = this.cs.getSavedContract(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contract = data;
            this.getDisplayValues(data);
          });
          break;
        case 'template':
          getContractObs = this.cs.getTemplateData(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe(data => {
            this.contract = data;
            this.getDisplayValues(data);
          });
          break;
        case 'draft':
          getContractObs = this.cs.getDraftContract(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contract = data;
            this.getDisplayValues(data);
          });
          break;
      }
    }

    this.cs.getPhysicalsWorkflowLayout().subscribe((layout:any)=>{
      if(layout && layout.properties){
        this.globalProperties = layout['properties'];
        //this.dateFormat = this.globalProperties['date_format'].toLowerCase();
      }
    })
  }
  header = [];
  nt_headerList;
  dataList;
  contractId;
  frozenCols;
  
  ngOnInit() {
    this.headerList1 = this.fields.itemListTable.headers;
  }

  getContract() {
    this.cos.onLoadGetContractObject(this.contractId, this.action)
      .pipe(
        tap(contractObj => {
          this.contract = contractObj;
          this.contract.itemDetails = contractObj.itemDetails.sort((a, b) => {
            return a.itemNo - b.itemNo;
          });
          this.getDisplayValues(this.contract);
        })
      ).subscribe();
  }

  addDependsOnToSameLevel(contract) {
    let contractcopy = JSON.parse(JSON.stringify(contract));
    contractcopy.itemDetails.forEach(item => {
      item["traderUserId"] = this.contract.traderUserId;
      item["incotermId"] = this.contract.incotermId;
    });
    return contractcopy;
  }

  checkSplitPricing(){
    if(this.cs.checkIfSplitPriceContract(this.contract)){
      if(this.cs.checkIfSplitsAreMissing(this.contract)){
        if(this.internalContractRef && this.appObject === 'contract'){
          this.componentService.getTieredData(this.internalContractRef).subscribe((res:any)=>{
            this.initializeSplits(res);
          });
        }else{
          this.componentService.getTieredDataBasedonDraftId(this.contract).subscribe((res:any)=>{
            this.initializeSplits(res);
          })
        }
      }
    }
  }

  initializeSplits(res){
    for(let i=0; i < res.data.length; i++){
      for(let j=0; j < this.contract.itemDetails.length; j++){
        if(res.data[i].itemNumber == this.contract.itemDetails[j].itemNo){
          if(!this.contract.itemDetails[j].pricing.splitFormData){
            this.contract.itemDetails[j].pricing.splitFormData = []; 
          }
          this.contract.itemDetails[j].pricing.splitFormData.push(res.data[i]);
        }
      }
    }	
    this.cos.changeCurrentContractObject(this.contract);
  }

  getDisplayValues(contractData) {
    this.checkSplitPricing();
    this.onEditDisableFields();
    this.ps.generalDetailsFillPercentage(contractData);
    if (contractData.issueDate) {
      this.disableUntil(contractData.issueDate, 'deliveryFromDateOptions');
    }
    this.originalItemQty = contractData.itemDetails.map(item=>item.itemQty);
    this.addDisplayValues(contractData.itemDetails, true)
    let preparedData: any = this.addDependsOnToSameLevel(contractData);
    console.log(preparedData.itemDetails);
    this.cs.getItemsListDisplayValues(preparedData.itemDetails)
    .subscribe((data:any) => {
      this.addDisplayValues(data, false);
    });
  }

  addDisplayValues(items, initialLoad){
    let itemsToDisplay = items.filter(ele=>ele.isDeleted !== 'true')
    itemsToDisplay.forEach((item, index, arr) => {
      let displayValues = JSON.parse(this.contract.itemDetails[index].itemDisplayValue);
      console.log(displayValues);
      arr[index] = { ...item, ...displayValues, ...item.pricing  }
    });
    console.log(itemsToDisplay);
    this.loadItems(itemsToDisplay, initialLoad);
  }

  getMin(i, itemsData) {
    let minvalue;
    let itmQty = parseFloat(itemsData[i].itemQty);
    if(itemsData[i].hasOwnProperty('toleranceMin') && itemsData[i].toleranceMin !== null){
      let toleranceMin = parseFloat(itemsData[i].toleranceMin);
      if (itemsData[i].toleranceType === "Percentage") {
        minvalue = itmQty * ((100 - toleranceMin) / 100);
      } else {
        minvalue = toleranceMin;
      }
    }else{
      let tolerance = parseFloat(itemsData[i].tolerance);
      if (itemsData[i].toleranceType === "Percentage") {
        minvalue = itmQty * ((100 - tolerance) / 100);
      } else {
        minvalue = tolerance;
      }
    }
    return minvalue.toFixed(5);
  }

  getMax(i, itemsData) {
    let maxvalue;
    let itmQty = parseFloat(itemsData[i].itemQty);
    if(itemsData[i].hasOwnProperty('toleranceMax') && itemsData[i].toleranceMax !== null){
      let toleranceMax = parseFloat(itemsData[i].toleranceMax);
      if (itemsData[i].toleranceType === "Percentage") {
        maxvalue = itmQty * ((100 + toleranceMax) / 100);
      } else {
        maxvalue = toleranceMax;
      }
    }else{
      let tolerance = parseFloat(itemsData[i].tolerance);
      if (itemsData[i].toleranceType === "Percentage") {
        maxvalue = itmQty * ((100 + tolerance) / 100);
      } else {
        maxvalue = tolerance;
      }
    }
    return maxvalue.toFixed(5);
  }

  onChange(selected) {
    //selected = selected[0];
  }

  loadItems(data, initialLoad) {

    let displayColumns = ["itemNo", "productId", "quality", "itemQty", "deliveryPeriod", "openQty", "tolerance", "minQty", "maxQty", "priceTypeId", "pricingStrategy", "formulaName", "profitCenterId", "loadingLocationGroupTypeId", "destinationLocationGroupTypeId", "inspectionCompany", "paymentDueDate", "shipmentMode", "strategyAccId", "totalPrice", "cpContractItemId", "ticketNumber"];
    let displayColumnsSize = ["60", "80", "115", "130", "130", "240", "100", "130", "80", "80", "130", "130", "160", "120", "230", "230", "160", "120", "120", "160", "140", "140", "300"]
    let displayValueColumns = ["itemNo", "productId", "quality", "itemQtyUnitId", "tolerance", "toleranceType", "originationCountryId", "originationCityId", "destinationCountryId", "destinationCityId", "inspectionCompany", "shipmentMode", "strategyAccId", "profitCenterId", "loadingLocationGroupTypeId", "destinationLocationGroupTypeId", "priceTypeId", "pricingStrategy", "formulaName", "totalPrice", "cpContractItemId", "ticketNumber"];
    let dateColumns = ["deliveryFromDate", "deliveryToDate", "paymentDueDate"];
    this.frozenCols = [];
    this.itemsData = data;
    let numItems = data.length;

    this.loadFormulaNames();

    for (let i = 0; i < numItems; i++) {
      if(!this.records[i]){
        this.records[i] = {};
      }
   
      displayValueColumns.forEach(col => {
        let colDisplayProp = col + ".displayText";
        let colDisplayName = col + 'DisplayName';
        if (this.itemsData[i].hasOwnProperty(colDisplayProp) && this.itemsData[i][colDisplayProp] && this.itemsData[i][colDisplayProp] !== '') {
          this.records[i][col] = this.itemsData[i][colDisplayProp];
        } else if (this.itemsData[i].hasOwnProperty(colDisplayName)) {
          this.records[i][col] = this.itemsData[i][colDisplayName];
        } else if (this.itemsData[i].hasOwnProperty(col) && this.itemsData[i][col] && !isNaN(this.itemsData[i][col])) {
          this.records[i][col] = parseFloat(this.itemsData[i][col]);
        } else if (this.itemsData[i].hasOwnProperty(col) && this.itemsData[i][col] !== null) {
          this.records[i][col] = this.itemsData[i][col];
        } else if (!this.itemsData[i].hasOwnProperty(col) || this.itemsData[i][col] === null){
          this.records[i][col] = " - ";
        } else {
          this.records[i][col] = "...";
        }
      })
      
      if(initialLoad) {
        dateColumns.forEach(col => {
          this.records[i][col] = this.us.getItemListDate(this.itemsData[i][col], this.dateFormat);
        })
        let _toDate_disableUntill_date = this.subtractOneDay(this.itemsData[i]['deliveryFromDate'])
        this.records[i]['deliveryToDateOptions'] = {
          dateFormat: this.dateFormat,
          height: '28px',
          width: '100px',
          disableUntil: _toDate_disableUntill_date
        }
        this.records[i]['deliveryPeriod'] = this.records[i]['deliveryFromDate'] + ' - ' + this.records[i]['deliveryToDate'];
  
        this.records[i]['minQty'] = parseFloat(this.getMin(i, this.itemsData)).toLocaleString();
        this.records[i]['maxQty'] = parseFloat(this.getMax(i, this.itemsData)).toLocaleString();
        this.records[i]['itemQty'] = parseFloat(this.itemsData[i]['itemQty']).toLocaleString() + ' ' + this.records[i].itemQtyUnitId;
        this.records[i]['openQty'] = parseFloat(this.itemsData[i]['itemQty']).toLocaleString() + ' ' + this.records[i].itemQtyUnitId;
  
        // extra columns for edit
        this.records[i]['delFromDate'] = this.us.getMyDatePickerDate(this.itemsData[i]['deliveryFromDate']);
        this.records[i]['delToDate'] = this.us.getMyDatePickerDate(this.itemsData[i]['deliveryToDate']);
  
        this.records[i]['isDeleted'] = this.itemsData[i]['isDeleted'];
      } else {
        this.records[i]['itemQty'] = parseFloat(this.contract.itemDetails[i]['itemQty']).toLocaleString() + ' ' + this.records[i].itemQtyUnitId;
        this.records[i]['openQty'] = parseFloat(this.contract.itemDetails[i]['itemQty']).toLocaleString() + ' ' + this.records[i].itemQtyUnitId;
      }
  
      if(this.itemsData[i].hasOwnProperty('toleranceMin') && this.itemsData[i].toleranceMin !== null){
        this.records[i]['tolerance'] = this.itemsData[i]['toleranceMin'] + '/' + this.itemsData[i]['toleranceMax']  + ' ' + this.records[i]['toleranceType'] + ' ' + this.itemsData[i]['toleranceLevel'];
      }else{
        this.records[i]['tolerance'] = this.itemsData[i]['tolerance'] + ' ' + this.records[i]['toleranceType'] + ' ' + this.itemsData[i]['toleranceLevel'];
      }
      this.records[i]['loadingLocationGroupTypeId'] = this.records[i]['originationCountryId'] + ' - ' + this.records[i]['loadingLocationGroupTypeId'] + ' - ' + this.records[i]['originationCityId'];
      this.records[i]['destinationLocationGroupTypeId'] = this.records[i]['destinationCountryId'] + ' - ' + this.records[i]['destinationLocationGroupTypeId'] + ' - ' + this.records[i]['destinationCityId'];
      this.records[i]['priceTypeId'] = this.itemsData[i]['pricing']['priceTypeId'];

    }

    let fieldKeys = Object.keys(this.fields);
    this.header = [];
    for (let i = 0; i < displayColumns.length; i++) {
      if (fieldKeys.includes(displayColumns[i])) {
        this.header.push({ field: displayColumns[i], header: this.fields[displayColumns[i]].label, width: displayColumnsSize[i] });
      } else {
        this.header.push({ field: displayColumns[i], header: displayColumns[i], width: displayColumnsSize[i] });
      }
      if (
        this.header[i].field === 'itemQty' || this.header[i].field === 'deliveryPeriod'
      ) {
        this.header[i].edit = true;
      }
    }

    this.columsSelected = this.header;
    this.tableLoading = false;
  }

  editRecord(index = this.selectedItemNo) {
    localStorage.removeItem("splitData");
    let itemNo = this.contract.itemDetails[index].itemNo;
    this.router.navigate(
      ['../../item-details/' + this.navigationId + '/' + itemNo],
      { relativeTo: this.route }
    );
  }

  copyItem(index = this.selectedItemNo) {
    localStorage.removeItem("splitData");
    let toCloneItemNo = this.contract.itemDetails[index].itemNo;
    let clonedItem = JSON.parse(JSON.stringify(this.contract.itemDetails[index]));
    let newItemNo = this.itemNoService.getBiggestItemNo(this.contract) + 1;
    clonedItem['itemNo'] = newItemNo;
    if(clonedItem.pricing.splitFormData && clonedItem.pricing.splitFormData){
      clonedItem.pricing.splitFormData = clonedItem.pricing.splitFormData.map(split=>{
        split.itemNumber = String(clonedItem.itemNo);
        delete split["internalContractItemRefNo"]
        delete split._id
        return split;
      })
    }
    clonedItem = this.cs.removeAllItemInternalIDs(clonedItem);
    this.contract.itemDetails.splice(index + 1, 0, clonedItem);
    this.cos.changeCurrentContractObject(this.contract);
    this.componentService.cloneComponent(this.contract._id,toCloneItemNo,newItemNo)
    this.router.navigate(
      ['../../item-details/' + this.navigationId + '/' + newItemNo],
      { queryParams: { cloneItem: toCloneItemNo }, relativeTo: this.route }
    );
  }

  deleteItem(i = this.selectedItemNo) {
    let pricingStrategy = this.contract.itemDetails[i].pricing.pricingStrategy;
    if(pricingStrategy === 'pricingStrategy-002' || pricingStrategy === 'pricingStrategy-003'){
      let deleteItem = JSON.parse(JSON.stringify(this.contract.itemDetails[i]));
      this.componentService.getTieredDataBasedonDraftId(this.contract).subscribe((res:any)=>{
        if(res.data){
          let itemNumber = deleteItem.itemNo;
          let itemSplits = res.data.filter(split => split.itemNumber == itemNumber);
          if(itemSplits){
            this.componentService.deleteItemSplits(itemSplits).subscribe((res:any)=>{
              console.log(res);
            })
          }
        }
      })
    }
    this.componentService.deleteExposureData(this.contract.contractRefNo,this.contract.itemDetails[i].itemNo).subscribe(res=>{})
    if (this.contract.itemDetails[i].internalItemRefNo) {
      this.contract.itemDetails[i].isDeleted = true;
    } else {
      this.contract.itemDetails.splice(i, 1);
    }
    this.records.splice(this.selectedTableRowIndex, 1);
    this.cos.changeCurrentContractObject(this.contract);
    for (let j = 0; j < this.rowSelected.length; j++) {
      this.rowSelected[j] = false
    }
  }

  addNewItem() {
    let newItemNo = this.itemNoService.getBiggestItemNo(this.contract) + 1;
    this.router.navigate(
      ['../../item-details/' + this.navigationId + '/' + newItemNo],
      { queryParams: { newItem: 'true' }, relativeTo: this.route }
    );
  }

  public saveContract = () => {
    if(this.cs.checkIfSplitPriceContract(this.contract)){
      this.apiCalled = true;
      let splitApiObs = this.componentService.splitDataCURD(this.contract, this.appObject, this.action);
      splitApiObs.subscribe((res:any)=>{
        console.log(res);
        this.updateSplitsInContractObjSession(res);
        this.apiCalled = false;
        this.checkAppObjectSave();
      })
    }else{
      this.checkAppObjectSave()
    } 
  };

  checkAppObjectSave(){
    switch (this.appObject) {
      case 'contract':
        if (this.action === 'create' || this.action === 'clone') {
          this.checkSaveContractOrDraft();
        } else {
          if(this.contract.reasonToModify !== null){
            this.apiCalled = true;
            this.cs.saveEditedContractReturn(this.contract)
            .pipe(concatMap((res:any)=>{
              this.cos.changeCurrentContractObject(res.data.contractDetails);
              this.contract = res.data.contractDetails;
              this.cos.changeCurrentContractObject(this.contract);
              this.componentService.updateComponentMultiple(res)
              return this.componentService.updateSplitsWithContractItemRefs(this.contract);
            }))
            .subscribe((res:any)=> {
              this.apiCalled = false;
              localStorage.removeItem('splitData')
              this.updateContractPopup.open('Existing contract has been updated');
            });
          }else{
            this.showWarning = true;
            this.errorMsg = 'In General Details section, enter the reason for modification before save';
          }
        }
        break;
      case 'template':
        this.apiCalled = true;
        if (
          (this.action === 'create' || this.action === 'clone') &&
          !this.contract.hasOwnProperty('internalContractRefNo') &&
          !this.contract.internalContractRefNo
        ) {
          this.cs.saveTemplate(this.contract).subscribe((res: any) => {
            this.cos.changeCurrentContractObject(res.data.contractDetails);
            this.apiCalled = false;
            this.contractCreated.open(
              'Template saved with Reference No. : ' + res.data.contractDetails.contractRefNo
            );
          });
        } else {
          this.cs.updateTemplate(this.contract).subscribe((res: any) => {
            this.cos.changeCurrentContractObject(res.data.contractDetails);
            this.apiCalled = false;
            this.contract = res.data.contractDetails;
            this.cos.changeCurrentContractObject(this.contract);
            this.updateTemplatePopup.open(
              'Template updated with Reference No. : ' + res.data.contractDetails.contractRefNo
            );
          });
        }
        break;
      case 'draft':
        this.checkSaveContractOrDraft();
        break;
    }
  }

  saveAsCtrmDraft() {
    this.apiCalled = true;
    if (this.contract.internalContractRefNo) {
      this.cs
        .updateCtrmDraft(this.contract, this.contract.internalContractRefNo)
        .subscribe((res: any) => {
          this.cos.changeCurrentContractObject(res.data.contractDetails);
          this.apiCalled = false;
          this.contract = res.data.contractDetails;
          this.cos.changeCurrentContractObject(this.contract);
         
          this.draftCreated.open(
            'Previously saved Draft with Ref No.' +
            res.data.contractDetails.contractRefNo +
            ' has been updated'
          );
        });
    } else {
      this.cs.saveCtrmDraftContract(this.contract).subscribe((res: any) => {
        this.cos.changeCurrentContractObject(res.data.contractDetails);
        this.apiCalled = false;
        this.contract = res.data.contractDetails;
        this.cos.changeCurrentContractObject(this.contract);
        
        this.draftCreated.open(
          'Contract saved as draft with Ref No. : ' + res.data.contractDetails.contractRefNo
        );
      });
    }
  }

  checkSaveContractOrDraft() {
    this.contractDraftPopup.open(
      'Do you want to create contract or save as draft?'
    );
  }

  confirmSaveContractOrDraft(msg) {
    if (msg === 'SAVE AS CONTRACT') {
      let contractObjCopy = JSON.parse(JSON.stringify(this.contract));
      contractObjCopy = this.cs.removeAllInternalIDs(contractObjCopy);
      if (this.appObject === 'draft' && this.action === 'edit') {
        contractObjCopy.internalDraftId = this.contract["internalContractRefNo"];
        this.apiCalled = true;
        this.cs.startNewContract().pipe(
          tap((data:any)=>{ 
            contractObjCopy._id = data._id; 
          }),
          concatMap((data:any)=>{ 
            return this.componentService.saveSplitsWithNewDraftId(this.contract, data._id);
          })
          ).subscribe((res:any)=>{
            console.log(res);
            this.updateSplitsInContractObjSession(res);
            this.apiCalled = false;
            this.approvePopup.open(contractObjCopy);
          })
      } else {
        this.approvePopup.open(contractObjCopy);
      }
    } else if (msg === 'SAVE AS DRAFT') {
      this.saveAsCtrmDraft();
    }
  }

  afterApprovalPopupCreateContract(contractDataWithApproval) {
    this.apiCalled = true;
    this.cs.createContract(contractDataWithApproval)
    .pipe(concatMap((res:any)=>{
      this.contract = res.data.contractDetails;
      this.navigationId = res.data.contractDetails.internalContractRefNo;
      this.ps.setNewContractId(res.data.contractDetails.internalContractRefNo);
      this.cos.changeCurrentContractObject(res.data.contractDetails);
      if(res.data.secondLegContractDetails){
        this.secondLegContractDetails = res.data.secondLegContractDetails;
      }
      this.componentService.updateComponentMultiple(res)
      return this.componentService.updateSplitsWithContractItemRefs(this.contract);
    }))
    .subscribe((res: any) => {
      this.afterContractCreationActions(res);
    });
  }

  afterContractCreationActions(res){
    localStorage.removeItem('splitData')
    this.apiCalled = false;
    if(this.contract.dealType === 'Inter_Company' || this.contract.dealType === 'Intra_Company'){
      this.contractCreated.open(
        '1. Contract created with Contract Ref No. :' +
        this.contract.contractRefNo + ' \n ' +
        '2. SecondLeg contract created with Contract Ref No. :' + this.secondLegContractDetails.contractRefNo
      );
    } else {
      this.contractCreated.open(
        'Contract created with Contract Ref No. :' +
        this.contract.contractRefNo
      );
    }
  }

  afterApprovalCancel() {
    this.showWarning = true;
    this.errorMsg = "Selection of approver mandatory for contract creation";
  }

  closeAlert() {
    this.showWarning = false;
    this.showError = false;
  }

  afterContractCreated() {
    this.apiCalled = true;
    this.router.navigate(['../../../../contract/edit/document-upload/' + this.navigationId], {
      relativeTo: this.route
    });
  }

  afterUpdate(action, object) {
    if(action === 'EXIT TO LISTING'){
      this.cs.redirectToCTRM(object);
    }
  }

  afterDraftCreated(msg) {
    if (msg === 'EXIT TO DRAFT LISTING') {
      this.cs.redirectToDraft();
    }
  }

  editMinMax(value, itemNo, tableRowIndex, event) {
    let i = tableRowIndex;
    let contractItemIndex = this.contract.itemDetails.findIndex(ele => {
      return ele.itemNo === itemNo;
    })
    let item = this.contract.itemDetails[contractItemIndex];
    let pricingStrategy = this.contract.itemDetails[i].pricing.pricingStrategy;
    if(pricingStrategy === 'pricingStrategy-002' || pricingStrategy === 'pricingStrategy-003'){
      if(event.type === "keydown"){ // to prevent double alert
        this.reqFailedPopup.open("For Tiered Pricing Contract items - Item Qty can only be changed through Item Details Screen");
        this.records[i].itemQtyNum = this.originalItemQty[contractItemIndex];
      }
    }else if(this.checkForGmrItemQtyValidationFail(item, value, contractItemIndex)){
      if(event.type === "keydown"){ // to prevent double alert
        this.showError = true;
        this.errorMsg = "User cannot reduce the Item Qty as GMR is already executed";
        this.records[i].itemQtyNum = this.originalItemQty[contractItemIndex];
      }
    }else{
      let _value = parseFloat(value);
      this.inlineEdit(contractItemIndex, 'itemQty', _value);
      this.records[i]['itemQty'] = _value.toLocaleString() + ' ' + this.records[i].itemQtyUnitId;
      this.records[i]['openQty'] = _value.toLocaleString() + ' ' + this.records[i].itemQtyUnitId;
      if(!item.toleranceMin){
        if (this.records[i].toleranceType === '%') {
          this.records[i]['minQty'] = _value * ((100 - parseFloat(item.tolerance)) / 100);
          this.records[i]['maxQty'] = _value * ((100 + parseFloat(item.tolerance)) / 100);
        } else {
          this.records[i]['minQty'] = Number(item.tolerance);
          this.records[i]['maxQty'] = Number(item.tolerance);
        }
      }else{
        if (this.records[i].toleranceType === '%') {
          this.records[i]['minQty'] = _value * ((100 - parseFloat(item.toleranceMin)) / 100);
          this.records[i]['maxQty'] = _value * ((100 + parseFloat(item.toleranceMax)) / 100);
        } else {
          this.records[i]['minQty'] = Number(item.toleranceMin);
          this.records[i]['maxQty'] = Number(item.toleranceMax);
        }
      }
      this.records[i]['minQty'] = parseFloat(this.records[i]['minQty']).toLocaleString();
      this.records[i]['maxQty'] = parseFloat(this.records[i]['maxQty']).toLocaleString();
    } 
  }

  editFromDate(value, itemNo, tableRowIndex) {
    console.log('editFromDate');
    let i = tableRowIndex;
    if(value && this.records[i]['deliveryFromDate'] !== value){
      let contractItemIndex = this.contract.itemDetails.findIndex(ele => {
        return ele.itemNo === itemNo;
      })
      let date = this.us.getISO(value)
      this.inlineEdit(contractItemIndex, 'deliveryFromDate', date);
      this.records[i]['deliveryFromDate'] = value;

      let _moment_fromDate = this.us.getMomentDate(value);
      let _moment_toDate = this.us.getMomentDate(this.records[i].deliveryToDate);
      let isToDateBeforeFromDate = _moment_toDate.isBefore(_moment_fromDate);
      if(isToDateBeforeFromDate){
        this.inlineEdit(contractItemIndex, 'deliveryToDate', date);
        this.records[i]['deliveryToDate'] = value;
        this.records[i]['delToDate'] = this.us.getMyDatePickerDate(value);
        this.records[i]['deliveryPeriod'] =
        value +
        ' - ' +
        this.us.getItemListDate(this.records[i].deliveryToDate, this.dateFormat);
      } else {
        this.records[i]['deliveryPeriod'] =
          value +
          ' - ' +
          this.us.getItemListDate(this.records[i].deliveryToDate, this.dateFormat);
      }
      if(value){
        let _toDate_disableUntill_date = this.subtractOneDay(value);
        this.records[i]['deliveryToDateOptions'].disableUntil = _toDate_disableUntill_date;
      }
    }
  }

  onCalendarToggle(event, i){
    if(event === 2){
      this.records[i] = JSON.parse(JSON.stringify(this.records[i]));
    }
  }

  editToDate(value, itemNo, tableRowIndex) {
    console.log('editFromDate');
    let i = tableRowIndex;
    if(value && this.records[i]['deliveryToDate'] !== value){
      let contractItemIndex = this.contract.itemDetails.findIndex(ele => {
        return ele.itemNo === itemNo;
      })
      let toDate = this.us.getISO(value)
      this.inlineEdit(contractItemIndex, 'deliveryToDate', toDate);
      this.records[i]['deliveryToDate'] = value;
      this.records[i]['deliveryPeriod'] =
        this.us.getItemListDate(this.records[i].deliveryFromDate, this.dateFormat) +
        ' - ' +
        value;
    }
  }

  // inline edit function for put request
  inlineEdit(i, property, data) {
    this.contract.itemDetails[i][property] = data;
  }

  /// datatablesFunction

  filter_distinct(array, property) {
    var unique = {};
    var distinct = [];
    for (var i in array) {
      if (typeof unique[array[i][property]] == 'undefined') {
        distinct.push({ label: array[i][property], value: array[i][property] });
      }
      unique[array[i][property]] = 0;
    }
    return distinct;
  }
  display(obj) {
    if (obj.value) return obj.value;
    else return obj;
  }
  displayHeader(obj) {
    if (obj.labelKey) return obj[obj.labelKey];
    else return obj;
  }

  isSort(obj) {
    if (typeof obj.sort !== 'undefined') return obj.sort;
    else return true;
  }

  isFilter(obj) {
    if (typeof obj.filter !== 'undefined') return obj.filter;
    else return true;
  }

  //Checks if the object has any entries
  isEmpty(obj) {
    if (obj) return Object.keys(obj).length === 0;
  }

  //Sets default pagination to true
  pagination(value: boolean) {
    if (value === false) return false;
    else return true;
  }

  //Sets default rowsize to 10
  rowsSize(value: number) {
    if (value) return value;
    else return 10;
  }
  resetTable() {
    this.render = false;
    setTimeout(() => (this.render = true), 0);
  }
  reload() { }
  reset() {
    this.table.reset();
    this.records = this.dataBackup;
    this.records = this.records.slice();
  }

  isEditContract() {
    return this.appObject === 'contract' && this.action === 'edit'
  }

  pr(record, rowindex) {
    this.selectedItemNo = this.contract.itemDetails.findIndex(item=>item.itemNo === record.itemNo);
    this.selectedTableRowIndex = rowindex;
    for (var i = 0; i < this.rowSelected.length; i++) {
      this.rowSelected[i] = false
    }
    this.rowSelected[rowindex] = true
    if(this.contract.itemDetails[rowindex].internalItemRefNo){
      let gmrCreated = this.gmrDetails.find(item=>item.internalContractItemRefNo === this.contract.itemDetails[rowindex].internalItemRefNo)
      if(gmrCreated){
        this.gmrExistsForSelectedItem = true;
      }else{
        this.gmrExistsForSelectedItem = false;
      }
    }
  }

  columnFilterDropdownClick($event) {
    $event.stopPropagation();
  }

  sortElementsDowntoUp(elementList){
    elementList.sort((a, b) => {
      a = a.itemNumber;
      b = b.itemNumber;
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    return elementList;
  }

  onEditDisableFields(){
    if(_.has(this.contract, ['internalContractRefNo'])){
      this.componentService.checkContractGMR(this.contract.internalContractRefNo).subscribe((res:any)=>{
        if(res.data.length > 0){
          this.gmrDetails = res.data;
        }
      })
    }
  }

  updateSplitsInContractObjSession(res){
    if((res.data && res.data.length > 0) || (_.has(res, [0,'data',0,'_id']))){
      if((Array.isArray(res))){
        res = res[0];
      }
      this.contract = this.componentService.updateSplitFormData(this.contract, res.data);
      this.cos.changeCurrentContractObject(this.contract);
      sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(this.contract));
    }
  }

  checkForGmrItemQtyValidationFail(item, value, contractItemIndex){
    if(item.internalItemRefNo){
      let gmrCreated = this.gmrDetails.find(gmrItem=>gmrItem.internalContractItemRefNo === item.internalItemRefNo)
      let _value = parseFloat(value);
      if(gmrCreated && value < this.originalItemQty[contractItemIndex]){
        return true;
      }else{
        return false;
      }
    } 
  }

  handleAlert(showAlert){
    if(showAlert){
      setTimeout(() => this.showError = false, 4000);
    }
    return showAlert;
  }

  loadFormulaNames(){
    let formulaNamesObs = [];
    let itemsInListIndex = [];
    for(var i=0; i<this.itemsData.length; i++){
     if(this.itemsData[i].pricing.priceTypeId === 'FormulaPricing' &&
     this.itemsData[i].pricing.pricingStrategy === 'pricingStrategy-001'){
      formulaNamesObs.push(this.cs	
        .getFormulaName(this.itemsData[i].pricing.pricingFormulaId))
        itemsInListIndex.push(i);
     }   
     if(this.itemsData[i].pricing.priceTypeId !== 'FormulaPricing'){
      this.itemsData[i].pricingStrategyDisplayName = null;
     }
    }
    if(formulaNamesObs.length > 0){
      forkJoin(formulaNamesObs).subscribe((data: any) => {	
        for(let j=0; j < data.length; j++){
          let itemIndex = itemsInListIndex[j];
          this.itemsData[itemIndex].formulaName = data[j][0].formulaName;
          this.records[itemIndex].formulaName = data[j][0].formulaName;
        }    
      }, error => { });
    }
  }

}