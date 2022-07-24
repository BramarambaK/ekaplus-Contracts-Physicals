import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from '@app/views/Contracts-Physicals/physicals-app/utils/util.service';
import { ContractService } from '../../../contract-service/contract-service.service';

@Component({
  selector: 'app-item-view-popup',
  templateUrl: './item-view-popup.component.html',
  styleUrls: ['./item-view-popup.component.scss']
})
export class ItemViewPopupComponent implements OnInit {

  @ViewChild('content') content: ElementRef;
  @Input() fields;
  @Input() splitData;
  item
  ContractView = [];
  num = 0;
  mandatoryFieldsCol1View = [];
  mandatoryFieldsCol2View = [];
  optionalFieldsCol1View = [];
  optionalFieldsCol2View = [];
  pricingFieldsView = [];
  secondaryCostFieldsView = [];
  addDedFieldsView = [];
  latePaymentInterestDetailsFieldsView = [];
  optionLoadFieldsView = [];
  optionDischargeFieldsView = [];
  secondaryCostHeaderList = [];
  addDedHeaderList = [];

  mandatoryFieldsCol1 = [
    'productId',
    'quality',
    'densityFactor',
    'densityMassQtyUnitId',
    'densityVolumeQtyUnitId',
    'itemQty',
    'toleranceMin',
    'toleranceMax',
    'minQty',
    'maxQty',
    'deliveryPeriod',
    'shipmentMode',
  ];

  mandatoryFieldsCol2 = [
    'originationCountryId',
    'originationCityId',
    'destinationCountryId',
    'destinationCityId',
    'paymentDueDate',
    'profitCenterId',
    'strategyAccId',
    'taxScheduleCountryId',
    'taxScheduleId',
    //'valuationFormula'
    'valuationIncotermId',
    'valuationCountryId',
    'valuationCityId',
    'locGroupTypeId'
  ];

  optionalFieldsCol1 = [
    'packingTypeId',
    'packingSizeId',
    'customEvent',
    'customEventDate',
    'holidayRule',
    'inspectionCompany'
  ]

  optionalFieldsCol2 = [
    'interestRateType',
    'interestRate',
    'variableType',
    'laycanDate',
    'unweighedPiPctValue' 
  ]

  columnArr = ['mandatoryFieldsCol1', 'mandatoryFieldsCol2', 'optionalFieldsCol1', 'optionalFieldsCol2'];

  perPriceTypeList = {
    Flat: ['payInCurId','priceTypeId','priceDf', 'priceUnitId', 'fxBasisToPayin'],
    'On Call Basis Fixed': [
      'payInCurId',
      'priceTypeId',
      'priceContractDefId',
      'priceFutureContractId',
      'basisPrice',
      'basisPriceUnitId',
      'earliestBy',
      'priceLastFixDayBasedOn',
      'optionsToFix',
      'fixationMethod'
    ],
    Fixed: [
      'payInCurId',
      'priceTypeId',
      'priceContractDefId',
      'priceFutureContractId',
      'futurePrice',
      'futurePriceUnitId',
      'basisPrice',
      'basisPriceUnitId',
      'fxInstToBasis',
      'fxBasisToPayin',
      'priceDf',
      'priceUnitId'
    ],
    FormulaPricing: ['payInCurId','priceTypeId', 'priceUnitId','pricingStrategy'],
    'Futures First': [
      'payInCurId',
      'priceTypeId',
      'priceContractDefId',
      'priceFutureContractId',
      'futurePrice',
      'futurePriceUnitId',
      'basisPriceUnitId',
      'earliestBy',
      'priceLastFixDayBasedOn',
      'optionsToFix',
      'fixationMethod'
    ]
  };

  secondaryCostList = [
    "cpProfileId",
    "costComponent",
    "costType",
    "rateType",
    "cost" ,
    "costUnit",
    "fxToBase",
    "comments"
  ];

  addDedList = [ ];

  closeResult: string;

  itemDisplayValues
  
  ngOnInit() { }

  constructor(private us:UtilService, private modalService: NgbModal, private cs: ContractService) { }

  open(content, item) {
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      this.showItemDeatils(item);
  }

