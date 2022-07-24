import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  QueryList
} from '@angular/core';
import { MasterDataService } from '../master-data.service';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormArray,
  Validators,
  ValidatorFn,
  FormGroup
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PercentService } from '../side-bar/side-bar.component';
import { PricingService } from '../../../../../Pricing/pricing-app/config.service';
import { IMyDpOptions, IMyDateModel, IMyInputFocusBlur } from 'mydatepicker';
import { ContractService } from '../../contract-service/contract-service.service';
import { UtilService } from '../../../utils/util.service';
import { DropdownChangeHandlerService } from './dropdown-change-handler.service';
import { ConfirmationService } from 'primeng/api';
import { ApproveContractPopupComponent } from '../approve-contract-popup/approve-contract-popup.component';
import { GenerateItemsPopupComponent } from '../generate-items-popup/generate-items-popup.component';
import { debounceTime, tap, map, mergeMap, catchError, startWith, skip, timeout, first, pairwise, concatMap, retry, debounce, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { combineLatest, of, forkJoin, throwError, interval, Subject } from 'rxjs';
import { loadingValidator, toleranceMaxValidator } from '../../contract-service/loading-validator';
import { ContractObjectService } from '../../contract-service/contract-object.service';
import { ApprovalService } from '../../contract-service/approval.service';
import { priceTypePriceUnits } from '../../contract-service/price-types.contants';
import { NLPService } from '../../contract-service/nlp.service';
import { RecommendationService } from '../../contract-service/recommendation.service';
import { ItemNoService } from '../../item-no.service';
import { ApplicationService } from '@app/views/application/application.service';
import { ModalService } from '@app/views/application/modal.service';
import { ComponentService } from '../../component-service/component.service';
import { PaymentDueDateAndEventDateService } from '../payment-due-date-and-event-date/payment-due-date-and-event-date.service';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  providers: [ConfirmationService]
})
export class ItemDetailsComponent implements OnInit {
  public datePickerAbove: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '236px',
    openSelectorTopOfInput: true
  };

  public pricingDatePicker: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '200px',
    openSelectorTopOfInput: true
  };

  public laycanStartDate: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '230px',
    openSelectorTopOfInput: true
  };

  public laycanEndDate: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '230px',
    openSelectorTopOfInput: true
  };

  public deliveryFromDateOptions: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '230px'
  };

  deliveryToDateOptions: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '230px'
  };
  finalValidation: any;
  errorMsg: string;
  showWarning: boolean;
  general_mandatory = [
    'issueDate',
    'dealType',
    'contractType',
    'traderUserId',
    'cpProfileId',
    'paymentTermId',
    'provisionalPaymentTermId',
    'applicableLawId',
    'arbitrationId',
    'incotermId'
  ];
  generalDetailsComplete = false;
  showSuccess: boolean = false;
  successMsg: string;

  dateStyle: any;
  paymentDueDateStyle: any;
  deliveryFromDateStyle: any;
  deliveryToDateStyle: any;
  customEventDateStyle: any;
  recommendationsList: any = {};
  defaulting = true;
  txtToContractList: any = {};
  checkingInstrument: boolean = false;
  checkingFx: boolean = false;
  checkingFixedFx: boolean = false;
  enableComponent: boolean = false;
  pricingFormulaNameArray: any = [];	
  splitFormData:any=[];	
  splitFormula: any = [];
  contractSplitData: any=[];
  gmrDetailsQty: any=0;
  checkItemQty: boolean;

  incotermDetails: any;
  countryCalendar: any;
  paymentTermDetails: any;
  baseDate: any;
  holidayRule: any = 'NextBusinessDay';
  customEventDate: any;
  formulaChangeSubscriber
  loadingSplits = false;

  onDateChanged(event: IMyDateModel, input) {
    if (event.epoc === 0) {
      if (input === 'paymentDueDate') {
        this.paymentDueDateStyle.border = '1px solid #ff00008f';
      } else {
        this.deliveryToDateStyle.border = '1px solid #ff00008f';
      }
    } else {
      if (input === 'paymentDueDate') {
        this.paymentDueDateStyle.border = '1px solid #ccc';
      } else {
        this.deliveryToDateStyle.border = '1px solid #ccc';
      }
    }
  }

  onInputFocusBlur(event: IMyInputFocusBlur): void {
    if (event.value === null || /([0-3][0-9]-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-[0-9]{4})/.test(event.value) || event.value.length === 0) {
      this.itemDetails_form.get('customEventDate').setErrors(null);
      this.customEventDateStyle.border = '1px solid #ccc';
    } else {
      this.itemDetails_form.get('customEventDate').setErrors({ 'invalid': true });
      this.customEventDateStyle.border = '1px solid #ff00008f';
    }
  }

  onDateChangedDeliveryPeriod(event: IMyDateModel) {
    this.disableUntil(event.date, 'deliveryToDateOptions');
    if (event.epoc === 0) {
      this.deliveryFromDateStyle.border = '1px solid #ff00008f';
    } else {
      this.deliveryFromDateStyle.border = '1px solid #ccc';
      let _moment_fromDate = this.us.getMomentDate(event);
      let _moment_toDate = this.us.getMomentDate(this.itemDetails_form.get('deliveryToDate').value);
      if(_moment_toDate){
        let isToDateBeforeFromDate = _moment_toDate.isBefore(_moment_fromDate);
        if(isToDateBeforeFromDate){
          this.itemDetails_form.get('deliveryToDate').setValue(event);
        }
      }
    }
  }

  onlaycanStartDateChange(event: IMyDateModel) {
    this.disableUntil(event.date, 'laycanEndDate');
    if (event.epoc !== 0) {
      let _moment_fromDate = this.us.getMomentDate(event);
      let _moment_toDate = this.us.getMomentDate(this.itemDetails_form.get('laycanEndDate').value);
      let isToDateBeforeFromDate = _moment_toDate.isBefore(_moment_fromDate);
      if(isToDateBeforeFromDate){
        this.itemDetails_form.get('laycanEndDate').setValue(event);
      }
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
  
  internalContractItemRefNo:any;
  appObject;
  action;
  FormData;
  fields;
  contractId;
  itemNo;
  itemIndex;
  itemDetails_form;
  contractData;
  currentItem: any = {};
  optional;
  compounding;
  priceTypeId = null;
  completePercent = 0;
  pricingFormulaName;
  valuationFormulaName;
  contractDetails;
  new_item = false;
  //cloneItem = -1;
  pricingTriggerFor;
  queryParams;
  apiCalled = false;
  showDetails = false;
  currentPricing = '';
  splitRanges:any;
  @ViewChild(ApproveContractPopupComponent)
  approvePopup: ApproveContractPopupComponent;
  @ViewChild(GenerateItemsPopupComponent)
  generateItemsPopup: GenerateItemsPopupComponent;
  @ViewChild('itemQtyHandle') itemQtyHandle;
  @ViewChild('confirm') contractPopup;
  @ViewChild('contractDraftPopup') contractDraftPopup;
  @ViewChild('contractCreated') contractCreated;
  @ViewChild('draftCreated') draftCreated;
  @ViewChild('mdmFailure') mdmFailure;
  @ViewChild('reqFailed') reqFailedPopup;
  @ViewChild('split') split;
  allowedPriceTypes = [
    'Flat',
    'Fixed',
    'On Call Basis Fixed',
    'Futures First',
    'FormulaPricing'
  ];

  mandatoryFields = [
    'productId',
    'quality',
    'itemQty',
    'itemQtyUnitId',
    'tolerance',
    'toleranceLevel',
    'toleranceType',
    'shipmentMode',
    'deliveryFromDate',
    'deliveryToDate',
    'destinationCountryId',
    'destinationLocationGroupTypeId',
    'destinationCountryId',
    'loadingLocationGroupTypeId',
    'originationCityId',
    'originationCountryId',
    'paymentDueDate',
    'profitCenterId',
    'strategyAccId',
    'taxScheduleCountryId',
    'taxScheduleId'
    // 'valuationFormula'
  ];

  perPriceTypeValidationList = {
    Flat: ['priceDf', 'priceUnitId', 'fxBasisToPayin'],
    'On Call Basis Fixed': [
      'priceContractDefId',
      'futureInstrumentText',
      'priceFutureContractId',
      'priceMonthText',
      'basisPrice',
      'basisPriceUnitId',
      'earliestBy',
      'priceLastFixDayBasedOn',
      'optionsToFix',
      'fixationMethod'
    ],
    Fixed: [
      'priceContractDefId',
      'futureInstrumentText',
      'priceFutureContractId',
      'priceMonthText',
      'futurePrice',
      'futurePriceUnitId',
      'basisPrice',
      'basisPriceUnitId',
      'fxInstToBasis',
      'fxBasisToPayin',
      'priceDf',
      'priceUnitId'
    ],
    FormulaPricing: ['pricingStrategy', 'priceUnitId'],
    'Futures First': [
      'priceContractDefId',
      'futureInstrumentText',
      'priceFutureContractId',
      'priceMonthText',
      'futurePrice',
      'futurePriceUnitId',
      'basisPriceUnitId',
      'earliestBy',
      'priceLastFixDayBasedOn',
      'optionsToFix',
      'fixationMethod'
    ],
    Absolute: ['priceDf', 'priceUnitId', 'fxBasisToPayin', 'instrumentId', 'instrument', 'valuationPriceUnitId', 'valuationPriceUnit']
  };

  pricingList = {
    'pricingFormulaId': [Validators.required, loadingValidator()],
    'pricingStrategy' : [Validators.required],
    'priceDf': [Validators.required, Validators.min(0)],
    'priceUnitId': [Validators.required, loadingValidator()],
    'fxBasisToPayin': [Validators.required],
    'differentialPrice': [Validators.required],
    'differentialPriceUnit': [Validators.required, loadingValidator()],
    'priceContractDefId': [Validators.required],
    'futureInstrumentText': [Validators.required],
    'priceFutureContractId': [Validators.required, , loadingValidator()],
    'priceMonthText': [Validators.required],
    'futurePrice': [Validators.required],
    'futurePriceUnitId': [Validators.required, loadingValidator()],
    'basisPrice': [Validators.required],
    'basisPriceUnitId': [Validators.required, loadingValidator()],
    'fxInstToBasis': [Validators.required],
    'priceInclusiveOfTax': [Validators.required],
    'earliestBy': [Validators.required],
    'priceLastFixDayBasedOn': [Validators.required],
    'optionsToFix': [Validators.required],
    'fixationMethod': [Validators.required]
  };

  ngAfterViewInit() {
    let chk1: any = document
      .getElementById('paymentDueDate')
      .getElementsByClassName('mydp');
    this.paymentDueDateStyle = chk1[0].style;
    let chk2: any = document
      .getElementById('deliveryFromDate')
      .getElementsByClassName('mydp');
    this.deliveryFromDateStyle = chk2[0].style;
    chk2[0].getElementsByClassName("selection")[0].style['padding-left'] = '3.5px';
    chk2[0].getElementsByClassName("btnpicker")[0].style['width'] = '22px';
    let chk3: any = document
      .getElementById('deliveryToDate')
      .getElementsByClassName('mydp');
    this.deliveryToDateStyle = chk3[0].style;
    chk3[0].getElementsByClassName("selection")[0].style['padding-left'] = '3.5px';
    chk3[0].getElementsByClassName("btnpicker")[0].style['width'] = '22px';
    let chk4: any = document
      .getElementById('customEventDate')
      .getElementsByClassName('mydp');
      this.customEventDateStyle = chk4[0].style;
  }

  valuationValid = true;
  internalContractRef
  navigationId
  initLoader = true;
  itemTxtValues = {}
  optionalFieldsRecommendation
  contractSaveInProgress = false;
  isRenewable
  valuationData
  singleTolerance = false;
  cloneItem: boolean = false;
  range:any;
  gmrData:any;
  savePreviousItemQty:any;
  showPaymentEventDateAndName = false;
  errorSubscriber

  secondLegContractDetails

  productBaseQtyUnitId

  splitsAvailableForItem
  gmrAvailableForItem

  optionalLabel = "( optional )"
  destinationOptional = false;
  originationOptional = false;
  disableDensityFields = false;

  contractItemValuationDTO

  constructor(
    private rs:RecommendationService,
    private workflowModal:ModalService,
    private appService:ApplicationService,
    private componentService:ComponentService,
    private nlp: NLPService,
    private confirmationService: ConfirmationService,
    private dch: DropdownChangeHandlerService,
    private cs: ContractService,
    private us: UtilService,
    private pricingConfigService: PricingService,
    private ps: PercentService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private mdm: MasterDataService,
    private http: HttpClient,
    private cos: ContractObjectService,
    private as: ApprovalService,
    private itemNoService: ItemNoService,
    private PaymentAndEventService: PaymentDueDateAndEventDateService
  ) {

    this.errorSubscriber = this.cs.reqFailedObs.subscribe(err => {
      this.apiCalled = false;
      this.reqFailedPopup.open(err);
    });

    this.FormData = this.route.snapshot.parent.data.FormData;
    this.appObject = this.FormData.appObject;
    this.fields = this.FormData.fields;
    this.fields.optionLoadCity = [];
    this.fields.optionDischargeCity = [];
    this.action = this.FormData.action;
    this.contractId = this.route.snapshot.params.id;
    this.itemNo = parseInt(this.route.snapshot.params.itemNo);
    this.ps.changedItemNo(this.itemNo);
    this.new_item = this.route.snapshot.queryParams.newItem;
    if(this.route.snapshot.queryParams && this.route.snapshot.queryParams.hasOwnProperty('cloneItem')){
      this.cloneItem = true;
    }
    //this.cloneItem = parseInt(this.route.snapshot.queryParams.cloneItem);
    this.itemDetails_form = this.fb.group({
      productId: [null, Validators.required],
      quality: [null, [Validators.required, loadingValidator()]],
      densityFactor: [null],
      densityMassQtyUnitId: [null],
      densityVolumeQtyUnitId: [null],
      productSpecs: [null],
      itemQty: [null, [Validators.required, Validators.min(0.00001)]],
      itemQtyUnitId: [null, [Validators.required, loadingValidator()]],
      dailyMonthly : [null],
      dailyMonthlyQty : [null],
      dailyMonthlyUnit : {value: null, disabled: true},
      tolerance: [null],
      toleranceMax : [null, Validators.required],
      toleranceMin : [null, Validators.required],
      toleranceType: [null, Validators.required],
      toleranceLevel: [null, Validators.required],
      qualityPdScheduleId: [null],
      pricing: this.fb.group({
        priceTypeId: [null, [Validators.required, loadingValidator()]], //priceType: ['Flat'],
        pricingStrategy: [null],
        pricingFormulaId: [null],
        priceDf: [null], //price: [null],
        priceUnitId: [null],
        fxBasisToPayin: [null],
        differentialPrice: [null],
        differentialPriceUnit: [null],
        payInCurId: [null, Validators.required],
        priceContractDefId: [null, loadingValidator()], //futureInstrument : [null],
        futureInstrumentText: [null],
        priceFutureContractId: [null], //priceMonth : [null],
        priceMonthText: [null],
        futurePrice: [null],
        futurePriceUnitId: [null], //futurePriceUnit : [null],
        basisPrice: [null],
        basisPriceUnitId: [null], //basisPriceUnit : [null],
        fxInstToBasis: [null],
        priceInclusiveOfTax: [null],
        earliestBy: [null], //priceFixEarliestBy : [null],
        priceLastFixDayBasedOn: [null], //priceFixLatestBy : [null],
        optionsToFix: [null], //priceFixOption : [null],
        fixationMethod: [null], //priceFixMethod : [null]
        instrumentId: [null],
        instrument: [null],
        valuationPriceUnitId: [null],
        valuationPriceUnit: [null],
        splitFormData: [[]]
      }),
      
      shipmentMode: [null, Validators.required],
      shipVesselDetails: [null],

      deliveryFromDate: [null, Validators.required],
      deliveryToDate: [null, Validators.required],

      loadingLocationGroupTypeId: [null, Validators.required],
      originationCityId: [null, [Validators.required]],
      originationCountryId: [null, Validators.required],
      destinationLocationGroupTypeId: [null, Validators.required],
      destinationCityId: [null, Validators.required],
      destinationCountryId: [null, Validators.required],
      paymentDueDate: [null, Validators.required],

      profitCenterId: [null, Validators.required],
      strategyAccId: [null, Validators.required],

      taxScheduleCountryId: [null, Validators.required],
      taxScheduleStateId: [null, [loadingValidator()]],
      taxScheduleId: [null, [Validators.required, loadingValidator()]],

      inspectionCompany: [null],

      latePaymentInterestDetails: this.fb.group({
        physicalItemInterestId: [1],
        interestRateType: [null],
        variableType: [null],
        //variableTypeText: ["1-M-LIBORUSD"],
        interestRate: [null],
        isCompounding: [true],
        frequency: [null]
      }),

      unweighedPiPctType: [null],
      unweighedPiPctValue: [null],
      laycanStartDate: [null],
      laycanEndDate: [null],
      optionalLoadingDetails: this.fb.array([]),
      optionalDischargeDetails: this.fb.array([]),

      valuationFormula: [null],

      isOptionalFieldsEnabled: [false],

      isRenewable: [null],
      isRinContract: [null],
      rinEquivalanceValue: [null],
      rinQuantity: [null],
      rinUnit: [null],

      packingTypeId: [null, [loadingValidator()]],
      packingSizeId: [null, [loadingValidator()]],

      customEvent: [null],
      customEventDate : [null],

      holidayRule: [null],

      cpContractItemId: [null],
      qualityLongDesc: [null],
      qualityShortDesc: [null],
      
      internalProfitCenterId: [null],
      internalStrategyAccId: [null],

      contractPriceQtyBaseQtyConv: [null],

      contractItemValuationDTO: this.fb.group({
        internalItemValuationId: [null],
        valuationIncotermId: [null],
        valuationCountryId: [null],
        valuationCityId: [null],
        locGroupTypeId: [null],
      }),

      totalPrice: [null],
      ticketNumber: [null],
      isGrossOrNetQty: ["N"]
    }, { validators: toleranceMaxValidator() });

    this.addOptionLoad();
    this.addOptionDischarge();

    this.contractItemValuationDTO =  this.itemDetails_form.get('contractItemValuationDTO') as FormGroup;

  }

  ngOnInit() {
    if (this.action === 'create' || this.action === 'clone') {
      this.navigationId = this.contractId;
      this.cos.onLoadGetContractObject(this.contractId, this.action)
        .pipe(
          mergeMap((autoSaveData: any) => {
            this.getItemIndex(autoSaveData);
            let propsLen = Object.keys(autoSaveData.itemDetails[this.itemIndex]).length;
            if (this.new_item && propsLen <= 1) {
              return this.initializeRecommendation(autoSaveData);
            } else {
              return of([autoSaveData, 'no-recommendation']).pipe(tap(e => { console.log('no-recommendation') }));
            }
          }),
          map((contract_recc: any) => {
            let autoSaveContract = contract_recc[0];
            let recommendation = contract_recc[1];
            if (recommendation !== 'failed' && recommendation !== 'no-recommendation') {
              autoSaveContract.itemDetails[this.itemIndex] = { ...recommendation, itemNo: this.itemNo };
              return autoSaveContract;
            } else {
              this.recommendationsList = {};
              return autoSaveContract;
            }
          })
        )
        .subscribe((contractData: any) => {
          this.updateFields(contractData);
          this.as.callApprovalAPI();
        });
    } else {
      this.internalContractRef = this.FormData.id;
      this.navigationId = this.internalContractRef;
      let getContractObs
      switch (this.appObject) {
        case 'contract':
          getContractObs = this.cs.getSavedContract(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contractId = data._id;
            if(Array.isArray(data.itemDetails) && data.itemDetails.length > 0){
              for(let i=0; i < data.itemDetails.length; i++){
                    if(data.itemDetails[i].itemNo == this.itemNo){
                     this.internalContractItemRefNo = {"internalContractItemRefNo" : data.itemDetails[i].internalItemRefNo, "productId" : data.itemDetails[i].productId, "itemQty" : data.itemDetails[i].itemQtyUnitId};
                    }
              }
            }
            this.updateFields(data);
          });
          break;
        case 'template':
          getContractObs = this.cs.getTemplateData(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contractId = data._id;
            this.updateFields(data);
          });
          break;
        case 'draft':
          getContractObs = this.cs.getDraftContract(this.internalContractRef)
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contractId = data._id;
            this.updateFields(data);
            this.as.callApprovalAPI();
          });
          break;
      }
    }
  }
  
  optionalEnabled(){
    return this.itemDetails_form.get('isOptionalFieldsEnabled').value;
  }

  optionalFlagChanged(value){
    this.itemDetails_form.get('isOptionalFieldsEnabled').setValue(value);
  }

  getValue(field) {
    return this.itemDetails_form.get(field).value;
  }

  getControl(field, type = null) {
    if (type) {
      let _temp = this.itemDetails_form.get(type) as FormArray;
      return _temp.get(field);
    } else {
      return this.itemDetails_form.get(field);
    }
  }

  getPricingGroup() {
    return this.itemDetails_form.get('pricing') as FormArray;
  }

  loadPricing() {
    let _pricing = this.itemDetails_form.get('pricing') as FormArray;
    let payInCur = _pricing.get('payInCurId').valueChanges.pipe(startWith(_pricing.get('payInCurId').value));
    let product = this.itemDetails_form.get('productId').valueChanges.pipe(startWith(this.itemDetails_form.get('productId').value));
    combineLatest(product, payInCur)
      .pipe(skip(1))
      .subscribe(val => {
        if (val[0] && val[1]) {
          this.resetPriceTypePriceUnits(val);
        } else {
          _pricing.get('priceUnitId').setValue(null);
          this.fields.priceUnitId.options = [];
        }
      });
      
    _pricing.get('priceTypeId').valueChanges.subscribe(data => {
      if (data && data !== 'loading') {
        this.priceTypeId = data;
        Object.keys(this.pricingList).forEach(field => {
          let _ele = _pricing.get(field);
          _ele.markAsUntouched();
          _ele.reset();
          _ele.setErrors(null);
        });
        this.contractData.itemDetails[this.itemIndex].formulaPriceDetails = null;
        _pricing.get('payInCurId').setValidators([Validators.required]);
        this.perPriceTypeValidationList[data].forEach(element => {
          _pricing.get(element).setValidators(this.pricingList[element]);
        });
        this.setInstrumentHook();
        this.disableBasisPrice();
        this.setFXToggle();
      }
    });

    this.formulaChangeSubscriber = this.pricingConfigService.contractFormula.subscribe((formulaId: any) => {
      if (formulaId) {
        this.cs.getFormulaName(formulaId).subscribe((data: any) => {
          if (this.pricingTriggerFor === 'priceTypeId') {
            let pricingGroup = this.itemDetails_form.get(
              'pricing'
            ) as FormArray;
            pricingGroup.get('pricingFormulaId').setValue(formulaId);
            this.pricingFormulaName = data[0].formulaName;
          }else if (this.pricingTriggerFor[0] === 'tieredPricing') {

            let splitIndex = this.pricingTriggerFor[1];

            if(this.pricingFormulaNameArray[splitIndex]){
              this.pricingFormulaNameArray[splitIndex] = data[0].formulaName
              this.splitFormula[splitIndex] = formulaId
            }
            else{
              this.pricingFormulaNameArray.push(data[0].formulaName);
              this.splitFormula.push(formulaId)
            }

            this.getSplitFormulaData()

            let currentSplitRange = this.splitRanges[splitIndex];	

            this.splitFormData[splitIndex] = {	
              ...this.splitFormData[this.pricingTriggerFor[1]],
              "splitId" : this.pricingTriggerFor[1]+1,	
              "splitCeiling" : currentSplitRange.rangeEnd,	
              "splitFloor" : currentSplitRange.rangeStart,	
              "formulaId" : formulaId,	
              "formulaName": data[0].formulaName,
              'itemNumber': String(this.itemNo),
              'contractDraftId': this.contractId
            }	

            if(this.splitFormData[splitIndex]._id){
              this.splitFormData[splitIndex]["ui_action"] = "edit";
            }

            console.log('after adding formula to the split');
            console.log(this.splitFormData);
            this.getPricingGroup().get('splitFormData').setValue(this.splitFormData);
          }
        });
      }
    });

    this.itemDetails_form.get('quality').valueChanges.subscribe(quality=>{
      if(quality){
        this.cs.getQualityDetails(quality).subscribe((res:any)=>{
          let {instrumentId, instrument, valuationPriceUnitId, valuationPriceUnit} = res.data;
          // "instrumentId": "DIM-M0-3650",
          // "instrument": "Broker Instrument Der",
          // "valuationPriceUnitId": "PUM-M0-2622",
          // "valuationPriceUnit": "USC/BU.60",
          let _pricing = this.itemDetails_form.get('pricing');
          _pricing.patchValue({
            "instrumentId": instrumentId,
            "instrument": instrument,
            "valuationPriceUnitId": valuationPriceUnitId,
            "valuationPriceUnit": valuationPriceUnit,
          })
        })
      }
    })

    _pricing.get('pricingStrategy').valueChanges.subscribe(res => {
      if(res === "pricingStrategy-001" && this.itemDetails_form.getRawValue().pricing.splitFormData.length > 0){
        this.componentService.deleteItemSplits(this.itemDetails_form.getRawValue().pricing.splitFormData)
        .subscribe((res:any)=>{
          this.splitFormData = [];
          this.getPricingGroup().get('splitFormData').setValue([]);
        });
      }
    })

  }

  setInstrumentHook() {
    let _pricing = this.getPricingGroup();
    if (this.priceTypeId !== 'Flat' && !this.checkingInstrument) {
      _pricing.get('priceContractDefId').valueChanges.subscribe(data => {
        if (data) {
          _pricing.get('priceFutureContractId').setValue('loading');
          this.mdm
            .getComboKeys('periodMonthsListByInstrument', [data])
            .subscribe(res => {
              this.fields['priceFutureContractId'].options =
                res['periodMonthsListByInstrument'];
              _pricing.get('priceFutureContractId').setValue(null);
            });
        } else {
          this.fields['priceFutureContractId'].options = [];
          _pricing.get('priceFutureContractId').setValue(null);
        }
      });
      this.checkingInstrument = true;
    }
  }

  disableBasisPrice() {
    let _pricing = this.getPricingGroup();
    let basisEnablePriceTypes = [""]
    if (this.priceTypeId === 'Futures First') {
      _pricing.get('basisPrice').disable();
    } else if (this.priceTypeId === 'On Call Basis Fixed' || this.priceTypeId === 'Fixed'){
      _pricing.get('basisPrice').enable();
    }
  }

  getPriceUnitText(id){
    let option
    if(id && this.fields.priceUnitId.options){
      option = this.fields.priceUnitId.options.find(ele => id === ele.key);
    }
    if(option){
      return option.value;
    }else{
      return null;
    }
  }
  
  getPayInCurrencyText(id){
    let option = this.fields.payInCurId.options.find(ele => id === ele.key);
    if(option){
      return option.value;
    }else{
      return null;
    }
  }

  hookFixedValueChanges(){
    let _pricing = this.getPricingGroup();
    _pricing.get('futurePriceUnitId').valueChanges.subscribe(data=>{
      this.setFXToggle();
    });
    _pricing.get('basisPriceUnitId').valueChanges.subscribe(data=>{
      this.setFXToggle();
      if(this.priceTypeId === 'Fixed'){
        _pricing.get('priceUnitId').setValue(data);
      }
    });
    _pricing.get('payInCurId').valueChanges.subscribe(data=>{
      this.setFXToggle();
    });
    _pricing.get('priceUnitId').valueChanges.subscribe(data=>{
      this.setFXToggle();
    });
  }

  setFXToggle(){
    if(!this.checkingFixedFx){
      this.hookFixedValueChanges();
      this.checkingFixedFx = true;
    }
    let _pricing = this.getPricingGroup();
    if (this.priceTypeId === 'Fixed') {    
      
      let futurePriceUnitText = this.getPriceUnitText(_pricing.get('futurePriceUnitId').value);
      let basisPriceUnitText = this.getPriceUnitText(_pricing.get('basisPriceUnitId').value);
      let payInCurrencyText = this.getPayInCurrencyText(_pricing.get('payInCurId').value);
      
      if(futurePriceUnitText && basisPriceUnitText && payInCurrencyText){
        let futurePriceCurrency = futurePriceUnitText.split('/')[0];
        let basisPriceCurrency = basisPriceUnitText.split('/')[0];
        let fxBasisToPayin = _pricing.get('fxBasisToPayin');
        let fxInstToBasis = _pricing.get('fxInstToBasis');

        if(futurePriceCurrency === basisPriceCurrency){
          fxInstToBasis.setValue(1);
          fxInstToBasis.disable();
        }else{
          fxInstToBasis.enable();
        }

        if(payInCurrencyText === basisPriceCurrency){
            fxBasisToPayin.setValue(1);
            fxBasisToPayin.disable();
        }else{
          fxBasisToPayin.enable();
        }
        
        //this.calcFixedContractPrice(fxInstToBasis,fxBasisToPayin);
        
      }
    }
    if (this.priceTypeId === 'Flat') {
  
      let contractPriceUnitText = this.getPriceUnitText(_pricing.get('priceUnitId').value);
      let payInCurrencyText = this.getPayInCurrencyText(_pricing.get('payInCurId').value);
      
      if(contractPriceUnitText && payInCurrencyText){
        let contractPriceCurrency = contractPriceUnitText.split('/')[0];
        let fxBasisToPayin = _pricing.get('fxBasisToPayin');

        if(payInCurrencyText === contractPriceCurrency){
          fxBasisToPayin.setValue(1);
          fxBasisToPayin.disable();
        }else{
          fxBasisToPayin.enable();
        }
      }
    }
  }

  calcFixedContractPrice(fxInst, fxBasis){
    let _pricing = this.getPricingGroup();
    let fixedPrice = _pricing.get('futurePrice').value * fxInst.value + _pricing.get('basisPrice').value * fxBasis.value;
    _pricing.get('priceDf').setValue(fixedPrice);
  }

  resetPriceTypePriceUnits(val) {
    let _pricing = this.getPricingGroup();
    if (this.priceTypeId) {
      priceTypePriceUnits[this.priceTypeId].forEach(element => {
        _pricing.get(element).setValue('loading');
      });
    }
    this.mdm.getComboKeys('productPriceUnit', val)
    .pipe(
      mergeMap((res:any) => {
        if (res.productPriceUnit && res.productPriceUnit.length === 0) {
          return throwError('Error!');
        }
        return of(res);
      }),
      retry(2)
    )
    .subscribe((res: any) => {
      this.fields.priceUnitId.options = res.productPriceUnit;
      this.setFXToggle();
      if (this.priceTypeId) {
        priceTypePriceUnits[this.priceTypeId].forEach(element => {
          _pricing.get(element).setValue(null);
        });
      }
    });
  }

  checkSplitPricing(){
    let pricingStrategy = this.currentItem.pricing && this.currentItem.pricing.pricingStrategy;
    if(pricingStrategy === 'pricingStrategy-002' || pricingStrategy === 'pricingStrategy-003'){
      if(this.currentItem.pricing.splitFormData && this.currentItem.pricing.splitFormData.length>0){
        this.splitFormData = this.currentItem.pricing.splitFormData;
        this.tieredDataMassage(this.splitFormData);
        this.getPricingGroup().get('splitFormData').setValue(this.splitFormData);
      }else{
        if(this.internalContractRef && this.appObject === 'contract'){
          this.componentService.getTieredData(this.internalContractRef).subscribe((res:any)=>{
            this.initializeSplits(res);
          });
        }else{
          this.componentService.getTieredDataBasedonDraftId(this.contractData).subscribe((res:any)=>{
            this.initializeSplits(res);
          })
        }
      }
    }
  }

  initializeSplits(res){
    for(let i=0; i < res.data.length; i++){
      if(res.data[i].itemNumber == this.itemNo){
        this.splitFormData.push(res.data[i])
        if(!this.contractData.itemDetails[this.itemIndex].pricing.splitFormData){
          this.contractData.itemDetails[this.itemIndex].pricing.splitFormData = []; 
        }
        this.contractData.itemDetails[this.itemIndex].pricing.splitFormData.push(res.data[i]);
      }
    }	
    this.getPricingGroup().get('splitFormData').setValue(this.splitFormData);
    this.tieredDataMassage(this.splitFormData);
    this.cos.changeCurrentContractObject(this.contractData);
  }

  initializePricing() {
    let payInCurId;
    let productId;
    let priceContractDefId;
    if (this.currentItem.hasOwnProperty('pricing')) {
      if (this.currentItem.pricing.priceTypeId) {
        this.priceTypeId = this.currentItem.pricing['priceTypeId'];
        this.onLoadSetPricingValidation();
      }
      payInCurId = this.currentItem.pricing['payInCurId'];
      productId = this.currentItem['productId'];
      this.mdm.getComboKeys('productPriceUnit', [productId, payInCurId])
      .pipe(
        mergeMap((res:any) => {
          if (res.productPriceUnit && res.productPriceUnit.length === 0) {
            return throwError('Error!');
          }
          return of(res);
        }),
        retry(2)
      )
      .subscribe((res: any) => {
        this.fields.priceUnitId.options = res.productPriceUnit;
        this.setFXToggle();
      });
      if (this.currentItem.pricing.hasOwnProperty('priceContractDefId')) {
        priceContractDefId = this.currentItem.pricing['priceContractDefId'];
        this.mdm.getComboKeys('periodMonthsListByInstrument', [priceContractDefId]).subscribe(res => {
          this.fields['priceFutureContractId'].options = res['periodMonthsListByInstrument'];
          if (this.currentItem.pricing.priceFutureContractId && res['periodMonthsListByInstrument']) {
            let keyValue = res['periodMonthsListByInstrument'].find(ele => ele.key === this.currentItem.pricing['priceFutureContractId']);
            this.setTextToField('priceMonthText', 'pricing', keyValue.value);
            this.setInstrumentHook();
          }
        });
      }
    }
      
    if (this.currentItem.pricing && this.currentItem.pricing.pricingFormulaId) {
      this.cs
        .getFormulaName(this.currentItem.pricing.pricingFormulaId)
        .subscribe((data: any) => {
          this.pricingFormulaName = data[0].formulaName;
        });
    }
    if (this.currentItem.valuationFormula) {
      this.cs
        .getFormulaName(this.currentItem.valuationFormula)
        .subscribe((data: any) => {
          this.valuationFormulaName = data[0].formulaName;
        });
    }
    this.disableBasisPrice();
    this.setFXToggle();
  }

  onLoadSetPricingValidation() {
    let _pricing = this.itemDetails_form.get('pricing') as FormArray;
    _pricing.get('payInCurId').setValidators([Validators.required]);
    _pricing.get('priceTypeId').setValidators([Validators.required, loadingValidator()]);
    this.perPriceTypeValidationList[this.priceTypeId].forEach(element => {
      _pricing.get(element).setValidators(this.pricingList[element]);
    });
  }

  loadCombos() {
    let dependsOn_originCountry = [
      this.currentItem['originationCountryId'],
      this.currentItem['loadingLocationGroupTypeId']
    ];
    let dependsOn_destCountry = [
      this.currentItem['destinationCountryId'],
      this.currentItem['destinationLocationGroupTypeId']
    ];
    let mdmData = [];
    if (
      this.currentItem.originationCountryId &&
      this.currentItem.loadingLocationGroupTypeId
    ) {
      mdmData.push({
        serviceKey: 'cityComboDataFromDB',
        dependsOn: dependsOn_originCountry
      });
    }
    if (this.contractData.incotermId) {
      mdmData.push({
        serviceKey: 'incoTermLocationGroupType',
        dependsOn: [this.contractData.incotermId]
      });
    }
    if (this.contractData.legalEntityId) {
      mdmData.push({
        serviceKey: 'userProfitCenterListLegalEntity',
        dependsOn: [this.contractData.legalEntityId]
      });
    }
    if (this.currentItem.productId) {
      mdmData.push({
        serviceKey: 'qualityComboDropDrown',
        dependsOn: [this.currentItem.productId]
      });
    }
    if (this.contractData.contractType && this.contractData.dealType) {
      let dependsOn = ["ALL", this.contractData.dealType]
      mdmData.push({
        serviceKey: 'businessPartnerCombo',
        dependsOn: dependsOn
      });
    }

    if (
      this.currentItem.productId &&
      this.currentItem.quality &&
      this.currentItem.pricing && this.currentItem.pricing.payInCurId
    ) {
      mdmData.push({
        serviceKey: 'pdNewscheduleList',
        dependsOn: [
          this.currentItem.productId,
          this.currentItem.pricing.payInCurId,
          this.currentItem.quality
        ]
      });
    }
    if (this.currentItem.taxScheduleCountryId){
      mdmData.push({serviceKey: 'listOfTaxSchedules', dependsOn:[this.currentItem.taxScheduleCountryId] });
    }
    this.mdm.getMultipleMdmData(mdmData).subscribe(
      (data: any) => {
        this.fields.quality.options = data.qualityComboDropDrown;
        //this.fields.qualityPdScheduleId.options = data.pdNewscheduleList;
        this.fields.loadingLocationGroupTypeId.options =
          data.incoTermLocationGroupType;
        this.fields.destinationLocationGroupTypeId.options =
          data.incoTermLocationGroupType;
        this.fields.locGroupTypeId.options = data.incoTermLocationGroupType;
        this.fields.profitCenterId.options = data.userProfitCenterListLegalEntity;
        this.fields.originationCityId.options = data.cityComboDataFromDB;
        this.fields.cpProfileId.options = data.businessPartnerCombo;
        this.fields.taxScheduleId.options = data.listOfTaxSchedules;
      },
      error => {
        this.mdmFailure.open('mdm failed to load, please refresh page');
      }
    );
    if (
      this.currentItem.destinationCountryId &&
      this.currentItem.destinationLocationGroupTypeId
    ) {
      this.mdm
        .getCityData(dependsOn_destCountry[0], dependsOn_destCountry[1])
        .subscribe((data: any) => {
          this.fields.destinationCityId.options = data.cityComboDataFromDB;
        });
    }
    if (
      this.currentItem.contractItemValuationDTO &&
      this.currentItem.contractItemValuationDTO.valuationCountryId &&
      this.currentItem.contractItemValuationDTO.locGroupTypeId
    ) {
      this.mdm
        .getCityData(this.currentItem.contractItemValuationDTO.valuationCountryId, this.currentItem.contractItemValuationDTO.locGroupTypeId)
        .subscribe((data: any) => {
          this.fields.valuationCityId.options = data.cityComboDataFromDB;
        });
    }
    this.mdm.getComboKeys("taxScheduleState",[this.currentItem.taxScheduleCountryId]).subscribe((res:any)=>{
      this.fields.taxScheduleStateId.options = res.cityComboDataFromDB;
    })
    this.getAllComboKeys(
      'destinationCityId',
      'destinationCountryId',
      dependsOn_destCountry,
      0,
      'cityComboDataFromDB'
    );
    this.getAllComboKeys(
      'originationCityId',
      'originationCountryId',
      dependsOn_originCountry,
      0,
      'cityComboDataFromDB'
    );
    this.getAllComboKeys(
      'destinationCityId',
      'destinationLocationGroupTypeId',
      dependsOn_destCountry,
      1,
      'cityComboDataFromDB'
    );
    this.getAllComboKeys(
      'originationCityId',
      'loadingLocationGroupTypeId',
      dependsOn_originCountry,
      1,
      'cityComboDataFromDB'
    );
    this.getAllComboKeys('taxScheduleId','taxScheduleCountryId',[],0,'listOfTaxSchedules');
    this.getAllComboKeys('taxScheduleStateId','taxScheduleCountryId',[],0,'taxScheduleState');

    this.getValuationCombos();
  }

  getAllComboKeys(
    dependant,
    changingKey,
    dependsOn,
    changingKeyIndex,
    serviceKey
  ) {
    this.itemDetails_form.get(changingKey).valueChanges.subscribe(res => {
      dependsOn[changingKeyIndex] = res;
      if(dependsOn.every(val=>!!val)){
        this.itemDetails_form.get(dependant).setValue('loading');
        this.mdm.getComboKeys(serviceKey, dependsOn).subscribe((resKeys: any) => {
          this.fields[dependant].options = resKeys[serviceKey];
          this.itemDetails_form.get(dependant).setValue(null);
          if(dependant === 'taxScheduleId'){
            this.itemDetails_form.get(dependant).setValue(this.fields[dependant].options[0].key);
          }
        });
      }
    });
  }

  getValuationCombos(){
    let valuationGroup = this.itemDetails_form.get('contractItemValuationDTO') as FormGroup;
    valuationGroup.get('valuationCountryId').valueChanges.subscribe(res => {
      let locGroupTypeId = valuationGroup.get('locGroupTypeId').value;
      if(res && locGroupTypeId){
        this.mdm.getComboKeys('cityComboDataFromDB', [res, locGroupTypeId]).subscribe((resKeys: any) => {
          this.fields['valuationCityId'].options = resKeys['cityComboDataFromDB'];
          valuationGroup.get('valuationCityId').setValue(null);
        });
      }
    });
    valuationGroup.get('locGroupTypeId').valueChanges.subscribe(res => {
      let valuationCountryId = valuationGroup.get('valuationCountryId').value;
      if(res && valuationCountryId){
        this.mdm.getComboKeys('cityComboDataFromDB', [valuationCountryId, res]).subscribe((resKeys: any) => {
          this.fields['valuationCityId'].options = resKeys['cityComboDataFromDB'];
          valuationGroup.get('valuationCityId').setValue(null);
        });
      }
    });
  }

  cleanPriceTypes(priceTypes) {
    return priceTypes
      .filter((types, i) => {
        return this.allowedPriceTypes.includes(types.key);
      })
      .map(types => {
        if (types.key === 'FormulaPricing') {
          return { key: 'FormulaPricing', value: 'Formula/Index' };
        } else {
          return types;
        }
      });
  }

  loadProductCombos() {
    let productId = this.currentItem.productId;
    if (productId) {
      let data = [
        { serviceKey: 'productRule', dependsOn: [productId] },
        { serviceKey: 'productpricetypelist', dependsOn: [productId] },
        { serviceKey: 'qualityComboDropDrown', dependsOn: [productId] },
        { serviceKey: 'productDerivativeInstrument', dependsOn: [productId] },
        { serviceKey: 'physicalproductquantitylist', dependsOn: [productId] },
        { serviceKey: 'phyPackingtypesizeByCItemOrProductList', dependsOn: [productId] }
      ];
      this.mdm.getMultipleMdmData(data).subscribe(res => {
        this.fields['quality'].options = res['qualityComboDropDrown'];
        this.fields['priceTypeId'].options = this.cleanPriceTypes(
          res['productpricetypelist']
        );
        this.fields['priceContractDefId'].options =
          res['productDerivativeInstrument'];
        this.fields['itemQtyUnitId'].options =
          res['physicalproductquantitylist'];
        if (this.currentItem.hasOwnProperty('pricing') && this.currentItem.pricing.priceContractDefId && res['physicalproductquantitylist']) {
          let keyValue = res['productDerivativeInstrument'].find(ele => ele.key === this.currentItem.pricing['priceContractDefId']);
          this.setTextToField('futureInstrumentText', 'pricing', keyValue.value)
        }
        this.checkRenewable(res);
        this.fields['packingTypeId'].options = res['phyPackingtypesizeByCItemOrProductList'];
        if(res['phyPackingtypesizeByCItemOrProductList'] && res['phyPackingtypesizeByCItemOrProductList'].length > 0 && !this.itemDetails_form.get('packingTypeId').value){
          this.itemDetails_form.get('packingTypeId').setValue(res['phyPackingtypesizeByCItemOrProductList'][0].key);
        }
        if(this.appObject === 'contract' && this.action === 'edit'){
          this.getGmrDetails();
        }
      });
      this.mdm.getProductBaseQtyUnitId(productId).subscribe((res:any)=>{
        this.productBaseQtyUnitId = res.data.baseQuantityUnit;
      })
    }
  }

  onEditDisablePricingFields(){
    if(this.appObject === 'contract' && this.action === 'edit' && this.priceTypeId){     
      this.getPricingGroup().get('priceTypeId').disable({ emitEvent: false });
      this.getPricingGroup().get('payInCurId').disable({ emitEvent: false });
      this.getPricingGroup().get('priceUnitId').disable({ emitEvent: false });
      this.getPricingGroup().get('pricingStrategy').disable({ emitEvent: false });
      let priceType = this.getPricingGroup().get('priceTypeId').value;
      if(priceType === 'Flat'){
        this.getPricingGroup().get('priceDf').disable({ emitEvent: false });
      }
      if(priceType === 'On Call Basis Fixed'){
        this.getPricingGroup().get('priceContractDefId').disable({ emitEvent: false });
        this.getPricingGroup().get('priceFutureContractId').disable({ emitEvent: false });
        this.getPricingGroup().get('basisPrice').disable({ emitEvent: false });
        this.getPricingGroup().get('earliestBy').disable({ emitEvent: false });
        this.getPricingGroup().get('priceLastFixDayBasedOn').disable({ emitEvent: false });
        this.getPricingGroup().get('optionsToFix').disable({ emitEvent: false });
      }
    }
  }
  
  checkForItemQty(){
    var that = this;
    this.itemDetails_form.get('itemQty').valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(res => {
      if(this.checkItemQty){
        if(res < this.savePreviousItemQty){
          this.showWarning = true;    
          this.errorMsg = 'Item Qty cannot be reduced as GMR is created';
          this.itemDetails_form.get('itemQty').setValue(this.savePreviousItemQty);
        }
      }else{
        if(res && that.itemDetails_form.get("toleranceType").value){
          if(that.itemDetails_form.get("toleranceType").value === 'Percentage'){
            this.range = res + (res*(that.itemDetails_form.get("toleranceMax").value/100));
           }else{
            this.range = res + that.itemDetails_form.get("toleranceMax").value;
           }
        }
        let formVal = this.itemDetails_form.getRawValue();
        this.calculateDailyMonthlyQty(res, formVal.deliveryFromDate, formVal.deliveryToDate, formVal.dailyMonthly);
      }
    })

    this.itemDetails_form.get('toleranceMax').valueChanges.subscribe(res => {
      if(res && that.itemDetails_form.get("toleranceType").value){
        if(that.itemDetails_form.get("toleranceType").value === 'Percentage'){
          this.range =that.itemDetails_form.get("itemQty").value  + (that.itemDetails_form.get("itemQty").value*(res/100));
         }else{
          this.range = that.itemDetails_form.get("itemQty").value + res;
         }
      } 
    })

    this.itemDetails_form.get('toleranceType').valueChanges.subscribe(res => {
      if(res === 'Percentage'){
        this.range =that.itemDetails_form.get("itemQty").value  + (that.itemDetails_form.get("itemQty").value*(that.itemDetails_form.get("toleranceMax").value/100));
      }else{
        this.range = that.itemDetails_form.get("itemQty").value + that.itemDetails_form.get("toleranceMax").value;
      }
    })
     
  }

  checkForItemQtyUnit(){
    this.itemDetails_form.get('itemQtyUnitId').valueChanges.subscribe(res => {
      let dailyMonthlyUnit = this.itemDetails_form.get('dailyMonthlyUnit');
      dailyMonthlyUnit.enable()
      dailyMonthlyUnit.setValue(res);
      dailyMonthlyUnit.disable();
      this.getConversionFactor();
    });
  }

  checkDailyMonthlyCalculation(){
    this.itemDetails_form.get('deliveryFromDate').valueChanges.subscribe(res => {
      let formVal = this.itemDetails_form.getRawValue();
      this.calculateDailyMonthlyQty(formVal.itemQty, res, formVal.deliveryToDate, formVal.dailyMonthly);
    });
    this.itemDetails_form.get('deliveryToDate').valueChanges.subscribe(res => {
      let formVal = this.itemDetails_form.getRawValue();
      this.calculateDailyMonthlyQty(formVal.itemQty, formVal.deliveryFromDate, res, formVal.dailyMonthly);
    });
    this.itemDetails_form.get('dailyMonthlyQty').valueChanges.subscribe(res => {
      let formVal = this.itemDetails_form.getRawValue();
      this.calculateItemQty(formVal.deliveryFromDate, formVal.deliveryToDate, formVal.dailyMonthly, res)
    });
    this.itemDetails_form.get('dailyMonthly').valueChanges.subscribe(res => {
      let formVal = this.itemDetails_form.getRawValue();
      this.calculateDailyMonthlyQty(formVal.itemQty ,formVal.deliveryFromDate, formVal.deliveryToDate, res)
    });
  }

  calculateItemQty(deliveryFromDate, deliveryToDate, dailyMonthly, dailyMonthlyQty){
    if(deliveryFromDate && deliveryToDate && dailyMonthly && dailyMonthlyQty){
      let duration = this.calcuateDuration(deliveryFromDate, deliveryToDate, dailyMonthly)
      let itemQty = Math.round(duration*dailyMonthlyQty);
      this.itemDetails_form.get('itemQty').setValue(itemQty, {emitEvent:false});
      this.updateSplitRangeForDailyMonthly(itemQty);
    }
  }

  updateSplitRangeForDailyMonthly(res){
    if(res && this.itemDetails_form.get("toleranceType").value){
      if(this.itemDetails_form.get("toleranceType").value === 'Percentage'){
        this.range = res + (res*(this.itemDetails_form.get("toleranceMax").value/100));
       }else{
        this.range = res + this.itemDetails_form.get("toleranceMax").value;
       }
    }
    if(this.checkItemQty == true){
      if(res < this.savePreviousItemQty){
         this.itemQtyHandle.open("Item Qty cannot be reduced as GMR is created");
      }
    }
  }

  calculateDailyMonthlyQty(itemQty, deliveryFromDate, deliveryToDate, dailyMonthly){
    if(itemQty && deliveryFromDate && deliveryToDate && dailyMonthly){
      let duration = this.calcuateDuration(deliveryFromDate, deliveryToDate, dailyMonthly)
      let dailyMonthlyQty = (itemQty/duration).toFixed(5);
      this.itemDetails_form.get('dailyMonthlyQty').setValue(dailyMonthlyQty, {emitEvent:false});
    }
  }

  calcuateDuration(deliveryFromDate, deliveryToDate, dailyMonthly){
    let m_deliveryFrom = this.us.getMomentDate(deliveryFromDate);
    let m_deliveryTo = this.us.getMomentDate(deliveryToDate).add(1,'days');
    let duration = 0;
    if(dailyMonthly === 'Daily'){
      let numOfDays = m_deliveryTo.diff(m_deliveryFrom, 'days');
      duration = numOfDays;
    }else if(dailyMonthly === 'Monthly'){
      let numOfMonths = m_deliveryTo.diff(m_deliveryFrom, 'months', true);
      duration = numOfMonths;
      if(m_deliveryFrom.isSame(m_deliveryTo, 'month')){
        let numOfDaysInTheMonth = m_deliveryFrom.daysInMonth();
        let numOfDays =  m_deliveryTo.diff(m_deliveryFrom, 'days');
        duration = numOfDays/numOfDaysInTheMonth;
      }
    }
    return duration;
  }
  
  checkProductChange() {
    this.itemDetails_form.get('productId').valueChanges.subscribe(res => {
      this.itemDetails_form.get('quality').setValue('loading');
      this.itemDetails_form.get('itemQtyUnitId').setValue('loading');
      let pricingGroup = this.itemDetails_form.get('pricing') as FormArray;
      pricingGroup.get('priceTypeId').setValue('loading');
      this.priceTypeId = null;
      pricingGroup.get('priceContractDefId').setValue('loading');
      this.itemDetails_form.get('packingTypeId').setValue('loading');
      if (res) {
        let data = [
          { serviceKey: 'productRule', dependsOn: [res] },
          { serviceKey: 'productpricetypelist', dependsOn: [res] },
          { serviceKey: 'qualityComboDropDrown', dependsOn: [res] },
          { serviceKey: 'productDerivativeInstrument', dependsOn: [res] },
          { serviceKey: 'physicalproductquantitylist', dependsOn: [res] },
          { serviceKey: 'phyPackingtypesizeByCItemOrProductList', dependsOn: [res] }
        ];
        this.mdm.getMultipleMdmData(data).subscribe(res => {
          this.fields['quality'].options = res['qualityComboDropDrown'];
          this.fields['priceTypeId'].options = this.cleanPriceTypes(
            res['productpricetypelist']
          );
          this.fields['priceContractDefId'].options = res['productDerivativeInstrument'];
          this.fields['itemQtyUnitId'].options = res['physicalproductquantitylist'];
          this.setAllProductDependantsToNull();
          this.checkRenewable(res);
          this.fields['packingTypeId'].options = res['phyPackingtypesizeByCItemOrProductList'];
          if(res['phyPackingtypesizeByCItemOrProductList'] && res['phyPackingtypesizeByCItemOrProductList'].length > 0){
            this.itemDetails_form.get('packingTypeId').setValue(res['phyPackingtypesizeByCItemOrProductList'][0].key);
          }
        });
        this.mdm.getProductBaseQtyUnitId(res).subscribe((res:any)=>{
          this.productBaseQtyUnitId = res.data.baseQuantityUnit;
        })
      } else {
        this.fields['quality'].options = [];
        this.fields['priceTypeId'].options = []
        this.fields['priceContractDefId'].options = [];
        this.fields['itemQtyUnitId'].options = [];
        this.fields['packingTypeId'].options = [];
        this.setAllProductDependantsToNull();
        this.checkRenewable(res);
      }
    });
  }

  setAllProductDependantsToNull() {
    this.itemDetails_form.get('quality').setValue(null);
    this.itemDetails_form.get('itemQtyUnitId').setValue(null);
    let pricingGroup = this.itemDetails_form.get('pricing') as FormArray;
    pricingGroup.get('priceTypeId').setValue(null);
    pricingGroup.get('priceContractDefId').setValue(null);
    this.itemDetails_form.get('packingTypeId').setValue(null);
  }

  contractHasItems() {
    if (
      this.contractData.hasOwnProperty('itemDetails') &&
      this.contractData.itemDetails.length
    ) {
      return true;
    } else {
      false;
    }
  }

  getItemIndex(contractData) {
    this.itemIndex = contractData.itemDetails.findIndex(item => {
      return item.itemNo === this.itemNo;
    });
    if (this.itemIndex === -1) {
      this.itemIndex = this.itemNoService.getBiggestItemNo(contractData);
      contractData.itemDetails[this.itemIndex] = { itemNo: this.itemNo };
    }
  }

  getCurrentItem() {
    this.getItemIndex(this.contractData);
    this.currentItem = this.contractData.itemDetails[this.itemIndex];
    if (!this.currentItem && this.new_item) {
      this.contractData.itemDetails[this.itemIndex] = { itemNo: this.itemNo };
      this.currentItem = this.contractData.itemDetails[this.itemIndex];
    } else if (!this.currentItem && !this.new_item) {
      this.contractPopup.open('item does not exists');
    }
    //if (this.action === 'edit' || this.action === 'clone' || this.contractData.templateId) {
      this.currentItem = this.cs.transformPricingData(this.currentItem);
    //}
    if(this.currentItem.itemDisplayValue){
      this.itemTxtValues = JSON.parse(this.currentItem.itemDisplayValue);
    }
  } 

  updateFields(data) {
    this.contractData = data || {};
    if(this.contractData.nlpFields){
      this.txtToContractList = this.contractData.nlpFields;
    }
    this.itemIndex = parseInt(this.itemIndex);
    this.updateSideBarGeneralDetails();
    this.getCurrentItem();
    this.updateSideBarDynamic(this.currentItem);
    this.initializeDates();
    this.initializeOptionLoadOptionDischarge();
    this.checkSplitPricing();
    this.initializePricing();
    this.checkForItemQty();
    this.checkForItemQtyUnit();
    this.itemDetails_form.patchValue(this.nullDrop(this.currentItem));
    this.initLoader = false;
    this.loadProductCombos();
    this.checkProductChange();
    this.loadCombos();
    this.loadPricing();
    this.setProductSpecs();
    this.checkFormForChanges();
    this.defaultValues();
    this.pdScheduleFunction();
    this.hookOnChangeRecommendation();
    this.checkProductForComponent();
    this.checkSingleTolerance();
    this.getValuationData();
    this.getSplitFormulaData();
    this.apiCalled = false;
    this.checkPackingTypeChange();
    this.checkDailyMonthlyCalculation();
    if(this.contractData.provisionalPaymentTermId && this.contractData.incotermId){
      this.calculatePaymentDueDate();
    }
    this.checkIntraCompanyChanges();
  }

  nullDrop(obj) {
    if (Array.isArray(obj)) {
      obj = obj
        .filter(item => !this.isNull(item) && !this.isUndefined(item))
        .map(this.nullDrop);
    } else if (this && this.isObject(obj)) {
      Object.keys(obj).forEach(key => {
        const val = this.nullDrop(obj[key]);

        if (this.isNull(val)) {
          delete obj[key];
        } else {
          obj[key] = val;
        }
      });
    }
    return obj;
  }

  isObject(value) {
    return !!(value && typeof value === 'object');
  }

  isNull(value) {
    return value == null;
  }

  isUndefined(value) {
    return value === undefined;
  }

  checkFormForChanges() {
    this.itemDetails_form.valueChanges.pipe(
      tap((res:any) => {
        let val = this.itemDetails_form.getRawValue();
        this.updateSideBarDynamic(val);
        let item = this.currentItem;
        item = { ...item, ...val };
        this.contractData.itemDetails[this.itemIndex] = item;
        this.currentItem = item;
        this.cos.changeCurrentContractObject(this.contractData);
        if(this.action === 'create' || this.action === 'clone'){
          sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(this.contractData));
        }
        this.getSplitFormulaData();
      }),
      debounceTime(10000),
      tap(() => { 
        //this.draftAutoSave(); 
      })
    ).subscribe();

    this.itemDetails_form.valueChanges
    .pipe(
      pairwise(),
      map(([prev, curr]) => Object.keys(curr).filter(key => prev[key] !== curr[key]))
    ).subscribe(keys => {
      if(keys && keys.length > 0){
        let displayNames = keys.forEach(key => {
          if(_.has(this.fields, [key,"options"]) && this.fields[key].options){
            let option = this.fields[key].options.find(option=>option.key === this.itemDetails_form.controls[key].value);
            if(option && option.value){
              console.log({ [key+'DisplayName'] : option.value });
              this.itemTxtValues[key+"DisplayName"] = option.value;
              this.addDisplayNames()
            }
          }
        });
      }
    });

    this.contractItemValuationDTO.valueChanges
    .pipe(
      pairwise(),
      map(([prev, curr]) => Object.keys(curr).filter(key => prev[key] !== curr[key]))
    ).subscribe(keys => {
      if(keys && keys.length > 0){
        let displayNames = keys.forEach(key => {
          if(_.has(this.fields, [key,"options"]) && this.fields[key].options){
            let value = this.itemDetails_form.get('contractItemValuationDTO').controls[key].value;
            let option = this.fields[key].options.find(option=>option.key === value);
            if(option && option.value){
              console.log({ [key+'DisplayName'] : option.value });
              this.itemTxtValues[key+"DisplayName"] = option.value;
              this.addDisplayNames()
            }
          }
        });
      }
    });
    
  }

  defaultValues(){
    if(!this.itemDetails_form.get('dailyMonthly').value){
      this.itemDetails_form.get('dailyMonthly').setValue('Daily');
    }
    if(!this.itemDetails_form.get('holidayRule').value){
      this.itemDetails_form.get('holidayRule').setValue('NextBusinessDay');
    }    
    if(!this.itemDetails_form.get('contractItemValuationDTO').get('valuationIncotermId').value && this.contractData.incotermId){
      this.itemDetails_form.get('contractItemValuationDTO').get('valuationIncotermId').setValue(this.contractData.incotermId);
    }
  }

  draftAutoSave(){
    if(this.action === 'create' && this.itemNo === 1 && !this.contractSaveInProgress && this.contractData.contractState === 'autoSave'){
      console.log('draft autosaving contract', this.contractData);
      this.cs.saveDraftContractReturn(this.contractData, this.contractId).subscribe(()=>{})
    } 
  }

  canDeactivate() {
    // let item = this.cs.formatPricingForContractSave(this.currentItem);
    // this.contractData[this.itemIndex] = item;
    // this.cos.changeCurrentContractObject(this.contractData);
    this.addDisplayNames();
    this.apiCalled = true
    return true;
  }

  initializeDates() {
    let issueDate = this.contractData.issueDate;
    let dfd = this.currentItem.deliveryFromDate;
    let dtd = this.currentItem.deliveryToDate;
    let pdd = this.currentItem.paymentDueDate;
    if (issueDate) {
      let datePicker_format_issueDate = this.us.getMyDatePickerDate(issueDate);
      this.disableUntil(datePicker_format_issueDate.date, 'deliveryFromDateOptions');
      this.disableUntil(datePicker_format_issueDate.date, 'laycanStartDate');
    }
    if (dfd) {
      this.currentItem.deliveryFromDate = this.us.getMyDatePickerDate(dfd);
      this.disableUntil(this.currentItem.deliveryFromDate.date, 'deliveryToDateOptions');
    }
    if (dtd) {
      this.currentItem.deliveryToDate = this.us.getMyDatePickerDate(dtd);
    }
    if (pdd) {
      this.currentItem.paymentDueDate = this.us.getMyDatePickerDate(pdd);
    }
    if (this.currentItem.laycanStartDate) {
      this.currentItem.laycanStartDate = this.us.getMyDatePickerDate(
        this.currentItem.laycanStartDate
      );
    }
    if (this.currentItem.laycanEndDate) {
      this.currentItem.laycanEndDate = this.us.getMyDatePickerDate(
        this.currentItem.laycanEndDate
      );
    }
    if (
      this.currentItem.hasOwnProperty('pricing') &&
      this.currentItem.pricing.hasOwnProperty('earliestBy')
    ) {
      this.currentItem.pricing.earliestBy = this.us.getMyDatePickerDate(
        this.currentItem.pricing.earliestBy
      );
    }
    if (this.currentItem.customEventDate) {
      this.currentItem.customEventDate = this.us.getMyDatePickerDate(
        this.currentItem.customEventDate
      );
    }
  }

  updateSideBarDynamic(data) {
    this.ps.itemDetailsFillPercentage(data);
  }

  validateField(name, group) {
    let formGroup = this.itemDetails_form;
    if(group){
      formGroup = this.itemDetails_form.get(group) as FormGroup;
    }
    if (!this.finalValidation) {
      return (
        formGroup.get(name).invalid &&
        formGroup.get(name).touched
      );
    } else {
      return formGroup.get(name).invalid;
    }
  }

  validatePricing(name) {
    let pricingGroup = this.itemDetails_form.get('pricing') as FormGroup;
    if (!this.finalValidation) {
      return pricingGroup.get(name).invalid && pricingGroup.get(name).touched;
    } else {
      return pricingGroup.get(name).invalid;
    }
  }

  updateSideBarGeneralDetails() {
    this.generalDetailsComplete = this.ps.generalDetailsFillPercentage(this.contractData);
  }

  initializeRecommendation(data) {
    let fields = {
      traderUserId: data.traderUserId,
      contractType: data.contractType,
      cpProfileId: data.cpProfileId
    };
    return forkJoin(
      of(data),
      this.cs.getRecommendationsItemDetails(fields)
        .pipe(
          timeout(5000),
          map((rec: any) => {
            rec.deliveryFromDate = this.us.getMyDatePickerDate(rec.deliveryFromDate);
            rec.deliveryToDate = this.us.getMyDatePickerDate(rec.deliveryToDate);
            this.recommendationsList = rec;
            if (rec.hasOwnProperty('pricing')) {
              this.priceTypeId = rec.pricing.priceTypeId;
            }
            if(rec.optional_fields && rec.optional_fields !== 'NA'){
              this.optionalFieldsRecommendation = {...rec.optional};
              this.itemDetails_form.get('isOptionalFieldsEnabled').valueChanges.pipe(first())
              .subscribe((val)=>{
                if(val){
                  this.optionalFieldsRecommendation.laycanStartDate = this.us.getMyDatePickerDate(this.optionalFieldsRecommendation.laycanStartDate);
                  this.optionalFieldsRecommendation.laycanEndDate = this.us.getMyDatePickerDate(this.optionalFieldsRecommendation.laycanEndDate);
                  this.itemDetails_form.patchValue(this.optionalFieldsRecommendation);
                  rec.deliveryFromDate = this.us.getMyDatePickerDate(rec.deliveryFromDate);
                }
               });
            }
            delete rec['optional'];
            rec = { ...rec, ...this.rs.getFirstTimeUserDefaults(this.fields,'itemDetails') };
            this.addDisplayValuesFromRecommendation(rec);
            return rec;
          }),
          catchError(e => {
            return of('failed').pipe(tap(e => { console.log(e + ' recommendation') }))
          })
        )
    )
  }

  hookOnChangeRecommendation(){
    if(this.new_item){
      this.itemDetails_form.get('productId').valueChanges.subscribe((res)=>{
        if(res !== null){
          this.productChangeRecommendation(res);
        }
      })
      this.itemDetails_form.get('originationCountryId').valueChanges.subscribe((res)=>{
        if(res !== null){
          this.countryChangeRecommendation(res, 'originationCountryId');
        }
      })
      this.itemDetails_form.get('destinationCountryId').valueChanges.subscribe((res)=>{
        if(res !== null){
          this.countryChangeRecommendation(res, 'destinationCountryId');
        }
      })
    }
  }

  productChangeRecommendation(product) {
    let fields = {
      "recommendation_field" : "productId"
    };
    this.cs.getRecommendationsItemDetails(fields)
    .pipe(timeout(1000))
    .subscribe(
      (response : any) => {
        if(response.hasOwnProperty(product)){
          let rec = response[product];
          delete rec['quality']
          setTimeout(()=>{
            this.recommendationsList = rec;
            this.itemDetails_form.patchValue(rec);
            this.addDisplayValuesFromRecommendation(rec);
          },1000);
        }
      },
      error => {
        console.log('recommendation failed');
      }
    );
  }

  countryChangeRecommendation(country, type){
    let fields = {
      "recommendation_field" : type
    };
    this.cs.getRecommendationsItemDetails(fields)
    .pipe(timeout(1000))
    .subscribe((response:any)=>{
      let recommendation = {};
      if(response.hasOwnProperty(country)){
        let rec = response[country];
        // if(type === 'originationCountryId'){
        //   let { loadingLocationGroupTypeId = null, originationCityId = null} = rec;
        //   this.itemDetails_form.patchValue({loadingLocationGroupTypeId}, { emitEvent:false });     
        // }else if(type === 'destinationCountryId'){
        //   let { destinationLocationGroupTypeId = null, destinationCityId = null} = rec;
        //   this.itemDetails_form.patchValue({destinationLocationGroupTypeId}, { emitEvent:false });  
        // }
        setTimeout(()=>{
          this.recommendationsList = rec;
          this.itemDetails_form.patchValue(rec);
          this.addDisplayValuesFromRecommendation(rec);
        },1000);  
      }
    });
  }

  useTextToContract(txt) {
    console.log(txt);
    this.apiCalled = true;
    this.nlp.getTextToContract(txt, this.fields, this.itemIndex, this.itemNo).subscribe(formVal => {
      formVal["sentence"] = txt;
      this.contractData["nlpFields"] = {...formVal};
      this.cos.changeCurrentContractObject(this.contractData);
      this.cs.refreshTrigger.next('refresh');
    });
  }

  setFieldClasses(field, group = null) {
    let classes = {
      'is-invalid': this.validateField(field, group),
      recommendation: this.recommendationsList[field],
      txtToContract: this.txtToContractList[field]
    };
    return classes;
  }

  setPricingFieldClasses(field) {
    let classes = {
      'is-invalid': this.validatePricing(field),
      //"recommendation": this.recommendationsList[field],
      "txtToContract": this.txtToContractList[field]
    };
    return classes;
  }

  setFormulaIdClass(){
    if (this.finalValidation) {
      return { 'formula-invalid': this.getPricingGroup().get('pricingFormulaId').value === null ? true : false }
    }
    return null;
  }

  setTieredPricingFieldClasses(index){
    if(this.finalValidation && !this.pricingFormulaNameArray[index]){
      return { 'formula-invalid': true };
    }
    return null;
  }

  initializeOptionLoadOptionDischarge() {
    if (this.currentItem.optionalLoadingDetails === null) {
      this.currentItem.optionalDischargeDetails = [];
      this.currentItem.optionalLoadingDetails = [];
    }
    if (this.currentItem.optionalLoadingDetails) {
      let opLoadLength = this.currentItem.optionalLoadingDetails.length;
      if (opLoadLength > 1) {
        for (let i = 1; i < opLoadLength; i++) {
          this.addOptionLoad();
        }
      }
    }
    if (this.currentItem.optionalDischargeDetails) {
      let opDischargeLength = this.currentItem.optionalDischargeDetails.length;
      if (opDischargeLength > 1) {
        for (let i = 1; i < opDischargeLength; i++) {
          this.addOptionDischarge();
        }
      }
    }
  }

  get optionalLoadingDetails() {
    return this.itemDetails_form.get('optionalLoadingDetails') as FormArray;
  }

  get latePaymentGroup() {
    return this.itemDetails_form.get('latePaymentInterestDetails') as FormArray;
  }

  updateContractObsCurrentItem(){
    this.contractData.itemDetails[this.itemIndex] = this.currentItem;
    this.cos.changeCurrentContractObject(this.contractData);
  }

  addOptionLoad() {
    this.optionalLoadingDetails.push(
      this.fb.group({
        originationCountryId: [null],
        originationCityId: [null],
        freightDf: [null],
        freightDfPriceUnitId: [null],
        internalOptOriginationId : [null],
        optOriginInstanceDeleted : [null]
      })
    );
    let index = this.optionalLoadingDetails.controls.length - 1;
    let opLoad = this.optionalLoadingDetails.get(index.toString());
    opLoad.get('originationCountryId').valueChanges.subscribe(data => {
      if (data) {
        this.currentItem["isOptionalOrigination"] = "Y";
        this.updateContractObsCurrentItem();
        this.mdm.getCityData(data, 'City').subscribe((data: any) => {
          this.fields.optionLoadCity[index] = {};
          this.fields.optionLoadCity[index].options = data.cityComboDataFromDB;
        });
      }
    });
  }

  get optionalDischargeDetails() {
    return this.itemDetails_form.get('optionalDischargeDetails') as FormArray;
  }

  addOptionDischarge() {
    this.optionalDischargeDetails.push(
      this.fb.group({
        destinationCountryId: [null],
        destinationCityId: [null],
        freightDf: [null],
        freightDfPriceUnitId: [null],
        internalOptDestinationId: [null],
        optDestInstanceDeleted: [null]
      })
    );
    let index = this.optionalDischargeDetails.controls.length - 1;
    let opLoad = this.optionalDischargeDetails.get(index.toString());
    opLoad.get('destinationCountryId').valueChanges.subscribe(data => {
      if (data) {
        this.currentItem["isOptionalDestination"] = "Y";
        this.updateContractObsCurrentItem();
        this.mdm.getCityData(data, 'City').subscribe((data: any) => {
          this.fields.optionDischargeCity[index] = {};
          this.fields.optionDischargeCity[index].options =
            data.cityComboDataFromDB;
        });
      }
    });
  }

  optionLoadRemove(i) {
    this.optionalLoadingDetails.controls[i].get('optOriginInstanceDeleted').setValue(true);
    this.currentItem.optionalLoadingDetails[i]["optOriginInstanceDeleted"] = true;
    this.contractData.itemDetails[this.itemIndex] = this.currentItem;
    this.updateContractObsCurrentItem();
  }

  optionDischargeRemove(i) {
    this.optionalDischargeDetails.controls[i].get('optDestInstanceDeleted').setValue(true);
    this.currentItem.optionalDischargeDetails[i]["optDestInstanceDeleted"] = true;
    this.contractData.itemDetails[this.itemIndex] = this.currentItem;
    this.updateContractObsCurrentItem();
  }

  getQual() {
    return this.itemDetails_form.get('quality').value;
  }

  display: boolean = false;

  showDialog() {
    this.display = true;
  }

  getEstimates() {
    if (this.currentItem.hasOwnProperty('estimates')) {
      return this.currentItem.estimates;
    } else {
      return [];
    }
  }

  addSecondaryCost(secCost) {
    this.currentItem.estimates = [...secCost.keys];
    console.log(secCost);
    let secondaryCostDisplayName = secCost.displayValues.map(scObj=>{
      let keys = Object.keys(scObj);
      let displayNameObj = {};
      keys.forEach(key=>{
        displayNameObj[key + 'DisplayName'] = scObj[key]
      })
      return displayNameObj;
    })
    this.itemTxtValues["secondaryCostDisplayName"] = secondaryCostDisplayName;
    this.addDisplayNames();
  }

  getAdditionDeductions(){
    if(this.currentItem.hasOwnProperty('itemAdditionDeductions')){
      return this.currentItem.itemAdditionDeductions;
    }else{
      return [];
    }
  }

  addAddDeduction(addDeduction) {
    console.log(addDeduction);
    this.currentItem.itemAdditionDeductions = [...addDeduction.keyValue];
    this.itemTxtValues["addDedDisplayName"] = addDeduction.displayNames;
    this.addDisplayNames();
  }

  saveGeneratedItems(contractItems) {
    this.contractData.itemDetails = contractItems;
    this.cos.changeCurrentContractObject(this.contractData);
    this.router.navigate(['../../../item-list/' + this.navigationId], {
      relativeTo: this.route
    });
  }

  public saveContract = () => {
    this.contractSaveInProgress = true;
    if (this.checkValidation()) {
      this.contractData.itemDetails[
        this.itemIndex
      ] = { ...this.currentItem, ...this.itemDetails_form.getRawValue() };
      this.addDisplayNames();
      this.cos.changeCurrentContractObject(this.contractData);
      if(this.cs.checkIfSplitPriceContract(this.contractData)){
        this.apiCalled = true;
        let splitApiObs = this.componentService.splitDataCURD(this.contractData, this.appObject, this.action);
        splitApiObs.subscribe((res:any)=>{
          console.log(res);
          this.updateSplitsInContractObjSession(res);
          this.apiCalled = false;
          this.checkAppObjectSave();
        })
      }else{
        this.checkAppObjectSave()
      }
    }
  };

  checkAppObjectSave(){
    switch (this.appObject) {
      case 'contract':
        if (this.action === 'create' || this.action === 'clone') {
          this.checkSaveContractOrDraft();
        } else {
          this.apiCalled = true;
          this.cs.saveEditedContractReturn(this.contractData)
          .pipe(concatMap((res:any)=>{
            this.cos.changeCurrentContractObject(res.data.contractDetails);
            return this.componentService.updateSplitsWithContractItemRefs(res.data.contractDetails);
          }))
          .subscribe((res:any) => {
            this.apiCalled = false;
            this.contractPopup.open('Existing contract has been updated');
            this.router.navigate(
              ['../../../item-list/' + this.navigationId],
              {
                relativeTo: this.route
              }
            );
          });
        }
        break;
      case 'template':
        let savedCredentials = localStorage.getItem('credentials');
        let credentials = JSON.parse(savedCredentials);
        this.apiCalled = true;
        if (
          (this.action === 'create' || this.action === 'clone') &&
          !this.contractData.hasOwnProperty('internalContractRefNo') &&
          !this.contractData.internalContractRefNo
        ) {
          this.cs.saveTemplate(this.contractData).subscribe((res: any) => {
            this.cos.changeCurrentContractObject(res.data.contractDetails);
            this.contractData.internalContractRefNo =
              res.data.contractDetails.internalContractRefNo;
            this.contractData.contractRefNo = res.data.contractDetails.contractRefNo;
            this.apiCalled = false;
            this.contractPopup.open(
              'Template saved with Ref No. : ' +
              res.data.contractDetails.contractRefNo
            );
            this.router.navigate(
              ['../../../item-list/' + this.navigationId],
              {
                relativeTo: this.route
              }
            );
          });
        } else {
          this.cs.updateTemplate(this.contractData).subscribe((res: any) => {
            this.cos.changeCurrentContractObject(res.data.contractDetails);
            this.apiCalled = false;
            this.contractPopup.open(
              'Template updated with Ref No. : ' +
              res.data.contractDetails.contractRefNo
            );
            this.redirectToItemList();
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
    if (this.contractData.internalContractRefNo) {
      this.cs
        .updateCtrmDraft(
          this.contractData,
          this.contractData.internalContractRefNo
        )
        .subscribe((res: any) => {
          this.cos.changeCurrentContractObject(res.data.contractDetails);
          this.apiCalled = false;
          this.componentService.updateComponent(this.contractData,res,this.itemIndex);
          this.draftCreated.open(
            'Previously saved Draft with Ref No.' +
            res.data.contractDetails.contractRefNo +
            ' has been updated'
          );
        });
    } else {
      this.cs.saveCtrmDraftContract(this.contractData).subscribe((res: any) => {
        this.cos.changeCurrentContractObject(res.data.contractDetails);
        this.contractData.internalContractRefNo =
          res.data.contractDetails.internalContractRefNo;
        this.apiCalled = false;
        this.componentService.updateComponent(this.contractData,res,this.itemIndex);
        this.draftCreated.open(
          'Contract saved as draft with Ref No. : ' + res.data.contractDetails.contractRefNo
        );
      });
    }
  }

  checkSaveContractOrDraft() {
    if (this.contractData.itemDetails.length > 1) {
      this.contractDraftPopup.open(
        'Do you want to create contract or save as draft?'
      );
    } else {
      this.contractDraftPopup.open(
        'Do you want to create contract with 1 item or save as draft?'
      );
    }
  }

  confirmSaveContractOrDraft(msg) {
    if (msg === 'SAVE AS CONTRACT') {
      let contractObjCopy = JSON.parse(JSON.stringify(this.contractData));
      contractObjCopy = this.cs.removeAllInternalIDs(contractObjCopy);
      if(this.appObject === 'draft' && this.action === 'edit'){
        contractObjCopy.internalDraftId = this.contractData["internalContractRefNo"];
        this.apiCalled = true;
        this.cs.startNewContract().pipe(
          tap((data:any)=>{ 
            contractObjCopy._id = data._id; 
          }),
          concatMap((data:any)=>{ 
            return this.componentService.saveSplitsWithNewDraftId(this.contractData, data._id);
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
      this.contractData = res.data.contractDetails;
      this.navigationId = res.data.contractDetails.internalContractRefNo;
      this.ps.setNewContractId(res.data.contractDetails.internalContractRefNo);
      this.cos.changeCurrentContractObject(res.data.contractDetails);
      if(res.data.secondLegContractDetails){
        this.secondLegContractDetails = res.data.secondLegContractDetails;
      }
      this.componentService.updateComponent(this.contractData,res,this.itemIndex);
      return this.componentService.updateSplitsWithContractItemRefs(this.contractData);
    }))
    .subscribe((res: any) => {
      this.apiCalled = false;
      if(this.contractData.dealType === 'Inter_Company' || this.contractData.dealType === 'Intra_Company'){
        this.contractCreated.open(
          '1. Contract created with Contract Ref No. :' +
          this.contractData.contractRefNo + ' \n ' +
          '2. SecondLeg contract created with Contract Ref No. :' + this.secondLegContractDetails.contractRefNo
        );
      } else {
        this.contractCreated.open(
          'Contract created with Contract Ref No. :' +
          this.contractData.contractRefNo
        );
      }
    });
  }
  
  afterApprovalCancel() {
    this.showWarning = true;
    this.errorMsg = 'Selection of approver mandatory for contract creation';
  }

  afterContractCreated() {
    this.router.navigate(['../../../../../contract/edit/document-upload/' + this.navigationId], {
      relativeTo: this.route
    });
  }

  afterDraftCreated(msg) {
    if (msg === 'NEXT') {
      this.router.navigate(['../../../item-list/' + this.navigationId], {
        relativeTo: this.route
      });
    } else if (msg === 'EXIT') {
      this.cs.redirectToDraft();
    }
  }

  closeAlert() {
    this.showWarning = false;
    this.showSuccess = false;
  }

  afterMdmFailure() {
    location.reload();
  }

  openGenerateItemPopup() {
    if (this.checkValidation()) {
      this.addDisplayNames()
      this.generateItemsPopup.open();
    }
  }

  checkValidation() {
    this.finalValidation = true;
    let itemQty = this.itemDetails_form.get('itemQty').value;
    if(this.checkItemQty && itemQty < this.savePreviousItemQty){
      this.itemQtyHandle.open("Item Qty cannot be reduced as GMR is created");
      return false;
    }
    if(this.itemDetails_form.getRawValue().pricing.pricingStrategy === 'pricingStrategy-001' && this.itemDetails_form.getRawValue().pricing.pricingFormulaId === null){
      this.showWarning = true;    
      this.errorMsg = 'Select formula for item pricing';
      return false;
    }
    if(this.itemDetails_form.getRawValue().pricing.pricingStrategy === 'pricingStrategy-002' || this.itemDetails_form.getRawValue().pricing.pricingStrategy === 'pricingStrategy-003'){
      if(!this.splitRanges){
        this.errorMsg = "Select formula for the tiered pricing"
        this.showWarning = true;
        return false;
      }
      
      for(let i=0; i<this.splitRanges.length; i++){
        if(!this.splitFormData[i].formulaId){
          this.errorMsg = "Select formula for all the tiers in tiered pricing"
          this.showWarning = true;
          return false;
        }
      }
    }
    if (this.itemDetails_form.valid) {
      if (this.generalDetailsComplete) {
        if (this.appObject==='contract' && this.action==='edit' && this.contractData.reasonToModify === null){
          this.errorMsg =
          'In General Details section, enter the reason for modification before save';
          this.showWarning = true;
          return false;
        }
        return true;
      } else {
        this.errorMsg =
          'Fill all mandatory fields in General Details section to proceed';
        this.showWarning = true;
        return false;
      }
    } else {
      if (!this.itemDetails_form.get('paymentDueDate').value) {
        this.paymentDueDateStyle.border = '1px solid #ff00008f';
      }
      if (!this.itemDetails_form.get('deliveryFromDate').value) {
        this.deliveryFromDateStyle.border = '1px solid #ff00008f';
      }
      if (!this.itemDetails_form.get('deliveryToDate').value) {
        this.deliveryToDateStyle.border = '1px solid #ff00008f';
      }
      // if (!this.itemDetails_form.get('valuationFormula').value) {
      //   this.valuationValid = false;
      // }
      this.errorMsg = 'Highlighted fileds are mandatory to fill';
      // this.mandatoryFields.forEach(element => {
      //   if (
      //     !this.currentItem[element] ||
      //     this.currentItem[element] === null ||
      //     this.currentItem[element] === ''
      //   ) {
      //     if (this.fields[element] && this.fields[element].label) {
      //       this.errorMsg += '  "' + this.fields[element].label + '" ';
      //     }
      //   }
      // });
      // this.errorMsg += ' - to proceed';
      this.showWarning = true;
      console.log(this.itemDetails_form)
      return false;
    }
  }
  showdetails() {
    this.showDetails = true;
  }

  redirectToItemList() {
    this.router.navigate(['../../../item-list/' + this.navigationId], {
      relativeTo: this.route
    });
  }

  dropdownChanged(event, fieldName, inSubGroup) {
    let textValue = this.getEventDropdownText(event);
    this.setTextToField(fieldName, inSubGroup, textValue);
  }

  getEventDropdownText(event) {
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    return selectElementText;
  }

  setTextToField(fieldName, inSubGroup, textValue) {
    let _formGroup = this.itemDetails_form;
    if (inSubGroup) {
      _formGroup = this.itemDetails_form.get(inSubGroup) as FormArray;
    }
    _formGroup.get(fieldName).setValue(textValue);
  }

  pdScheduleFunction() {
    this.itemDetails_form.get('productId').valueChanges.subscribe(res => {
      if(this.currentItem.pricing){
        this.callMdmForPdSchedule(res, this.currentItem.quality, this.currentItem.pricing.payInCurId);
      }
    });
    this.itemDetails_form.get('quality').valueChanges.subscribe(res => {
      if(this.currentItem.pricing){
        this.callMdmForPdSchedule(this.currentItem.productId, res, this.currentItem.pricing.payInCurId);
      }  
    });
    this.getPricingGroup().get('payInCurId').valueChanges.subscribe(res => {
      if(this.currentItem.pricing){
        this.callMdmForPdSchedule(this.currentItem.productId, this.currentItem.quality, res);
      }
    });
    let { productId, quality } = this.currentItem;
    if(productId && quality && this.currentItem.pricing){
      this.callMdmForPdSchedule(productId,quality,this.currentItem.pricing.payInCurId);
    }
  }

  callMdmForPdSchedule(productId, qualityId, payInCurId) {
    if (productId && qualityId && payInCurId)
      if (productId !== 'loading' &&
      qualityId !== 'loading' &&
      payInCurId !== 'loading') {
        this.mdm
          .getComboKeys('pdNewscheduleList', [
            productId,
            payInCurId,
            qualityId
          ])
          .subscribe((res: any) => {
            this.fields.qualityPdScheduleId.options = res.pdNewscheduleList;
          });
      }
  }

  isEditContract(){
    return this.appObject === 'contract' && this.action === 'edit'
  }

  getSelectedTxt(event, field, type = 'select'){
    let text
    if(type === 'select'){
      text = event.target.options[event.target.options.selectedIndex].text;
    }else if(type === 'date'){
      text = this.us.getISO(event);
    }else if(type === 'number' || type === 'text'){
      text = event.target.value;
    }
    if(text === 'Tier based - Step up' || text === 'Tier based - Flat'){	
      this.split.open(this.split.split);	
    }
    this.itemTxtValues[field+"DisplayName"] = text;
    this.addDisplayNames();
  }

  addDisplayValuesFromRecommendation(res){
    let keys = Object.keys(res)
    let displayObj = keys.reduce((displayValues, field) => {
      let option = this.fields[field].options.find(option=>{
        return option.key === res[field]
      })
      if(option){
        displayValues[field+'DisplayName'] = option.value;
      }
      return displayValues
    }, {});
    this.itemTxtValues = { ...this.itemTxtValues, ...displayObj};
    console.log(this.itemTxtValues);
  }

  addDisplayNameToKey(key, value){
    let option = this.fields[key].options.find(option=>option.key === value);
    if(option && option.value){
      console.log({ [key+'DisplayName'] : option.value });
      this.itemTxtValues[key+"DisplayName"] = option.value;
      this.addDisplayNames()
    }
  }

  addDisplayNames(){
    let item = this.contractData.itemDetails[this.itemIndex];
    if (item.hasOwnProperty("itemDisplayValue")) {
      let displayValue = JSON.parse(item["itemDisplayValue"]);
      item["itemDisplayValue"] = JSON.stringify({ ...displayValue, ...this.itemTxtValues });
    } else {
      item["itemDisplayValue"] = JSON.stringify(this.itemTxtValues);
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

  openComponent(){
    this.appService.getWorkFlowConfig('5d907cd2-7785-4d34-bcda-aa84b2158415', 'componentPricinglisting').subscribe(
      (res: any) => {
        this.appService.setLoaderState({ type: 'layout', value: false });
        this.appService.workFlowData.storage = {
          ...res.flow['componentPricinglisting'],
          workFlowTask: 'componentPricinglisting',
          objectMeta: res['objectMeta'],
          properties: res['properties']
        };
        let url =window.location.href
        url = url + '?ContractRefNo='
        if(this.internalContractRef)
        url = url+this.internalContractRef
        else{
          url = url + this.contractId
        }
        
        if( this.contractData.itemDetails[this.itemNo-1].internalItemRefNo)
        url = url + '&ContractItemRefNo=' + this.contractData.itemDetails[this.itemNo-1].internalItemRefNo
        url = url + '&itemNo=' + this.itemNo
        url = url + '&componentDraftId=' + this.contractId
       
        url = url + '&productId='+ this.contractData.itemDetails[this.itemNo-1].productId
        if (window.history.replaceState) {
          //prevents browser from storing history with each change:
          window.history.replaceState(null, null, url);
       }
        this.workflowModal.renderModal(
          {
            name: 'list',
            status: '',
            type: 'row',
            response: '',
            customClass: 'edit-modal'
          },
          this.appService,
          'physicals'
        );
      })
    }

    openNewWindow(){
      let url =window.location.href
      url = url.split('physicals')[0]
      url = url + 'app/physicals/componentPricinglisting?ContractRefNo='

      if(this.internalContractRef)
      url = url+this.internalContractRef
      else{
        url = url + this.contractId
      }
      
      if( this.contractData.itemDetails[this.itemNo-1].internalItemRefNo)
      url = url + '&ContractItemRefNo=' + this.contractData.itemDetails[this.itemNo-1].internalItemRefNo
      url = url + '&itemNo=' + this.itemNo
      url = url + '&componentDraftId=' + this.contractId
      // url = url + '&gmrRefNo=NOT_CREATED'
      url = url + '&isPopUp=true'
      url = url + '&productId='+ this.contractData.itemDetails[this.itemNo-1].productId

      window.open(url, '', 'width=700,height=300,left=400,top=200');
    }

    checkProductForComponent(){
      if(this.contractData.itemDetails[this.itemIndex].productId){
        this.componentService.getComponentFromSetup(this.contractData.itemDetails[this.itemNo-1].productId).subscribe((res:any)=>{
          if(res.data.length>0)this.enableComponent = true
          else{
            this.enableComponent = false
          }
        })
      }
      this.itemDetails_form.get('productId').valueChanges.subscribe(product=>{
        this.componentService.getComponentFromSetup(product).subscribe((res:any)=>{
          if(res.data.length>0)this.enableComponent = true
          else{
            this.enableComponent = false
          }
        })
      })
    }

    handlePageCancel(){
      let numOfItems = this.contractData.itemDetails.length;
      if(this.itemDetails_form.valid){
        this.redirectToItemList();
      }else{
        if(numOfItems === 1){
          this.cs.redirectToCTRM(this.router.url.split('/',3)[2]);
        }else{
          this.contractData.itemDetails.splice(this.itemIndex,1);   
          this.cos.changeCurrentContractObject(this.contractData);
          this.redirectToItemList();
        }
      }
    }

    checkRenewable(res){
      let renewableCtrl = this.itemDetails_form.get('isRenewable');
      if(_.has(res, ['productRule','0','isRenewable'])){
        let isRenewable = res['productRule'][0]['isRenewable'];
        renewableCtrl.setValue(isRenewable);
        if(isRenewable === 'Y'){
          this.isRenewable = true;
        }else{
          this.resetRenewable();
        }
      }else{
        this.resetRenewable();
      }
    }

    resetRenewable(){
      this.isRenewable = false;
      this.itemDetails_form.get('isRinContract').setValue('N');
      this.itemDetails_form.get('rinEquivalanceValue').setValue(null);
      this.itemDetails_form.get('rinQuantity').setValue(null);
      this.itemDetails_form.get('rinUnit').setValue(null);
    }

    getValuationData(){  
      this.pricingTriggerFor='valuation';
      if(_.has(this.contractData, ['itemDetails',this.itemIndex,'valuationFormula'])){
        let valuationId = this.contractData.itemDetails[this.itemIndex].valuationFormula;
        let valuationData = JSON.parse(JSON.stringify(this.contractData));
        valuationData.itemDetails[this.itemIndex].pricing.pricingFormulaId = valuationId
        this.valuationData = valuationData;
      }else{
        this.valuationData = JSON.parse(JSON.stringify(this.contractData));
      }
    }

    getSplitFormulaData(){
      if(this.splitRanges){
        let splitData = this.splitRanges && this.splitRanges ? this.splitRanges : [];
        for(let i=0; i < splitData.length;i++){
          if(this.splitFormula && this.splitFormula[i]){
            let splitcontractData = JSON.parse(JSON.stringify(this.contractData));
            splitcontractData.itemDetails[this.itemIndex].pricing.pricingFormulaId = this.splitFormula[i];
            if(this.contractSplitData[i]){
              this.contractSplitData[i] = splitcontractData;
            }else{
              this.contractSplitData.push(splitcontractData)
            }
            //console.log(this.contractSplitData[i])
          }else{
            this.contractSplitData[i] = JSON.parse(JSON.stringify(this.contractData));
          }
        } 
      }
    }

    checkSingleTolerance(){
      if(this.action === 'edit'){
        let item = this.contractData.itemDetails[this.itemIndex];
        if(item.hasOwnProperty('toleranceMin') && item['toleranceMin'] !== null &&  item.hasOwnProperty('toleranceMax') && item['toleranceMax'] !== null){
          this.singleTolerance = false;
        }else if(item.hasOwnProperty('tolerance') && item['tolerance'] !== null){
          this.singleTolerance = true;
          this.ps.setSingleTolerance(true);
          this.getControl('tolerance').setValidators([Validators.required]);
          this.getControl('toleranceMin').setValidators(null);
          this.getControl('toleranceMax').setValidators(null);
        } else {
          this.singleTolerance = false;
        }
      }
    }

    setProductSpecs(){
      this.itemDetails_form.get('quality').valueChanges.subscribe(qualityId=>{
        if(qualityId && qualityId !== 'loading'){
          let productId = this.itemDetails_form.get('productId').value;
          let productObj = this.fields['productId'].options.find(opt => opt.key === productId);
          if(this.fields['quality'].options.length > 0){
            let qualityObj = this.fields['quality'].options.find(opt => opt.key === qualityId);
            if(productObj && qualityObj){
              let productSpecs = productObj.value + ',' + qualityObj.value;
              this.itemDetails_form.get('productSpecs').setValue(productSpecs);
            }
          }
        }
      });
    }

    getSplitAction(event){	
      this.splitRanges = event.splitData.arr;
      this.getSplitFormulaData();
      let splitFromLength = this.splitFormData.length;
      for(let i=0 ; i<splitFromLength; i++){
        if(this.splitFormData[i] && this.splitRanges[i]){ 
          if(this.splitRanges[i].rangeStart !== this.splitFormData[i].splitFloor || this.splitRanges[i].rangeEnd !== this.splitFormData[i].splitCeiling){
            this.splitFormData[i].splitFloor = this.splitRanges[i].rangeStart;
            this.splitFormData[i].splitCeiling = this.splitRanges[i].rangeEnd;
            this.splitFormData[i]["ui_action"] = "edit";
          }
        }else{
          this.splitFormData[i]["ui_action"] = "delete";
        }
      }
    }	

   openSplit(){	
     this.split.open(this.split.split);	
   }

   openNewWindowForPd(){
    let url =window.location.href
    url = url.split('physicals')[0]
    url = url + 'app/physicals/componentPricinglisting?ContractRefNo='

    if(this.internalContractRef)
    url = url+this.internalContractRef
    else{
      url = url + this.contractId
    }
    
    if( this.contractData.itemDetails[this.itemNo-1].internalItemRefNo)
    url = url + '&ContractItemRefNo=' + this.contractData.itemDetails[this.itemNo-1].internalItemRefNo
    url = url + '&itemNo=' + this.itemNo
    url = url + '&componentDraftId=' + this.contractId
    // url = url + '&gmrRefNo=NOT_CREATED'
    url = url + '&isPopUp=true'
    url = url + '&productId='+ this.contractData.itemDetails[this.itemNo-1].productId

    window.open(url, '', 'width=1000,height=500,left=200,top=100');
  }

  checkPackingTypeChange(){
    let formVal = this.itemDetails_form.getRawValue();
    if(formVal.productId && formVal.packingTypeId){
      this.mdm.getComboKeys("packingSize",[formVal.productId,formVal.packingTypeId]).subscribe((res:any)=>{
        this.fields.packingSizeId.options = res.packingSize;
      })
    }
    this.itemDetails_form.get('packingTypeId').valueChanges.subscribe((res:any)=>{
      let productId = this.itemDetails_form.getRawValue().productId;
      if(productId && res && res !== 'loading'){
        this.itemDetails_form.get('packingSizeId').setValue('loading');
        this.mdm.getComboKeys("packingSize",[productId,res]).subscribe((res:any)=>{
          this.itemDetails_form.get('packingSizeId').setValue(null);
          this.fields.packingSizeId.options = res.packingSize;
        })
      }
    })
  }

  sortElementsDowntoUp(elementList){
    elementList.sort((a, b) => {
      a = a.splitId;
      b = b.splitId;
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
    if(this.appObject === 'contract' && this.action === 'edit'){
      this.itemDetails_form.get('quality').disable({ emitEvent: false });
      this.itemDetails_form.get('itemQtyUnitId').disable();
      this.itemDetails_form.get('itemQtyUnitId').disable();
      this.itemDetails_form.get('toleranceMax').disable();
      this.itemDetails_form.get('toleranceType').disable();
      this.itemDetails_form.get('toleranceLevel').disable();
      //this.itemDetails_form.get('productId').disable({ emitEvent: false });
      this.itemDetails_form.get('dailyMonthly').disable();
      this.itemDetails_form.get('dailyMonthlyQty').disable();
      this.itemDetails_form.get('deliveryFromDate').disable();
      this.itemDetails_form.get('deliveryToDate').disable();
      this.disableDensityFields = true;
    }
  }

  getGmrDetails(){
    if(this.internalContractItemRefNo){
      this.componentService.getGmrDetailsofContract(this.internalContractItemRefNo).subscribe((dataInner:any)=>{
        let gmrDetailsQty:any=0;
        if(dataInner.data.gmrData.data === null){
          this.checkItemQty = false;
          return;
        }
        this.gmrData = dataInner.data.gmrData.items;
        let itemQtyOptions = this.fields['itemQtyUnitId'].options;
        this.savePreviousItemQty = this.itemDetails_form.get('itemQty').value;
        let itemQtyUnit:string;
        let differentQtyUnit = [];
        for(let i=0; i < itemQtyOptions.length; i++){
          if(itemQtyOptions[i].key === this.internalContractItemRefNo.itemQty){
                itemQtyUnit = itemQtyOptions[i].value;
          }
        }
        if(itemQtyUnit){
          for(let i=0; i < this.gmrData.length; i++){
            if(this.gmrData[i].qtyUnit !== itemQtyUnit){
              differentQtyUnit.push(this.gmrData[i].qtyUnit)
            }
          }
        }
        if(Array.isArray(differentQtyUnit) && differentQtyUnit.length > 0){
          this.componentService.getMdmUnitConversion(this.gmrData,itemQtyUnit,this.internalContractItemRefNo.productId,itemQtyOptions,this.internalContractItemRefNo.itemQty).subscribe((dataInput:any) =>{
            //console.log(dataInput);
            if(dataInput.quantityConversionFactor){
              for(let i=0; i < itemQtyOptions.length; i++){
                if(itemQtyOptions[i].key == dataInput["quantityConversionFactor"][0].key){
                      dataInput["quantityConversionFactor"][0].qtyUnit = itemQtyOptions[i].value;
                }
              }
              for(let i=0; i < this.gmrData.length; i++){
                if(this.gmrData[i].qtyUnit == dataInput["quantityConversionFactor"][0].qtyUnit){
                  let qtyUnitConvert = parseFloat(dataInput["quantityConversionFactor"][0].value);
                  this.gmrData[i].qty =  this.gmrData[i].qty * qtyUnitConvert;
                }
              }
            }
            for(let j=0; j < this.gmrData.length; j++){
              gmrDetailsQty += this.gmrData[j].qty;
            }
            //console.log(gmrDetailsQty);
            this.gmrDetailsQty = gmrDetailsQty;
            if(this.gmrDetailsQty > 0){
              this.checkItemQty = true;
              this.onEditDisableFields();
              this.onEditDisablePricingFields();
              this.gmrAvailableForItem = true;
            }else{
              this.checkItemQty = false;
            }
          },errInput =>{
            //console.log(errInput)
            this.checkItemQty = false;
          }); 
        }else{
          for(let j=0; j < this.gmrData.length; j++){
            gmrDetailsQty += this.gmrData[j].qty;
          }
          this.gmrDetailsQty = gmrDetailsQty;
          if(this.gmrDetailsQty > 0){
            this.checkItemQty = true;
            this.onEditDisableFields();
            this.onEditDisablePricingFields();
            this.gmrAvailableForItem = true;
          }else{
            this.checkItemQty = false;
          }
        }
      },
      err =>{
        console.log(err);
        this.checkItemQty = false;
      })
    }
  }

  tieredDataMassage(splits){
    this.splitFormData = this.sortElementsDowntoUp(splits);
    this.splitsAvailableForItem = true;
    this.splitRanges = this.splitFormData.map(split => { return {"rangeStart" : split.splitFloor, "rangeEnd" : split.splitCeiling} });
    this.getSplitsFormulaNames();
  }

  calculatePaymentDueDate(){
    forkJoin(this.PaymentAndEventService.getPaymentTermDetails(this.contractData.provisionalPaymentTermId), 
    this.PaymentAndEventService.getIncotermDetails(this.contractData.incotermId)).subscribe((res:any)=>{
      //console.log(res);
      if(res[0].data && res[1].data){
          this.paymentTermDetails = res[0].data;
          this.incotermDetails = res[1].data;

          this.setCustomEvent();
          this.setCustomEventDate();
          //this.calculateBaseDate(this.itemDetails_form.get('deliveryFromDate').value, this.itemDetails_form.get('deliveryToDate').value);
          this.itemDetails_form.get('deliveryFromDate').valueChanges.subscribe(res=>{
            this.setCustomEventDate();
            this.calculateBaseDate(res, this.itemDetails_form.get('deliveryToDate').value);
          })
          this.itemDetails_form.get('deliveryToDate').valueChanges.subscribe(res=>{
            this.setCustomEventDate();
            this.calculateBaseDate(this.itemDetails_form.get('deliveryFromDate').value, res);
          })
    
          if(this.incotermDetails.locationField === 'DESTINATION'){
            this.setOptionalCountryAndLocation('DESTINATION');
            this.defaultValuationCountryLocation('DESTINATION');
            this.setCountryCalendar('destinationCountryId');
            let destinationCountryId = this.itemDetails_form.get('destinationCountryId').value;
            let existingTaxScheduleCountryId = this.itemDetails_form.get('taxScheduleCountryId').value;
            let newTaxScheduleCountryOption = this.fields.taxScheduleCountryId.options.find((option)=>option.key===destinationCountryId);
            if(destinationCountryId && existingTaxScheduleCountryId && newTaxScheduleCountryOption && newTaxScheduleCountryOption.key !== existingTaxScheduleCountryId){
              this.itemDetails_form.get('taxScheduleCountryId').setValue(destinationCountryId);
            }
            this.itemDetails_form.get('destinationCountryId').valueChanges.subscribe((res:any)=>{
              if(this.fields.taxScheduleCountryId.options.find((option)=>option.key===res)){
                this.itemDetails_form.get('taxScheduleCountryId').setValue(res);
                setTimeout(()=>this.setCountryCalendar('destinationCountryId'), 1000);
              }
            })
          } else {
            this.setOptionalCountryAndLocation('ORGINATION');
            this.defaultValuationCountryLocation('ORGINATION');
            this.setCountryCalendar('originationCountryId');
            let originationCountryId = this.itemDetails_form.get('originationCountryId').value;
            let existingTaxScheduleCountryId = this.itemDetails_form.get('taxScheduleCountryId').value;
            let newTaxScheduleCountryOption = this.fields.taxScheduleCountryId.options.find((option)=>option.key===originationCountryId);
            if(originationCountryId && existingTaxScheduleCountryId && newTaxScheduleCountryOption && newTaxScheduleCountryOption.key !== existingTaxScheduleCountryId){
              this.itemDetails_form.get('taxScheduleCountryId').setValue(originationCountryId);
            }
            this.itemDetails_form.get('originationCountryId').valueChanges.subscribe((res:any)=>{
              if(this.fields.taxScheduleCountryId.options.find((option)=>option.key===res)){
                this.itemDetails_form.get('taxScheduleCountryId').setValue(res);
                setTimeout(()=>this.setCountryCalendar('originationCountryId'), 1000);
              }
            })
          }
          this.itemDetails_form.get('taxScheduleCountryId')
      }
    })

    this.itemDetails_form.get('holidayRule').valueChanges.subscribe(res=>{
      this.holidayRule = res;
      this.calculateBaseDate(this.itemDetails_form.get('deliveryFromDate').value, this.itemDetails_form.get('deliveryToDate').value);
    })

  }

  setCustomEvent() {
    this.paymentTermDetails.baseDate
    let option = this.fields.customEvent.options.find(event=>{
      if(event.key === this.paymentTermDetails.baseDate){
        return event.key
      }
    })
    if(option){
      this.showPaymentEventDateAndName = true;
      this.itemDetails_form.get('customEvent').setValue(option.key);
      this.itemDetails_form.get('customEvent').disable({emitEvent : false});
    }else{
      this.showPaymentEventDateAndName = false;
    }
  }

  setCustomEventDate() {
    if(this.showPaymentEventDateAndName){
      let deliveryFromDate = this.itemDetails_form.get('deliveryFromDate').value;
      let deliveryToDate = this.itemDetails_form.get('deliveryToDate').value;
      this.customEventDate = this.PaymentAndEventService.calculateCustomEventDate(deliveryFromDate, deliveryToDate, this.incotermDetails);
      this.itemDetails_form.get('customEventDate').setValue(this.us.getMyDatePickerDate(this.customEventDate), {emitEvent: false});
      this.itemDetails_form.get('customEventDate').valueChanges.subscribe(res=>{
        this.customEventDate = res;
        this.calculateBaseDate(this.itemDetails_form.get('deliveryFromDate').value, this.itemDetails_form.get('deliveryToDate').value);
      })
    }
  }

  calculateBaseDate(DP_fromDate, DP_toDate){
    if(DP_fromDate && DP_toDate && this.incotermDetails && this.paymentTermDetails) {
      let paymentDueDate = this.PaymentAndEventService.calculateBaseDate(DP_fromDate, DP_toDate, this.paymentTermDetails, this.incotermDetails, this.holidayRule, this.customEventDate);
      if(paymentDueDate){
        this.itemDetails_form.get('paymentDueDate').setValue(paymentDueDate);
      }
    }
  }

  setCountryCalendar(field) {
    this.countryCalendar = this.itemTxtValues[field+"DisplayName"];
    console.log('country calendar');
    console.log(this.countryCalendar);
    if(this.countryCalendar){
      this.getHolidayList();
    }
  }

  getHolidayList() {
    this.PaymentAndEventService.getHolidaysList(this.countryCalendar).subscribe((res:any)=>{
      this.PaymentAndEventService.getHolidayList(res);
    })
    //this.calculateBaseDate(this.itemDetails_form.get('deliveryFromDate').value, this.itemDetails_form.get('deliveryToDate').value);
  }

  updateSplitsInContractObjSession(res){
    if((res.data && res.data.length > 0) || (_.has(res, [0,'data',0,'_id']))){
      if((Array.isArray(res))){
        res = res[0];
      }
      this.contractData = this.componentService.updateSplitFormData(this.contractData, res.data);
      this.cos.changeCurrentContractObject(this.contractData);
      sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(this.contractData));
    }
  }

  addContractQualityDensity(val){
    this.itemDetails_form.patchValue(val);
    if((val.densityMassQtyUnitId === '') && (val.densityVolumeQtyUnitId === '')){
      if(this.itemTxtValues.hasOwnProperty('densityMassQtyUnitIdDisplayName')){
        delete this.itemTxtValues['densityMassQtyUnitIdDisplayName'];
      }
      if(this.itemTxtValues.hasOwnProperty('densityVolumeQtyUnitIdDisplayName')){
        delete this.itemTxtValues['densityVolumeQtyUnitIdDisplayName'];
      }
      let item = this.contractData.itemDetails[this.itemIndex];
      if (item.hasOwnProperty("itemDisplayValue")) {
        let displayValue = JSON.parse(item["itemDisplayValue"]);
        if(displayValue.hasOwnProperty('densityMassQtyUnitIdDisplayName')){
          delete displayValue['densityMassQtyUnitIdDisplayName'];
        }
        if(displayValue.hasOwnProperty('densityVolumeQtyUnitIdDisplayName')){
          delete displayValue['densityVolumeQtyUnitIdDisplayName'];
        }
        item["itemDisplayValue"] = JSON.stringify({ ...displayValue, ...this.itemTxtValues });
      }
      this.addDisplayNames();
    }
    this.getConversionFactor();
  }

  getContractQualityDensityTitle(){
    let item = this.itemDetails_form.value;
    return item.densityFactor + ' ' + this.itemTxtValues['densityMassQtyUnitIdDisplayName'] + '/' + this.itemTxtValues['densityVolumeQtyUnitIdDisplayName'];
  }

  checkIntraCompanyChanges(){
    if(this.contractData.dealType === 'Inter_Company' || this.contractData.dealType === 'Intra_Company'){
      if(this.contractData.cpProfileId){
        let payload =  [
          { 
            serviceKey: 'corporateStrategy' 
          },
          { 
            serviceKey: 'userProfitCenterList',
            dependsOn: [this.contractData.intraCompanyTraderUserId]
          }
        ]
        let generalDetailsDisplayValue = JSON.parse(this.contractData["generalDetailsDisplayValue"]);
        console.log(generalDetailsDisplayValue);
        let cpProfileIdDisplayName = generalDetailsDisplayValue['cpProfileIdDisplayName'];
        this.mdm.getInterCompanyMDM(this.contractData.dealType, payload, cpProfileIdDisplayName).subscribe((res:any)=>{
          if(res.corporateStrategy){
            this.fields.internalStrategyAccId.options = res.corporateStrategy;
          }
          if(res.userProfitCenterList){
            this.fields.internalProfitCenterId.options = res.userProfitCenterList;
          }
        })
      }
      this.itemDetails_form.controls['internalProfitCenterId'].setValidators([Validators.required]);
      this.itemDetails_form.controls['internalStrategyAccId'].setValidators([Validators.required]);
    }else{
      this.itemDetails_form.controls['internalProfitCenterId'].clearValidators();
      this.itemDetails_form.controls['internalStrategyAccId'].clearValidators();
    }
  }

  getConversionFactor(){
    let conversionFactorPayload = {};

    conversionFactorPayload['densityValue'] = this.itemDetails_form.get('densityFactor').value;
    conversionFactorPayload['sourceUnitId'] = this.itemDetails_form.get('itemQtyUnitId').value;
    conversionFactorPayload['destinationUnitId'] = this.productBaseQtyUnitId;
    conversionFactorPayload['productId'] = this.itemDetails_form.get('productId').value;
    conversionFactorPayload['massUnitId'] = this.itemDetails_form.get('densityMassQtyUnitId').value;
    conversionFactorPayload['volumeUnitId'] = this.itemDetails_form.get('densityVolumeQtyUnitId').value;
    console.log(conversionFactorPayload);
    let values = Object.values(conversionFactorPayload);
    var nullValues = values.some(function(value) {
      return value === null;
    });
    if(!nullValues){
      this.cs.getConversionFactor(conversionFactorPayload).subscribe((res:any)=>{
        if(res && res.data.conversionFactor){
          this.itemDetails_form.get('contractPriceQtyBaseQtyConv').setValue(parseInt(res.data.conversionFactor));
        }else if(res.data.conversionFactor === 0){
          this.itemDetails_form.get('contractPriceQtyBaseQtyConv').setValue(null);
        }
      })
    }
  }

  getSplitsFormulaNames(){
    this.pricingFormulaNameArray = [];
    let pricingForSplits = [];
    for(var i=0;i<this.splitFormData.length;i++){
      let pricingGroup = this.itemDetails_form.get(
        'pricing'
      ) as FormArray;
      pricingGroup.get('pricingFormulaId').setValue(this.splitFormData[i].formulaId);
      pricingForSplits.push(this.cs	
        .getFormulaName(this.splitFormData[i].formulaId))
    }
    if(pricingForSplits.length > 0){
      this.loadingSplits = true;
      forkJoin(pricingForSplits).subscribe((data: any) => {	
        for(let j=0; j < data.length; j++){
          this.pricingFormulaNameArray.push(data[j][0].formulaName);
          this.splitFormula.push(data[j][0]._id)
        }    
        this.loadingSplits = false; 
      }, error => { this.loadingSplits = false; });
    }
  }

  setOptionalCountryAndLocation(incoterm){
    if(incoterm === 'DESTINATION'){
      this.destinationOptional = false;
      this.setValidators('destinationCountryId');
      this.setValidators('destinationLocationGroupTypeId');
      this.setValidators('destinationCityId');
      
      this.originationOptional = true;
      this.removeValidators('originationCountryId');
      this.removeValidators('loadingLocationGroupTypeId');
      this.removeValidators('originationCityId');

      this.ps.loadingAndDischargerHandler('discharge');
    }else{
      this.destinationOptional = true;
      this.removeValidators('destinationCountryId');
      this.removeValidators('destinationLocationGroupTypeId');
      this.removeValidators('destinationCityId');

      this.originationOptional = false;
      this.setValidators('originationCountryId');
      this.setValidators('loadingLocationGroupTypeId');
      this.setValidators('originationCityId');

      this.ps.loadingAndDischargerHandler('loading');
    }
    this.ps.itemDetailsFillPercentage(this.currentItem);
  }

  defaultValuationCountryLocation(incoterm){
    let contractItemValuationDTO = this.itemDetails_form.get('contractItemValuationDTO') as FormGroup;
    if(incoterm === 'DESTINATION'){
      this.itemDetails_form.get('destinationCountryId').valueChanges.subscribe((res)=>{
        contractItemValuationDTO.get('valuationCountryId').setValue(res);
        this.addDisplayNameToKey('valuationCountryId', res);
      });
      this.itemDetails_form.get('destinationLocationGroupTypeId').valueChanges.subscribe((res)=>{
        contractItemValuationDTO.get('locGroupTypeId').setValue(res);
        this.addDisplayNameToKey('locGroupTypeId', res);
      });
      this.itemDetails_form.get('destinationCityId').valueChanges.subscribe((res)=>{
        contractItemValuationDTO.get('valuationCityId').setValue(res);
        this.addDisplayNameToKey('valuationCityId', res);
      });
    }else{
      this.itemDetails_form.get('loadingLocationGroupTypeId').valueChanges.subscribe((res)=>{
        contractItemValuationDTO.get('locGroupTypeId').setValue(res);
        this.addDisplayNameToKey('locGroupTypeId', res);
      });
      this.itemDetails_form.get('originationCountryId').valueChanges.subscribe((res)=>{
        contractItemValuationDTO.get('valuationCountryId').setValue(res);
        this.addDisplayNameToKey('valuationCountryId', res);
      });
      this.itemDetails_form.get('originationCityId').valueChanges.subscribe((res)=>{
        contractItemValuationDTO.get('valuationCityId').setValue(res);
        this.addDisplayNameToKey('valuationCityId', res);
      });
    }
  }

  setValidators(formField){
    this.itemDetails_form.get(formField).setValidators([Validators.required]);
    this.itemDetails_form.get(formField).updateValueAndValidity({ emitEvent: false });
  }

  removeValidators(formField){
    this.itemDetails_form.get(formField).clearValidators();
    this.itemDetails_form.get(formField).updateValueAndValidity({ emitEvent: false });
  }

  ngOnDestroy(){
    this.formulaChangeSubscriber.unsubscribe();
    this.errorSubscriber.unsubscribe();
  }

}
