import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MasterDataService } from '../master-data.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { PercentService } from '../side-bar/side-bar.component';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { ContractService } from '../../contract-service/contract-service.service';
import { UtilService } from '../../../utils/util.service';
import { debounceTime, tap, mergeMap, timeout, first, filter, pairwise, map } from 'rxjs/operators';
import { loadingValidator } from '../../contract-service/loading-validator';
import { ContractObjectService } from '../../contract-service/contract-object.service';
import { of, AsyncSubject, forkJoin } from 'rxjs';
import { ApprovalService } from '../../contract-service/approval.service';
import { NLPService } from '../../contract-service/nlp.service';
import { RecommendationService } from '../../contract-service/recommendation.service';
import { ComponentService } from '../../component-service/component.service';
import * as _ from 'lodash';
import { PaymentDueDateAndEventDateService } from '../payment-due-date-and-event-date/payment-due-date-and-event-date.service';

@Component({
  selector: 'app-general-details',
  templateUrl: './general-details.component.html',
  styleUrls: ['./general-details.component.scss']
})
export class GeneralDetailsComponent implements OnInit {

  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '230px'
  };

  public amendmentDateOptions: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '230px',
    openSelectorTopOfInput: true
  };

  dateStyle: any = [];
  amendmentDateStyle: any;
  recommendationsList: any = {};
  txtToContractList: any =  {};
  applyRecommendation: any = true;
  newItem
  onDateChanged(event: IMyDateModel, input) {
    if (event.epoc === 0) {
      if (input === 'issueDate') {
        this.dateStyle[0] = '1px solid #ff00008f';
      } else if (input === 'amendmentDate') {
        this.amendmentDateStyle.border = '1px solid #ff00008f';
      }
    } else {
      if (input === 'issueDate') {
        this.dateStyle[0] = '1px solid #ccc';
        this.disableUntil(event.date, 'amendmentDateOptions');
      } else {
        this.amendmentDateStyle.border = '1px solid #ccc';
      }
    }

    if(this.recommendationsList['issueDate']){
      this.dateStyle[1].background = '#ffff0021';
      this.dateStyle[1].background = '#ffff0021';
    }

    if(this.txtToContractList['issueDate']){
      this.dateStyle[1].background = '#90ee9066';
      this.dateStyle[1].background = '#90ee9066';
    }
  }

  disableUntil(date, dateOptions) {
    let _moment_date = this.us.getMomentDate({'date':date});
    let _temp = _moment_date.subtract(1, "days").toObject();
    let disableTillDate = { 'day' : _temp.date, 'month': _temp.months + 1, 'year': _temp.years};
    let copy = JSON.parse(JSON.stringify(this[dateOptions]));
    copy.disableUntil = disableTillDate;
    this[dateOptions] = copy;
  }

  @ViewChild('confirm') contractPopup;
  @ViewChild('reqFailed') reqFailedPopup;
  @ViewChild('textToContract') textToContract;
  @ViewChild('confirmUseOfLastAutoSaveAlert') confirmUseOfLastAutoSaveAlert;
  ngAfterViewInit() {
    let issDate: any = document.getElementById('contractIssueDate').getElementsByClassName('mydp');
    this.dateStyle[0] = issDate[0].style;
    let select: any = document.getElementById('contractIssueDate').getElementsByClassName('selectiongroup');
    this.dateStyle[1] = select[0].style;
    let dateIc: any = document.getElementById('contractIssueDate').getElementsByClassName('btnpicker');
    this.dateStyle[2] = dateIc[0].style;
    if(!this.allMandatoryFieldsMDM_loaded){
      this.apiCalled = true;
      if(this.reqFailedPopup){
        this.reqFailedPopup.open(this.initialLoad_MDM_msg);
      }
    }
    if(this.appObject === 'contract' && this.action === 'edit'){
      let chk1: any = document
        .getElementById('amendmentDate')
        .getElementsByClassName('mydp');
      this.amendmentDateStyle = chk1[0].style;
    }
  }

  appObject
  action
  contractId
  contractData
  loaded = false
  FormData
  fields
  generalDetailsForm
  optional
  fromValid = false;
  completePercent = 0;
  templateList
  templateChangeCheck
  draftSaved = false;
  templateSaved = false;
  queryParams
  mandatoryFields = ["issueDate", "dealType", "contractType", "traderUserId", "cpProfileId", "paymentTermId", "provisionalPaymentTermId", "applicableLawId", "arbitrationId", "incotermId", "totalQtyUnitId", "legalEntityId"];
  mandatoryMDMFields = ["dealType", "contractType", "traderUserId", "paymentTermId", "applicableLawId" , "arbitrationId", "incotermId", "productId", "toleranceLevel", "toleranceType", "shipmentMode", "originationCountryId", "destinationCountryId", "strategyAccId", "taxScheduleCountryId"];
  finalValidation = false;
  apiCalled = false;
  sideBarPercentForEachField
  showWarning: boolean;
  errorMsg: string;
  cpAddress
  internalContractRef
  initLoader = true;
  draftSaveInProgress = false;
  itemDetailsFillPercentage = 0;
  autoSaveInitial = new AsyncSubject();
  contractTxtValues = {}
  optionalFieldsRecommendation
  autoSavedContract
  initialLoad_MDM_msg = "Unable to fetch values for the following mandatory fields from setup : "
  allMandatoryFieldsMDM_loaded = true;
  incotermDetails
  paymentTermDetails
  errorSubscriber

  constructor(private rs:RecommendationService, private nlp:NLPService, private as:ApprovalService,private cos: ContractObjectService,private cs: ContractService, private us: UtilService, private ps: PercentService, private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, private mdm: MasterDataService, private router: Router, private componentService: ComponentService, private PaymentAndEventService: PaymentDueDateAndEventDateService) {

    this.errorSubscriber = this.cs.reqFailedObs.subscribe(e => {
      this.apiCalled = false;
      this.reqFailedPopup.open(e);
    });

    this.FormData = this.route.snapshot.parent.data.FormData;
    this.appObject = this.FormData.appObject;
    this.action = this.FormData.action
    this.fields = this.FormData.fields;
    this.mandatoryMDMFields.forEach(field=>{
      if(_.has(this.fields[field], ['options']) && (typeof this.fields[field].options === 'undefined' || this.fields[field].options.length == 0)){
        this.initialLoad_MDM_msg = this.initialLoad_MDM_msg + " '" +this.fields[field].label + "' "
        this.allMandatoryFieldsMDM_loaded = false;
      }
    })
    this.contractId = this.FormData.id;

    let contractFormFields = {
      templateId: [null],
      issueDate: [null, Validators.required],
      dealType: [null, Validators.required],
      contractType: [null, Validators.required],
      traderUserId: [null, Validators.required],
      cpProfileId: [null, [Validators.required , loadingValidator()]],
      paymentTermId: [null, Validators.required],
      provisionalPaymentTermId: [null, Validators.required],
      applicableLawId: [null, Validators.required],
      arbitrationId: [null, Validators.required],
      incotermId: [null, Validators.required],
      totalQtyUnitId: [null, Validators.required],
      remark: [null],
      prePaymentPct: [null, Validators.min(0)],
      prePaymentDays: [null, Validators.min(0)],
      agentProfileId: [null],
      agentPersonInCharge: [null , loadingValidator()],
      agentRefNo: [null],
      agentCommType: [null],
      agentCommValue: [null, Validators.min(0)],
      agentCommPriceUnitId: [null],
      cpPersonInCharge: [null , loadingValidator()],
      cpRefNo: [null],
      qualityFinalAt: [null],
      weightFinalAt: [null],
      isOptionalFieldsEnabled: [false],
      amendmentDate: [null],
      reasonToModify: [null],
      intraCompanyCPProfileId: [null],
      intraCompanyCPName: [null],
      intraCompanyTraderUserId: [null],
      //targetIncoTerm: [null],
      copySecondaryCost: [null],
      legalEntityId: [null, Validators.required]
    }
    if (this.appObject === 'template') {
      delete contractFormFields['templateId'];
      contractFormFields['templateName'] = [null, Validators.required];
      this.mandatoryFields.unshift('templateName');
    }
    this.sideBarPercentForEachField = 100/this.mandatoryFields.length;
    this.generalDetailsForm = this.fb.group(contractFormFields);
  }

  validateField(name) {
    if (!this.finalValidation) {
      return this.generalDetailsForm.get(name).invalid && this.generalDetailsForm.get(name).touched
    } else {
      return this.generalDetailsForm.get(name).invalid
    }
  }


  ngOnInit() {
    
    // let checkedLast = localStorage.getItem("lastAutoSavedContractChecked");
    // if((checkedLast === 'NotChecked') && (this.action === 'create')){
    //   localStorage.setItem("lastAutoSavedContractChecked","checked");
    //   this.cs.getLastSavedContract().subscribe((res:any)=>{
    //     if(res.contractState === 'autoSave'){
    //       this.autoSavedContract = res;
    //       this.confirmUseOfLastAutoSaveAlert.open('Do you want to continue from where you left off?');
    //     }
    //   })
    // }

    if (this.action === 'create' || this.action === 'clone'){
      this.cos.onLoadGetContractObject(this.contractId, this.action)
       .pipe(
         tap((contractObj)=>{
            let len = Object.keys(contractObj).length;
            if (len > 10) {
              this.existingContractActions(contractObj);
            } else {
              this.newContractActions(contractObj);
            }
            this.as.callApprovalAPI();
            if(this.action === 'clone'){
              this.checkUserSelfApproval(contractObj.dealType);
            }
         }),
         mergeMap((contractObj)=>{
           if(contractObj._id === "new_contract"){
             this.generalDetailsForm.patchValue(this.rs.getFirstTimeUserDefaults(this.fields,'generalDetails'));
             return this.cs.startNewContract()
           }else{
             return of(contractObj);
           }
         }),
         tap((contractObj)=>{
             this.ps.setNewContractId(contractObj._id);
             this.contractData = {...this.contractData, ...contractObj};
             this.contractId = contractObj._id;
             this.cos.changeCurrentContractObject(this.contractData);
             this.autoSaveInitial.next(true);
             this.autoSaveInitial.complete();
         })
       )
       .subscribe();
    } else {
      this.autoSaveInitial.next(true);
      this.autoSaveInitial.complete();
      this.internalContractRef =  this.FormData.id;
      let getContractObs
      switch (this.appObject) {
        case "contract":
          getContractObs = this.cs.getSavedContract(this.internalContractRef);
          this.addAmendmentDateReason_asMandatoryFields();
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.existingContractActions(data);
          })
          break;
        case "template":
          getContractObs = this.cs.getTemplateData(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe(data => {
            this.existingContractActions(data);
          })
          break;
        case "draft":
          getContractObs = this.cs.getDraftContract(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe(data => {
            this.existingContractActions(data);
            this.as.callApprovalAPI();
          })
          break;
      }
    }

  }

  addAmendmentDateReason_asMandatoryFields(){
    this.generalDetailsForm.controls["amendmentDate"].setValidators(Validators.required);
    this.generalDetailsForm.controls["reasonToModify"].setValidators(Validators.required);
    this.mandatoryFields.push("amendmentDate","reasonToModify");
    this.sideBarPercentForEachField = Math.ceil(100/this.mandatoryFields.length);
  }

  afterConfirmedUseOfLastAutoSaveAlert(decision){
    if(decision === 'CONTINUE LAST'){    
      this.contractData = this.autoSavedContract;
      this.contractData._id = this.contractId;
      this.cos.changeCurrentContractObject(this.contractData);
      this.getBusinessPartnerDropdown(this.autoSavedContract.dealType, this.autoSavedContract.contractType);
      this.generalDetailsForm.patchValue(this.contractData, { emitEvent:false });
      this.autoSaveInitial.next(true);
      this.autoSaveInitial.complete();
    }
  }

  optionalEnabled(){
     return this.generalDetailsForm.get('isOptionalFieldsEnabled').value;
  }
  
  optionalFlagChanged(value){
    this.generalDetailsForm.get('isOptionalFieldsEnabled').setValue(value);
  }

  existingContractActions(data) {
    this.contractData = data;
    this.addNlpHighlight();
    this.contractId = this.contractData._id;
    this.setDates();
    this.updateFormData();
    this.checkFormForChanges();
    this.updateSideBar();
    this.loadCombos();
    if(this.appObject !== 'template'){
      this.checkTemplateChange();
    }
    this.checkCpChange();
    this.checkIncotermChange();
    this.checkPaymentTermChange();
    this.updateItemDetailsSidebarPercent();
    this.onEditDisableFields();
    this.apiCalled = false;
    if(this.action === 'create'){
      this.recommendation();
    }
  }

  newContractActions(initData) {
    this.contractData = initData;
    this.addNlpHighlight();
    this.checkFormForChanges();
    this.setDates();
    this.updateFormData();
    this.updateSideBar();
    this.loadCombos();
    if(this.appObject !== 'template'){
      this.checkTemplateChange();
    }
    this.checkCpChange();
    this.recommendation();
    this.defaultValues();
    this.checkIncotermChange();
    this.checkPaymentTermChange();
    this.updateItemDetailsSidebarPercent();
    this.apiCalled = false;
  }

  addNlpHighlight(){
    if(this.contractData.nlpFields){
      this.txtToContractList = this.contractData.nlpFields;
    }
  }

  defaultValues(){
    if (!this.contractData.dealType) {
      this.generalDetailsForm.get('dealType').setValue("Third_Party");
    }
    if (!this.contractData.traderUserId && this.fields.traderUserId.options) { 
      let userName = sessionStorage.getItem('firstName') + ' ' + sessionStorage.getItem('lastName');
      const user = this.fields.traderUserId.options.find(user=> user.value === userName);
      if(user){
        this.generalDetailsForm.get('traderUserId').setValue(user.key);
      }
    }
    this.cs.getUserContext().subscribe(data=>{
      console.log(data);
    })
    if (!this.contractData.contractType){
      this.generalDetailsForm.get('contractType').setValue(this.fields.contractType.options[0].key);
    }
    if (!this.contractData.applicableLawId){
      this.generalDetailsForm.get('applicableLawId').setValue(this.fields.applicableLawId.options[0].key);
    }
    if (!this.contractData.arbitrationId){
      this.generalDetailsForm.get('arbitrationId').setValue(this.fields.arbitrationId.options[0].key);
    }
    if (!this.contractData.totalQtyUnitId){
      this.generalDetailsForm.get('totalQtyUnitId').setValue(this.fields.totalQtyUnitId.options[0].key);
    }
  }

  checkFormForChanges() {
    this.generalDetailsForm.valueChanges
    .pipe(
      tap(res => {
        let data = this.generalDetailsForm.getRawValue(); 
        this.updateSideBarDynamic(data);
        this.contractData = { ...this.contractData, ...data };
        this.cos.changeCurrentContractObject(this.contractData);
        if(this.action === 'create' || this.action === 'clone'){
          sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(this.contractData));
        }
      }), 
      debounceTime(10000),
      tap(()=>{
          //this.draftAutoSave();
      })
    )
    .subscribe();

    this.generalDetailsForm.valueChanges
    .pipe(
      pairwise(),
      map(([prev, curr]) => Object.keys(curr).filter(key => prev[key] !== curr[key]))
    ).subscribe(keys => {
      if(keys && keys.length > 0){
        let displayNames = keys.forEach(key => {
          if(_.has(this.fields, [key,"options"]) && this.fields[key].options){
            let option = this.fields[key].options.find(option=>option.key === this.generalDetailsForm.controls[key].value);
            if(option && option.value){
              console.log({ [key+'DisplayName'] : option.value });
              this.contractTxtValues[key+"DisplayName"] = option.value;
              this.addDisplayNames();
            }
          }
        });
      }
    });
  }

  draftAutoSave(){
    if(this.action === 'create' && this.contractId !== 'new_contract' && !this.draftSaveInProgress && this.contractData.contractState === 'autoSave'){
      console.log('draft autosaving contract', this.contractData);
      this.cs.saveDraftContractReturn(this.contractData, this.contractId).subscribe(()=>{})
    } 
  }

  canDeactivate() {
    this.addDisplayNames()
    this.cos.changeCurrentContractObject({...this.contractData, ...this.generalDetailsForm.getRawValue()});
    this.apiCalled = true;
    return this.autoSaveInitial;
  }

  recommendation(){
    this.generalDetailsForm.get('traderUserId').valueChanges.subscribe(traderUserId=>{
        if(this.applyRecommendation){
          this.cs.getRecommendationsGeneralDeatils(traderUserId).pipe(
            timeout(1000),
            map(res=>{
              const allowed = ['contractType', 'paymentTermId', 'incotermId', 'applicableLawId', 'arbitrationId', 'totalQtyUnitId'];
              const filtered = Object.keys(res)
              .filter(key => allowed.includes(key) && res[key] !== null && res[key] !== 'null')
              .reduce((obj, key) => {
                obj[key] = res[key];
                return obj;
              }, {});
              return filtered;
            })
          )
          .subscribe((res:any)=>{
              this.us.objPropRemoveNull(res);
              this.recommendationsList = {...res};
              if(res.optional && res.optional !== 'NA'){
                this.optionalFieldsRecommendation = res.optional;
                this.generalDetailsForm.get('isOptionalFieldsEnabled').valueChanges.pipe(first())
                .subscribe((val)=>{
                  if(val){
                    this.generalDetailsForm.patchValue(this.optionalFieldsRecommendation);
                  }
                 });
              }
              delete res['optional'];
              this.generalDetailsForm.patchValue(res);
              let keys = Object.keys(res)
              let displayObj = keys.reduce((displayValues, field) => {
                let option = this.fields[field].options.find(option=>{
                  return option.key === res[field]
                })
                displayValues[field+'DisplayName'] = option.value;
                return displayValues
              }, {});
              console.log(displayObj);
              this.contractTxtValues = displayObj;
              this.addDisplayNames();
          }, error => {
            console.log('recommendation failed');
          })
        }    
     })  
  }

  useTextToContract(txt){
    console.log(txt);
    this.apiCalled = true;
    this.nlp.getTextToContract(txt, this.fields).subscribe(formVal=>{
        formVal["sentence"] = txt;
        this.contractData = { ...this.contractData, ...formVal }
        this.cos.changeCurrentContractObject(this.contractData);
        this.cs.refreshTrigger.next('refresh');
    });
  }

  setFieldClasses(field){
    let classes = {
      "is-invalid": this.validateField(field),
      "recommendation": this.recommendationsList[field],
      "txtToContract": this.txtToContractList[field]
    };
    return classes;
  }

  setDates() {
    if (this.contractData.issueDate) {
      this.contractData.issueDate = this.us.getMyDatePickerDate(this.contractData.issueDate);
      this.disableUntil(this.contractData.issueDate.date, 'amendmentDateOptions');
    } else {
      let date = new Date();
      this.contractData.issueDate = {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    }
    if (this.action === 'edit') {
      if (this.contractData.amendmentDate) {
        this.contractData.amendmentDate = this.us.getMyDatePickerDate(this.contractData.amendmentDate);
      } else {
        let date = new Date();
        this.contractData.amendmentDate = {
          date: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
          }
        }
      }
    }
  }

  updateFormData() {
    this.generalDetailsForm.patchValue(this.contractData);
    this.initLoader = false;
  }


  checkTemplateChange() {
    this.generalDetailsForm.get('templateId').valueChanges
    .pipe(filter(val => val !== null))
    .subscribe(data => {
      this.apiCalled = true;
      this.cs.getTemplateData(data).subscribe((data: any) => {
        delete data['templateId'];
        delete data['_id'];
        data.issueDate = this.us.getMyDatePickerDate(data.issueDate);
        data = this.cs.removeAllInternalIDs(data);
        this.contractData = { ...this.contractData, ...data };
        this.cos.changeCurrentContractObject(this.contractData);
        this.getBusinessPartnerDropdown(data.dealType, data.contractType);
        this.applyRecommendation = false;
        this.generalDetailsForm.patchValue(data, { emitEvent:false });
        this.updateSideBar();
        this.updateItemDetailsSidebarPercent();
        this.apiCalled = false;
      })
    })
  }

  getBusinessPartnerDropdown(dealType, contractType){
      if(dealType && contractType){
        let dependsOn = this.getBusinessPartnerComboDependsOn(contractType, dealType);
        this.mdm.getComboKeys("businessPartnerCombo",dependsOn).pipe(
        tap((dropdown:any)=>{ 
          this.fields.cpProfileId.options = dropdown.businessPartnerCombo;
          this.addIntraCompanyCPProfileIdOptions(dropdown.businessPartnerCombo);
        })
      ).subscribe();
    }
  }

  getBusinessPartnerComboDependsOn(contractType, dealType){
      if(contractType === "S"){
        return ["BUYER", dealType]
      }else if(contractType === "P"){
        return ["SELLER", dealType]
      }
  }

  updateSideBarDynamic(data) {
    this.completePercent = 0;
    this.mandatoryFields.forEach(element => {
      if (data[element]) {
        this.completePercent += this.sideBarPercentForEachField;
      }
    });
    this.ps.genp(Math.ceil(this.completePercent));
  }

  contractHasItems() {
    return this.contractData.hasOwnProperty('itemDetails') && this.contractData.itemDetails.length >= 1
  }

  updateSideBar() {
    this.updateSideBarDynamic(this.contractData);
  }
  
  updateItemDetailsSidebarPercent(){
      let last = this.contractData.itemDetails.length - 1;
      if(last >= 0){
        this.itemDetailsFillPercentage = this.ps.itemDetailsFillPercentage(this.contractData.itemDetails[last]);
        if(this.itemDetailsFillPercentage === 0){
          this.contractData.itemDetails.splice(last,1);
        }
      }else{
        this.ps.itdp(0);
        this.ps.showItems(false);
        if(this.appObject === 'create'){
          this.ps.isNewItem(true);
          this.newItem = { newItem: 'true' };
        }
      }
  }

  loadCombos() {
    let mdmData = [];
    if(this.contractData.dealType && this.contractData.contractType){
      this.addInterCompanyValidations(this.contractData.dealType);
      let dependsOn = this.getBusinessPartnerComboDependsOn(this.contractData.contractType, this.contractData.dealType);
      mdmData.push({
        "serviceKey": "businessPartnerCombo",
        "dependsOn": dependsOn
      });
    }else{
      mdmData.push({
        "serviceKey": "businessPartnerCombo",
        "dependsOn": ["SELLER","Third_Party"]
      });
    }
    if(this.contractData.cpProfileId){
      mdmData.push({
        "serviceKey": "cpPersonInCharge",
        "dependsOn": [this.contractData.cpProfileId]
      });
    }
    if(this.contractData.agentProfileId){
      mdmData.push({
        "serviceKey": "brokerPersonInCharge",
        "dependsOn": [this.contractData.agentProfileId]
      });
    } 
    
    this.mdm.getMultipleMdmData(mdmData).subscribe((data: any) => {
      this.fields.cpProfileId.options = data.businessPartnerCombo;
      this.addIntraCompanyCPProfileIdOptions(data.businessPartnerCombo);
      //this.fields.cpPersonInCharge.options = data.cpPersonInCharge;
      this.fields.agentPersonInCharge.options = data.brokerPersonInCharge;
    })
    this.hookAllComboKeys('cpProfileId', 'contractType', ['contractType', 'dealType'], 'businessPartnerCombo');
    this.hookAllComboKeys('cpProfileId', 'dealType', ['contractType', 'dealType'], 'businessPartnerCombo', 1);
    this.hookAllComboKeys('cpPersonInCharge', 'cpProfileId', ['cpProfileId'], 'cpPersonInCharge');
    this.hookAllComboKeys('agentPersonInCharge', 'agentProfileId', ['agentProfileId'], 'brokerPersonInCharge');
  }

  hookAllComboKeys(dependant, changingKey, dependsOnKeys, serviceKey, dependsOnIndex = 0) {
    this.generalDetailsForm.get(changingKey).valueChanges.subscribe(res => {
      if(res && res!=='loading'){
        this.generalDetailsForm.get(dependant).setValue('loading');
        let dependsOn = [];
        dependsOn[0] = this.contractData[dependsOnKeys[0]];
        if(dependsOnKeys[1]){
          dependsOn[1] = this.contractData[dependsOnKeys[1]];
        }
        dependsOn[dependsOnIndex] = res;
        if(dependant === 'cpProfileId'){
          if(changingKey === 'contractType'){
            dependsOn = this.getBusinessPartnerComboDependsOn(res, this.contractData.dealType);
          }
          if(changingKey === 'dealType'){
            dependsOn = this.getBusinessPartnerComboDependsOn(this.contractData.contractType, res);
            this.checkUserSelfApproval(res);
            this.addInterCompanyValidations(res);
          }
        }
        this.mdm.getComboKeys(serviceKey, dependsOn).subscribe((resKeys: any) => {
          this.fields[dependant].options = resKeys[serviceKey];
          this.generalDetailsForm.get(dependant).setValue(null);
          if(dependant === 'cpProfileId'){
            this.addIntraCompanyCPProfileIdOptions(resKeys[serviceKey]);
          }
        })
      }else{
        this.fields[dependant].options = [];
        this.generalDetailsForm.get(dependant).setValue(null);
      }
      if(changingKey === 'dealType'){
        this.cpAddress = null;
      }
    })
  }

  getControl(name){
    return this.generalDetailsForm.get(name);
  }

  isDraftCreated() {
    if (this.draftSaved) {
      return true;
    }
    if (this.contractData.hasOwnProperty('internalContractRefNo') && this.contractData.internalContractRefNo) {
      this.draftSaved = true;
      return true;
    } else {
      return false;
    }
  }

  checkCpChange(){
    let cpId = this.generalDetailsForm.get('cpProfileId').value;
    if(cpId && cpId!=='loading'){
      this.fetchCpAddress(cpId);
    }
    this.generalDetailsForm.get('cpProfileId').valueChanges.subscribe(res=>{
      this.cpAddress = null;
      if(res && res!=='loading'){
        this.fetchCpAddress(res);
        this.defaultPaymentTerms(res);
        this.addIntraCompanyCPProfileIdOptions(this.fields.cpProfileId.options);
      }
    })
  }

  fetchCpAddress(cpId){
    this.cs.getCpAddress(cpId).subscribe((res:any)=>{
      if(res.data){
        this.cpAddress = res.data.cpAddress;
      }
    })
  }

  defaultPaymentTerms(cpId){
    this.cs.getCpDefaultPaymentTerms(cpId).subscribe((cpDetails:any)=>{
      console.log(cpDetails);
      if(cpDetails && _.has(cpDetails, ["data","paymentTermsMasterPkDO","paymentTermId"]) && cpDetails.data.paymentTermsMasterPkDO.paymentTermId){
        this.generalDetailsForm.get('paymentTermId').setValue(cpDetails.data.paymentTermsMasterPkDO.paymentTermId);
        this.generalDetailsForm.get('provisionalPaymentTermId').setValue(cpDetails.data.paymentTermsMasterPkDO.paymentTermId);
      }
    })
  }

  onEditDisableFields(){
    if(_.has(this.contractData, ['internalContractRefNo'])){
      if(this.appObject === 'contract' && this.action === 'edit'){
        this.generalDetailsForm.get('contractType').disable({ emitEvent: false });
        this.generalDetailsForm.get('dealType').disable({ emitEvent: false });
        this.componentService.checkContractGMR(this.contractData.internalContractRefNo).subscribe((res:any)=>{
          if(res.data.length > 0){
            this.generalDetailsForm.get('issueDate').disable();
            this.generalDetailsForm.get('totalQtyUnitId').disable();
          }
        })
        if(this.contractData.dealType === 'Inter_Company' || this.contractData.dealType === 'Intra_Company'){
          this.generalDetailsForm.get('cpProfileId').disable();
          this.generalDetailsForm.get('intraCompanyCPProfileId').disable();
        }
      }
    }
  }

  isContractValid(){
    console.log(this.itemDetailsFillPercentage);
    if (this.appObject === 'contract' && this.action === 'edit' && !this.generalDetailsForm.get('amendmentDate').value) {
      this.amendmentDateStyle.border = '1px solid #ff00008f';
    }
    return this.generalDetailsForm.valid && (this.itemDetailsFillPercentage === 100 || this.itemDetailsFillPercentage === 0)
  }

  public saveContract = () => {
    if (this.isContractValid()) {
      this.apiCalled = true;
      this.autoSaveInitial.subscribe(()=>{
        this.contractData = {...this.contractData, ...this.generalDetailsForm.getRawValue()};
        if(this.cs.checkIfSplitPriceContract(this.contractData)){
          this.apiCalled = true;
          let splitApiObs = this.componentService.splitDataCURD(this.contractData, this.appObject, this.action);
          splitApiObs.subscribe((res:any)=>{
            console.log(res);
            if(res.data && res.data.length > 0){
              this.contractData = this.componentService.updateSplitFormData(this.contractData, res.data);
              this.cos.changeCurrentContractObject(this.contractData);
              sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(this.contractData));
            }
            this.apiCalled = false;
            this.checkAppObjectSave();
          })
        }else{
          this.checkAppObjectSave()
        }
      })
    } else {
      if(!this.generalDetailsForm.valid){
        this.errorMsg = 'Highlighted fields are mandatory to fill';
      }else{
        this.errorMsg = 'Fill all mandatory fields in Item Details';
      }
      this.finalValidation = true;
      this.showWarning = true;
    }
  }

  checkAppObjectSave(){
    this.addDisplayNames();
        this.cos.changeCurrentContractObject(this.contractData);
        switch (this.appObject) {
          case 'contract':
            if (this.action === 'create' || this.action === 'clone') {
              if (this.isDraftCreated()) {
                this.cs.updateCtrmDraft(this.contractData, this.contractData.internalContractRefNo).subscribe((res: any) => {
                  this.cos.changeCurrentContractObject(res.data.contractDetails);
                  this.apiCalled = false;
                  if (res === 'failed') {
                    this.contractPopup.open('request failed');
                  } else {
                    this.contractData = res.data.contractDetails;
                    this.contractPopup.open('Previously saved Draft with Ref No. : ' + res.data.contractDetails.contractRefNo + ' has been updated');
                  }
                })
              } else {
                this.cs.saveCtrmDraftContract(this.contractData).subscribe((res: any) => {
                  this.draftSaveInProgress = true;
                  this.cos.changeCurrentContractObject(res.data.contractDetails);
                  this.apiCalled = false;
                  if (res === 'failed') {
                    this.contractPopup.open('request failed');
                  } else {
                    this.draftSaved = true;
                    this.contractData = res.data.contractDetails;
                    this.contractPopup.open('Contract saved as draft with Ref No. : ' + res.data.contractDetails.contractRefNo);
                  }
                });
              }
            } else {
              this.cs.saveEditedContractReturn(this.contractData).subscribe((res:any) => {
                this.cos.changeCurrentContractObject(res.data.contractDetails);
                this.apiCalled = false;
                if (res === 'failed') {
                  this.contractPopup.open('request failed');
                } else {
                  this.contractData = res.data.contractDetails;
                  this.contractPopup.open('Contract has been edited and saved')
                }
              });
            }
            break;
          case 'template':
            if ((this.action === 'create' || this.action === 'clone') && !this.contractData.hasOwnProperty('internalContractRefNo') && !this.contractData.internalContractRefNo) {
              this.cs.saveTemplate(this.contractData)
                .subscribe((res: any) => {
                  this.cos.changeCurrentContractObject(res.data.contractDetails);
                  this.apiCalled = false;
                  if (res === 'failed') {
                    this.contractPopup.open('request failed');
                  } else {
                    this.contractData = res.data.contractDetails;
                    this.contractPopup.open("Template saved with Ref No. : " + res.data.contractDetails.contractRefNo);
                    this.templateSaved = true;
                  }
                })
            } else {
              this.cs.updateTemplate(this.contractData).subscribe((res: any) => {
                this.cos.changeCurrentContractObject(res.data.contractDetails);
                this.apiCalled = false;
                if (res === 'failed') {
                  this.contractPopup.open('request failed');
                } else {
                  this.contractData = res.data.contractDetails;
                  this.contractPopup.open("Template updated with Ref No. : " + res.data.contractDetails.contractRefNo);
                }
              })
            }
            break;
          case 'draft':
            this.cs.updateCtrmDraft(this.contractData, this.contractData.internalContractRefNo).subscribe((res: any) => {
              this.cos.changeCurrentContractObject(res.data.contractDetails);
              this.apiCalled = false;
              if (res === 'failed') {
                this.contractPopup.open('request failed');
              } else {
                this.contractData = res.data.contractDetails;
                this.contractPopup.open('Contract draft updated with Ref No. : ' + res.data.contractDetails.contractRefNo);
              }
            })
            break;
        }
  }

  closeAlert() {
    this.showWarning = false;
  }

  afterDraftSave(msg){
     if(msg === 'NEXT'){
      this.redirectToItemDetails();
     }
  }

  redirectToItemDetails() {
    let contractId = (this.action === 'create' || this.action === 'clone')? this.contractId : this.internalContractRef;
    if (this.contractHasItems() && this.contractData.itemDetails.length > 1) {
      this.router.navigate(['../../item-list/' + contractId], { relativeTo: this.route });
    } else {
      if(this.action === 'create'){
        this.router.navigate(
          ['../../item-details/' + contractId + '/' + 1],
          { queryParams: {newItem:true}, relativeTo: this.route } 
        );
      }else{
        this.router.navigate(['../../item-details/' + contractId + '/' + 1], {relativeTo: this.route});
      }
    }
  }

  @HostListener('document:keydown.alt.t', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
     if(event.key === 't'){
       this.textToContract.open();
     }
  }

  isEditContract(){
    return this.appObject === 'contract' && this.action === 'edit' && this.contractData
  }

  getSelectedTxt(event, field, type = 'select'){
    if(type === 'select'){
      let text = event.target.options[event.target.options.selectedIndex].text;
      this.contractTxtValues[field+"DisplayName"] = text;
    }else if(type === 'date'){
      this.contractTxtValues[field+"DisplayName"] = this.us.getISO(event);
    }else if(type === 'number' || type === 'text'){
      this.contractTxtValues[field+"DisplayName"] = event.target.value;
    }
    this.addDisplayNames()
  }

  addDisplayNames(){
    if (this.contractData.hasOwnProperty("generalDetailsDisplayValue")) {
      let displayValue = JSON.parse(this.contractData["generalDetailsDisplayValue"]);
      this.contractData["generalDetailsDisplayValue"] = JSON.stringify({ ...displayValue, ...this.contractTxtValues });
    } else {
      this.contractData["generalDetailsDisplayValue"] = JSON.stringify(this.contractTxtValues);
    }
    if(this.action === 'create' || this.action === 'clone'){
      sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(this.contractData));
    }
  }

  handleAlert(showAlert){
    if(showAlert){
      setTimeout(() => this.showWarning = false, 3000);
    }
    return showAlert;
  }

  checkIncotermChange(){
    this.generalDetailsForm.get('incotermId').valueChanges.subscribe(incotermId=>{
      if(incotermId){
        this.PaymentAndEventService.getIncotermDetails(incotermId).subscribe((incotermDetails:any)=>{
        this.incotermDetails = incotermDetails;
        if(incotermDetails.data.locationField === 'ORIGINATION'){
          this.generalDetailsForm.get('qualityFinalAt').setValue("Loading");
          this.generalDetailsForm.get('weightFinalAt').setValue("Loading");
        } else if(incotermDetails.data.locationField === 'DESTINATION'){
          this.generalDetailsForm.get('qualityFinalAt').setValue("Discharge");
          this.generalDetailsForm.get('weightFinalAt').setValue("Discharge");
        }
        if(this.paymentTermDetails){
          this.checkAndRecalculatePaymentDates(this.paymentTermDetails, incotermDetails);
        }else{
          let provisionalPaymentTermId = this.generalDetailsForm.get('provisionalPaymentTermId').value;
          if(provisionalPaymentTermId){
            this.PaymentAndEventService.getPaymentTermDetails(provisionalPaymentTermId).subscribe(paymentTermDetails=>{
              if(paymentTermDetails){
                this.checkAndRecalculatePaymentDates(paymentTermDetails, this.incotermDetails);
              }
            })
          }
        }
      });
      }
    })
  }

  checkPaymentTermChange(){
    this.generalDetailsForm.get('provisionalPaymentTermId').valueChanges.subscribe(provisionalPaymentTermId=>{
      if(this.incotermDetails && provisionalPaymentTermId){
        this.PaymentAndEventService.getPaymentTermDetails(provisionalPaymentTermId).subscribe(paymentTermDetails=>{
          if(paymentTermDetails){
            this.paymentTermDetails = paymentTermDetails;
            this.checkAndRecalculatePaymentDates(paymentTermDetails, this.incotermDetails);
          }
        })
      }else{
        let incotermId = this.generalDetailsForm.get('incotermId').value;
        if(incotermId && provisionalPaymentTermId){
          forkJoin(this.PaymentAndEventService.getPaymentTermDetails(provisionalPaymentTermId), 
          this.PaymentAndEventService.getIncotermDetails(incotermId)).subscribe((res:any)=>{
            console.log(res);
            if(res[0].data && res[1].data){
              this.paymentTermDetails = res[0].data;
              this.incotermDetails = res[1].data;
              this.checkAndRecalculatePaymentDates(res[0].data, res[1].data);
            }
          })
        }
      }
    })
  }

  checkAndRecalculatePaymentDates(paymentTermDetails, incotermDetails){
    if(this.contractData.itemDetails.length > 0){
      paymentTermDetails.baseDate
      let customEvent = this.fields.customEvent.options.find(event=>{
        if(event.key === this.paymentTermDetails.baseDate){
          return event
        }
      })
      let itemDetails = this.PaymentAndEventService.recalculatePaymentDates(this.contractData, paymentTermDetails, incotermDetails, customEvent);
      console.log(itemDetails);
      this.contractData.itemDetails = itemDetails;
      this.cos.changeCurrentContractObject(this.contractData);
    }
  }

  addIntraCompanyCPProfileIdOptions(options){
    if(this.contractData.dealType === 'Inter_Company'){
      let currentCorporate = JSON.parse(sessionStorage.getItem('userCorporateDetails')).CorporateName;
      console.log(currentCorporate);
      this.fields.cpProfileId.options = options.filter(option => option.value !== currentCorporate);
    }
    if(this.contractData.dealType === 'Intra_Company'){
      this.fields.intraCompanyCPProfileId.options = options;
    }
  }

  addInterCompanyCpName(event){
    if(this.contractData.dealType === 'Inter_Company'){
      let text = event.target.options[event.target.options.selectedIndex].text;
      this.generalDetailsForm.get('intraCompanyCPName').setValue(text);
    }
  }

  checkUserSelfApproval(dealType){
    if(dealType === "Inter_Company" || dealType === "Intra_Company"){
      this.cs.getPhysicalsWorkflowLayout().pipe(
        mergeMap((res:any)=>{
          this.contractData['IS_INTER_INTRA_COMP_APPROVAL_REQ'] = res.properties.IS_INTER_INTRA_COMP_APPROVAL_REQ;
          return this.as.approversDataSubject
        })
      ).subscribe((res: any) => {
        if(this.contractData['IS_INTER_INTRA_COMP_APPROVAL_REQ']){
          let approversData = res.approversDAO;
          console.log(approversData);
          let loggedInUserCanSelfApproval = false;
          let approvalLevels = approversData.approvalLevels.length;
          if(approvalLevels === 1){
            let approvalSubLevel = approversData.approvalLevels[0].approvalSubLevelDos.length;
            if(approvalSubLevel === 1){
              if(approversData.approvalLevels[0].approvalSubLevelDos[0].authorizedForApproval === 'Y'){
                loggedInUserCanSelfApproval = true;
              }
            }
          }
          if(approvalLevels === 0){
            loggedInUserCanSelfApproval = true;
          }
          if(!loggedInUserCanSelfApproval){
            this.reqFailedPopup.open('The logged-In user does not have self approval rights to create inter/intra company contracts');
            this.generalDetailsForm.get('dealType').setValue(null);
          }
        }
      })
    }else{
      delete this.contractData['IS_INTER_INTRA_COMP_APPROVAL_REQ'];
    }
  }

  addInterCompanyValidations(dealType){
    if(dealType === "Inter_Company" || dealType === "Intra_Company"){
      this.generalDetailsForm.controls['intraCompanyTraderUserId'].setValidators([Validators.required]);
    }else{
      this.generalDetailsForm.controls['intraCompanyTraderUserId'].clearValidators();
    }
    if(dealType === "Intra_Company"){
      this.generalDetailsForm.controls['intraCompanyCPProfileId'].setValidators([Validators.required]);
    }else{
      this.generalDetailsForm.controls['intraCompanyCPProfileId'].clearValidators();
    }
  }

  ngOnDestroy(){
    this.errorSubscriber.unsubscribe();
  }

}