  showItemDeatils(item){
    this.item = item;
    this.mandatoryFieldsCol1View = [];
    this.mandatoryFieldsCol2View = [];
    this.optionalFieldsCol1View = [];
    this.optionalFieldsCol2View = [];
    this.pricingFieldsView = [];
    this.secondaryCostFieldsView = [];
    this.addDedFieldsView = [];
    this.latePaymentInterestDetailsFieldsView = [];
    this.optionLoadFieldsView = [];
    this.optionDischargeFieldsView = [];
    this.secondaryCostHeaderList = [];
    this.addDedHeaderList = [];

    this.getDispalyDates();
    
    this.itemDisplayValues = JSON.parse(this.item.itemDisplayValue); 
    console.log(this.item);
    console.log(this.itemDisplayValues);
    
    this.calculateItemQtyByTolerance();

    this.columnArr.forEach(columnName => {
      let columnView = columnName + 'View';
      this[columnName].forEach(element => {
      let property = element + '.displayText';
      let elementDisplayName = element+'DisplayName'
        if(this.item.hasOwnProperty(property) && this.item[property] !== null) {
          this[columnView].push({ 'label': this.fields[element].label, 'value': this.item[property] })
        }else if (this.itemDisplayValues[elementDisplayName] && this.fields[element]) {
          this[columnView].push({ 'label': this.fields[element].label, 'value': this.itemDisplayValues[elementDisplayName] })
        // }else if (this.item[element] !== null && typeof(this.item[element]) === "number" && this.fields[element]) {
        //   this[columnView].push({ 'label': this.fields[element].label, 'value': this.item[element] })
        // }else if (this.fields[element] && this.fields[element].type === 'DateText'){
        //   this[columnView].push({ 'label': this.fields[element].label, 'value': this.item[element]})
        }else if (this.fields[element]){
          this[columnView].push({ 'label': this.fields[element].label, 'value': this.item[element] });
        }
      });
    });

    this.perPriceTypeList[item.priceTypeId].forEach(element => {
      let pricing = this.item;
      let property = element + '.displayText';
      let elementDisplayName = element+'DisplayName'
      if (pricing.hasOwnProperty(property) && pricing[property] !== null) {
        this.pricingFieldsView.push({ 'label': this.fields[element].label, 'value': pricing[property] })
      }else if (this.itemDisplayValues[elementDisplayName] && this.fields[element]) {
        this.pricingFieldsView.push({ 'label': this.fields[element].label, 'value': this.itemDisplayValues[elementDisplayName] })
      } else if (pricing[element] !== null) {
        this.pricingFieldsView.push({ 'label': this.fields[element].label, 'value': pricing[element] })
      } else {
        this.pricingFieldsView.push({ 'label': this.fields[element].label, 'value': '' });
      }
    });

    if(this.secondaryCostPresent()){
      this.secondaryCostList.forEach(element => {
        this.secondaryCostHeaderList.push(this.fields[element].label);
      });
      let secondaryCostDisplayName = this.itemDisplayValues.secondaryCostDisplayName;
      let secCostLen = this.item.estimates.length;
      for(let i=0;i<secCostLen;i++){
        let secondaryCost = this.item.estimates[i];
        this.secondaryCostFieldsView[i] = []; 
        this.secondaryCostList.forEach(element => {
          if(element === "costUnit"){
            if(secondaryCost['rateType'] === 'Rate'){
               secondaryCost['costUnit.displayText'] = secondaryCost['costUnitRate.displayText'];
            }else{
              secondaryCost['costUnit.displayText'] = secondaryCost['costUnitCurrency.displayText'];
            }
          }
          let property = element + '.displayText';
          let elementDisplayName = element + 'DisplayName';
          if (secondaryCost.hasOwnProperty(property) && secondaryCost[property] !== undefined && secondaryCost[property] !== null) {
            this.secondaryCostFieldsView[i].push({ 'label': this.fields[element].label, 'value': secondaryCost[property] })
          }else if (secondaryCostDisplayName[i][elementDisplayName] && this.fields[element]) {
            this.secondaryCostFieldsView[i].push({ 'label': this.fields[element].label, 'value': secondaryCostDisplayName[i][elementDisplayName] })
          } else if (secondaryCost[element] !== null) {
            this.secondaryCostFieldsView[i].push({ 'label': this.fields[element].label, 'value': secondaryCost[element] })
          } else {
            this.secondaryCostFieldsView[i].push({ 'label': this.fields[element].label, 'value': '' });
          }
        });
      }
    }

    if(this.addDedPresent()){
      this.addDedList = this.fields.additionsDeductions.fields;
      this.addDedList.forEach(element => {
        this.addDedHeaderList.push(this.fields[element.field].label);
      });
      let addDedLen = this.item.itemAdditionDeductions.length;
      let addDedDisplayName = this.itemDisplayValues.addDedDisplayName;
      for(let i=0;i<addDedLen;i++){
        let addDed = this.item.itemAdditionDeductions[i];
        this.addDedFieldsView[i] = []; 
        this.addDedList.forEach(element => {
          let field = element.field;
          let property = field + '.displayText';
          let elementDisplayName = element.scGroup + 'DisplayName';
          if (addDed.hasOwnProperty(property) && addDed[property] !== null) {
            this.addDedFieldsView[i].push({ 'label': this.fields[field].label, 'value': addDed[property] })
          }else if (addDedDisplayName[i][elementDisplayName] && this.fields[field]) {
            this.addDedFieldsView[i].push({ 'label': this.fields[field].label, 'value': addDedDisplayName[i][elementDisplayName] })
          } else if (addDed[field] !== null && this.fields[field]) {
            this.addDedFieldsView[i].push({ 'label': this.fields[field].label, 'value': addDed[field] })
          } else if (this.fields[field]) {
            this.addDedFieldsView[i].push({ 'label': this.fields[field].label, 'value': '' });
          }
        });
      }
    }

    if(this.item.priceTypeId === 'FormulaPricing'){
      this.cs.getFormulaName(this.item.pricingFormulaId)
      .subscribe((data: any) => {
        this.pricingFieldsView.push({ 'label': 'Formula', 'value': data[0].formulaName });
      });
    }

  }

  secondaryCostPresent(){
    return this.item.estimates.length > 0 ? true : false;
  }

  addDedPresent(){
    if(this.item.itemAdditionDeductions){
      return this.item.itemAdditionDeductions.length > 0 ? true : false;
    } 
    return false
  }

  getDispalyDates(){
    this.item["deliveryPeriod"] = this.us.getItemListDate(this.item.deliveryFromDate) + ' - ' + this.us.getItemListDate(this.item.deliveryToDate);
    this.fields["deliveryPeriod"].type = "DateText";
    this.item.earliestBy = this.us.getItemListDate(this.item.earliestBy);
    this.fields["earliestBy"].type = "DateText";
    this.item.paymentDueDate = this.us.getItemListDate(this.item.paymentDueDate);
    this.fields["paymentDueDate"].type = "DateText";
    if(this.item.customEventDate){
      this.item.customEventDate = this.us.getItemListDate(this.item.customEventDate);
      this.fields["customEventDate"].type = "DateText";
    }
    if(this.item.laycanStartDate){
      this.item["laycanDate"] = this.us.getItemListDate(this.item.laycanStartDate) + ' - ' + this.us.getItemListDate(this.item.laycanEndDate);
      this.fields["laycanDate"].type = "DateText";
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  calculateItemQtyByTolerance(){
    if(this.item.hasOwnProperty('toleranceMin') && this.item.hasOwnProperty('toleranceMax')){
      if (this.item.toleranceType === '%' || this.item.toleranceType === 'Percentage') {
        this.item['minQty'] = parseInt(this.item.itemQty) * ((100 - parseInt(this.item.toleranceMin)) / 100);
        this.item['maxQty'] = parseInt(this.item.itemQty) * ((100 + parseInt(this.item.toleranceMax)) / 100);
      } else {
        this.item['minQty'] = parseInt(this.item.itemQty) - parseInt(this.item.toleranceMin);
        this.item['maxQty'] = parseInt(this.item.itemQty) + parseInt(this.item.toleranceMax);
      }
    }else if(this.item.hasOwnProperty('tolerance')){
      if (this.item.toleranceType === '%') {
        this.item['minQty'] = parseInt(this.item.itemQty) * ((100 - parseInt(this.item.tolerance)) / 100);
        this.item['maxQty'] = parseInt(this.item.itemQty) * ((100 + parseInt(this.item.tolerance)) / 100);
      } else {
        this.item['minQty'] = parseInt(this.item.itemQty) - parseInt(this.item.tolerance);
        this.item['maxQty'] = parseInt(this.item.itemQty) + parseInt(this.item.tolerance);
      }
    }
    this.item['minQty'] = +this.item['minQty'].toFixed(2);
    this.item['maxQty'] = +this.item['maxQty'].toFixed(2);
  }

}
