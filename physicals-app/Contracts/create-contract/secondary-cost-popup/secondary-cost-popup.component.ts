import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Urls } from '../../../urls';
import { PercentService } from '../side-bar/side-bar.component';
import { ContractService } from '../../contract-service/contract-service.service';
import * as _ from 'lodash';
import { MasterDataService } from '../master-data.service';
import { forkJoin, of } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-secondary-cost-popup',
  templateUrl: './secondary-cost-popup.component.html',
  styleUrls: ['./secondary-cost-popup.component.scss']
})
export class SecondaryCostPopupComponent implements OnInit {
  @Input() contract
  @Input() id
  @Input() itemIndex
  @Input() fields
  @Input() itemQty
  @Input() itemQtyUnitId
  @Input() estimates = [];
  @ViewChild('confirm') contractPopup;
  @Output() addSecCost = new EventEmitter<any>();
  estimatesNum = 0;
  secondaryCostForm
  editSecondaryCostForm = [];
  secondaryCostTableHeaders = [];
  displayValueList = [];
  keyValueList = [];
  editRow = [];
  showAddCost = false;
  group
  finalValidation = false;
  itemQuantity: string;
  baseCurrencyValue
  showWarning: boolean;
  errorMsg: string;
  secondaryCostTxtValues
  loadingComplete: boolean = false;
  isSecondaryCostIdEnabled = true;
  itemCheckPass: boolean = true;
  baseCurrencyDecimal = 5;
  estimateCurrencyDecimal = 5;
  productId

  ngOnInit() {}

  ngOnChanges(change) {
    if(change.estimates){
      this.calculateEstimatesNum(change.estimates.currentValue);
    }
  }

  closeResult: string;

  constructor(private mdm: MasterDataService, private cs: ContractService, private ps: PercentService, private modalService: NgbModal, private fb: FormBuilder, private http: HttpClient) {
      
  }

  setCostUnitOptions(rate) {
    if (rate === 'Rate') {
      this.fields.costUnit.options = this.fields.priceUnitId.options;
    } else {
      this.fields.costUnit.options = this.fields.costUnitCurrency.options;
    }
  }

  open(content) {
    this.modalService.open(content, { windowClass: 'contractSecondaryCostModal', ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    this.keyValueList = [];
    this.displayValueList = [];
    this.editRow = [];
    this.loadingComplete = false;
    
    if(this.itemQty && this.itemQtyUnitId && _.has(this.contract,['itemDetails',this.itemIndex,'pricing','payInCurId']) && this.contract.itemDetails[this.itemIndex].pricing.payInCurId){
      let itemUnit = this.getDisplayValue('itemQtyUnitId', this.itemQtyUnitId);
      this.itemQuantity = this.itemQty + ' ' + itemUnit;
      this.baseCurrencyValue = this.contract.itemDetails[this.itemIndex].pricing.payInCurId;
      this.productId = this.contract.itemDetails[this.itemIndex].productId
      this.fetchBaseCurrencyDecimal();
      this.itemCheckPass = true;
    }else{
      this.itemCheckPass = false;
    }

    let item = JSON.parse(JSON.stringify(this.contract.itemDetails[this.itemIndex]));
    if (item.hasOwnProperty('estimates') && item.estimates.length > 0) {
      let quantityConversionFactorsObs = []

      item.estimates.forEach(row=>{
        row['quantityConversionFactor'] = 1;
        if(row.rateType === "Rate"){
          row["priceUnitId"] = row.costUnit;
          let rateVal = this.getDisplayValue('priceUnitId', row["costUnit"]);
          let rateItemUnitDisplayVal = rateVal.split("/")[1];
          let rateItemVal = this.fields.itemQtyUnitId.options.filter(opt=>{
            return opt.value === rateItemUnitDisplayVal;
          })
          if(_.has(rateItemVal, [0, "key"]) && this.itemQtyUnitId !== rateItemVal[0].key){
            let conversionFactorPayload = this.getConversionFactorPayload(item, rateItemVal);
            if(conversionFactorPayload){
              let obs = this.cs.getConversionFactor(conversionFactorPayload).pipe(concatMap((res:any)=>{
                if(res && res.data.conversionFactor){
                  let conversionFactor = parseFloat(res.data.conversionFactor);
                  if(conversionFactor === 0){
                    return this.getMdmConversionFactor(rateItemVal, row);
                  } else {
                    row["quantityConversionFactor"] = conversionFactor;
                    return of(conversionFactor);
                  }
                } else if(res.data.conversionFactor === 0){
                  return this.getMdmConversionFactor(rateItemVal, row);
                }
              }));
              quantityConversionFactorsObs.push(obs);
            }else{
              let obs = this.getMdmConversionFactor(rateItemVal, row);
              quantityConversionFactorsObs.push(obs);
            }
          }
        }
      })

      if(quantityConversionFactorsObs.length>0){
        forkJoin(quantityConversionFactorsObs).subscribe((res:any)=>{
          this.initialize(item);
        })
      }else{
        this.initialize(item);
      }
    } else {
      this.initialize(item);
    }

  }
      
  initialize(item){
    if (item.hasOwnProperty('estimates') && item.estimates.length > 0) {
      item.estimates.forEach(row=>{
        row["itemQty"] = this.itemQuantity;
        if(row.rateType === "Rate"){
          row["priceUnitId"] = row.costUnit;
        }else{
          row["costUnitCurrency"] = row.costUnit;
        }
        row["costAmountInAccuralEstimateCurrency"] = this.getCostAmountInAccuralEstimateCurrency(row.rateType, row.cost, row.costUnit, row.quantityConversionFactor);
        row["costAmountInBaseCurrency"] = this.calculateFxToBase(row.fxToBase, row.cost, row.costUnit , row.rateType, row.quantityConversionFactor);
        row["cpProfileId"] = row.cpName;
        delete row['cpName'];
      });

      if(item.estimates.every(row=>row.hasOwnProperty('secondaryCostId'))){
        this.isSecondaryCostIdEnabled =true;
      }else{
        this.isSecondaryCostIdEnabled = false;
      }

      this.keyValueList = JSON.parse(JSON.stringify(item.estimates));
      if(this.keyValueList.length > 0){
        this.showAddCost = true
        if(this.isSecondaryCostIdEnabled){
          try {
            this.keyValueList.sort((a, b) => a.secondaryCostId - b.secondaryCostId);
          } catch(err) {
            console.log('unable to sort keyValuelist');
          }
        }
      }else{
        this.showAddCost = false;
      } 
      
      if(this.isSecondaryCostIdEnabled && item.itemDisplayValue){
        let displayValues = JSON.parse(item.itemDisplayValue);
        if(displayValues.secondaryCostDisplayName){
          let displayArr = displayValues.secondaryCostDisplayName.filter((row,index)=>{
            return item.estimates.some((estimate)=>estimate.secondaryCostId === row.secondaryCostIdDisplayName)
          })
          this.displayValueList = displayArr.map(row => {
            let displayRow = {};
            Object.keys(row).forEach(key=>{
              let _key = key.replace('DisplayName','');
              displayRow[_key] = row[key];
            })
            return displayRow;
          })
          try {
            this.displayValueList.sort((a, b) => a.secondaryCostId - b.secondaryCostId);
          } catch(err) {
            console.log('unable to sort displayValueList');
          }
          this.loadingComplete = true;
        }
      }

      if(item.estimates.length > 0 && this.displayValueList.length === 0){
        this.displayValueList = JSON.parse(JSON.stringify(item.estimates));
        let SCid2values = JSON.parse(JSON.stringify(item.estimates));
        SCid2values.forEach(row => {
                  row["SECONDARY_COST"] = "SECONDARY_COST";
                  row["CONTRACT"] = "CONTRACT";
                  row["dealType"] = this.contract.dealType;
        });
        this.cs.getSecodaryCostDisplayValues(SCid2values).subscribe((data:any)=>{
            data.forEach((row,index)=>{
              delete row["SECONDARY_COST"];
              delete row["CONTRACT"];
              delete row["dealType"];
              delete row["dealType.displayText"];
              if(!this.displayValueList[index]){
                this.displayValueList[index] = {};
              }
              for(let key in row){
                if(key.includes("displayText")){
                  let tempKey = key.split(".")[0];
                  if(tempKey.includes("costUnit")){
                    tempKey = "costUnit";
                  }
                  this.displayValueList[index][tempKey] = row[key];
                }
              }
            })
            this.loadingComplete = true;
        })
      }

    }else{
      this.keyValueList = [];
      this.displayValueList = [];
      this.loadingComplete = true;
    }

    this.finalValidation = false;

    this.secondaryCostTableHeaders[0] = this.fields.cpProfileId;
    this.secondaryCostTableHeaders[1] = this.fields.itemQty;
    this.secondaryCostTableHeaders[2] = this.fields.costComponent;
    this.secondaryCostTableHeaders[3] = this.fields.estimateFor;
    this.secondaryCostTableHeaders[4] = this.fields.incExpense;
    this.secondaryCostTableHeaders[5] = this.fields.rateType;
    this.secondaryCostTableHeaders[6] = this.fields.cost;
    this.secondaryCostTableHeaders[7] = this.fields.costUnit;
    this.secondaryCostTableHeaders[8] = this.fields.costAmountInAccuralEstimateCurrency;
    this.secondaryCostTableHeaders[9] = this.fields.fxToBase;
    this.secondaryCostTableHeaders[10] = this.fields.costAmountInBaseCurrency;
    this.secondaryCostTableHeaders[11] = this.fields.secondaryCostComments;
    this.secondaryCostTableHeaders[12] = {};

    this.secondaryCostTableHeaders[0]["scGroup"] = "cpProfileId";
    this.secondaryCostTableHeaders[1]["scGroup"] = "itemQty";
    this.secondaryCostTableHeaders[2]["scGroup"] = "costComponent";
    this.secondaryCostTableHeaders[3]["scGroup"] = "estimateFor";
    this.secondaryCostTableHeaders[4]["scGroup"] = "incExpense";
    this.secondaryCostTableHeaders[5]["scGroup"] = "rateType";
    this.secondaryCostTableHeaders[6]["scGroup"] = "cost";
    this.secondaryCostTableHeaders[7]["scGroup"] = "costUnit";
    this.secondaryCostTableHeaders[8]["scGroup"] = "costAmountInAccuralEstimateCurrency";
    this.secondaryCostTableHeaders[9]["scGroup"] = "fxToBase";
    this.secondaryCostTableHeaders[10]["scGroup"] = "costAmountInBaseCurrency";
    this.secondaryCostTableHeaders[11]["scGroup"] = "comments";
    this.secondaryCostTableHeaders[12]["scGroup"] = "quantityConversionFactor";

    this.secondaryCostTableHeaders[0]["type"] = "dropdown";
    this.secondaryCostTableHeaders[1]["type"] = "text";
    this.secondaryCostTableHeaders[2]["type"] = "dropdown";
    this.secondaryCostTableHeaders[3]["type"] = "dropdown";
    this.secondaryCostTableHeaders[4]["type"] = "dropdown";
    this.secondaryCostTableHeaders[5]["type"] = "dropdown";
    this.secondaryCostTableHeaders[6]["type"] = "inputText";
    this.secondaryCostTableHeaders[7]["type"] = "dropdown";
    this.secondaryCostTableHeaders[8]["type"] = "text";
    this.secondaryCostTableHeaders[9]["type"] = "inputText";
    this.secondaryCostTableHeaders[10]["type"] = "text";
    this.secondaryCostTableHeaders[11]["type"] = "inputText";
    this.secondaryCostTableHeaders[12]["type"] = "hidden";

    this.fields.costUnit.options = this.fields.costUnitCurrency.options;

    this.group = {
      cpProfileId: [null, Validators.required],
      itemQty: [this.itemQuantity],
      costComponent: [null, Validators.required],
      estimateFor: [null, Validators.required],
      incExpense: [null, Validators.required],
      rateType: [null, Validators.required],
      cost: [null, Validators.required],
      costUnit: [null, Validators.required],
      costAmountInAccuralEstimateCurrency: [null],
      fxToBase: [null, Validators.required],
      costAmountInBaseCurrency: [null],
      comments: [null],
      internalAccrualId: [null],
      operation : [null],
      quantityConversionFactor : [1]
    }
    
    this.secondaryCostForm = this.fb.group(this.group);
    this.monitorChanges(this.secondaryCostForm);

  }

  monitorChanges(form){
    
    let baseCurrencyValue = this.contract.itemDetails[this.itemIndex].pricing.payInCurId;

    form.get('rateType').valueChanges.subscribe(data => {
      form.get('costUnit').reset();
      if (data === 'Rate') {
        this.fields.costUnit.options = this.fields.priceUnitId.options;
      } else {
        this.fields.costUnit.options = this.fields.costUnitCurrency.options;
      }
    })

    form.get('cost').valueChanges.subscribe(data => {
      if (this.getValue(form,'costUnit')) {
        if (this.getValue(form,'rateType') === 'Absolute' && this.getValue(form,'costUnit')) {
          let val = data + ' ' + this.getDisplayValue('costUnitCurrency', this.getValue(form,'costUnit'));
          this.setValue(form,'costAmountInAccuralEstimateCurrency', val);
          let costAmountInBaseCurrency = this.calculateFxToBase(this.getValue(form,'fxToBase'), data, this.getValue(form,'costUnit') , this.getValue(form,'rateType'));
          this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
        } else if (this.getValue(form,'rateType') === 'Rate') {
          let rateVal = this.getDisplayValue('priceUnitId', this.getValue(form, 'costUnit'));
          let currencyDisplayVal = rateVal.split("/")[0]
          let val = (this.itemQty * data * this.getValue(form, 'quantityConversionFactor')).toFixed(this.estimateCurrencyDecimal) + ' ' + currencyDisplayVal;
          this.setValue(form,'costAmountInAccuralEstimateCurrency', val);
          let costAmountInBaseCurrency = this.calculateFxToBase(this.getValue(form,'fxToBase'), data, this.getValue(form,'costUnit') , this.getValue(form,'rateType'), this.getValue(form, 'quantityConversionFactor'));
          this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
        }
      }
    })

    form.get('costUnit').valueChanges.subscribe(data => {
      if (this.getValue(form,'cost')) {
        if (this.getValue(form,'rateType') === 'Absolute') {
          let val = this.getValue(form,'cost') + ' ' + this.getDisplayValue('costUnitCurrency', data);
          this.setValue(form,'costAmountInAccuralEstimateCurrency', val);
          this.fetchEstimateCurrencyDecimal(val, 'Absolute');
          if (baseCurrencyValue === data) {
            this.setValue(form,'fxToBase', 1);
            this.secondaryCostForm.get('fxToBase').disable();
          } else {
            form.get('fxToBase').enable();
          }
          let costAmountInBaseCurrency = this.calculateFxToBase(this.getValue(form,'fxToBase'), this.getValue(form,'cost'), data , this.getValue(form,'rateType'));
          this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
        } else if (this.getValue(form,'rateType') === 'Rate') {
          let rateVal = this.getDisplayValue('priceUnitId', data);
          this.fetchEstimateCurrencyDecimal(data, 'Rate');
          let currencyDisplayVal = rateVal.split("/")[0]
          let currencyVal = this.fields.costUnitCurrency.options.filter(opt=>{
            return opt.value === currencyDisplayVal;
          })
          let rateItemUnitDisplayVal = rateVal.split("/")[1];
          let rateItemVal = this.fields.itemQtyUnitId.options.filter(opt=>{
            return opt.value === rateItemUnitDisplayVal;
          })
          if(_.has(rateItemVal, [0, "key"]) && this.itemQtyUnitId !== rateItemVal[0].key){
            this.setValue(form,'costAmountInAccuralEstimateCurrency', 'calculating');
            this.setValue(form,'costAmountInBaseCurrency', 'calculating');
            this.setValue(form,'quantityConversionFactor', 1);
            let conversionFactorPayload = this.getConversionFactorPayload(this.contract.itemDetails[this.itemIndex], rateItemVal);
            if(conversionFactorPayload){
              this.cs.getConversionFactor(conversionFactorPayload).pipe(tap((res:any)=>{
                if(res && res.data.conversionFactor){
                  let quantityConversionFactor = parseFloat(res.data.conversionFactor);
                  if(quantityConversionFactor === 0){
                    this.getMdmConversionFactorOnChange(rateItemVal, form, currencyDisplayVal, data);
                  }else{
                    this.calculateCostAmountByConversionFactor(quantityConversionFactor, form, currencyDisplayVal, data);
                  }
                } else if(res.data.conversionFactor === 0){
                    this.getMdmConversionFactorOnChange(rateItemVal, form, currencyDisplayVal, data);
                }
              })).subscribe();
            }else{
              this.getMdmConversionFactorOnChange(rateItemVal, form, currencyDisplayVal, data);
            }
          }else{
            let val = (this.itemQty * this.getValue(form,'cost')).toFixed(this.estimateCurrencyDecimal) + ' ' + currencyDisplayVal;
            this.setValue(form,'costAmountInAccuralEstimateCurrency', val);
            let costAmountInBaseCurrency = this.calculateFxToBase(this.getValue(form,'fxToBase'), this.getValue(form,'cost'), data , this.getValue(form,'rateType'));
            this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
            this.setValue(form,'quantityConversionFactor', 1);
          }
          if (currencyVal[0] && baseCurrencyValue === currencyVal[0].key) {
            this.setValue(form,'fxToBase', 1);
            form.get('fxToBase').disable();
          } else {
            form.get('fxToBase').enable();
          }
          
        }
      }

    })

    form.get('costComponent').valueChanges.subscribe(data => {
      if (data) {
        let alreadyUsed = this.displayValueList.some(row => {
          return this.getDisplayValue('costComponent', data) === row.costComponent;
        })
        if (alreadyUsed) {
          form.get('costComponent').reset();
          this.contractPopup.open('Cost component "' + this.getDisplayValue('costComponent', data) + '" is already added');
        }
      }
    })

    form.get('fxToBase').valueChanges.subscribe(data=>{
      if(data && this.getValue(form,'cost') && this.getValue(form,'costUnit') && this.getValue(form,'costUnit')!==baseCurrencyValue){
        if(this.getValue(form,'rateType') === 'Absolute'){
          let costAmountInBaseCurrency = this.calculateFxToBase(data, this.getValue(form,'cost'), this.getValue(form,'costUnit') , this.getValue(form,'rateType'));
          this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
        }else{
          let costAmountInBaseCurrency = this.calculateFxToBase(data, this.getValue(form,'cost'), this.getValue(form,'costUnit') , this.getValue(form,'rateType'), this.getValue(form, 'quantityConversionFactor'));
          this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
        }
      }
    })

  }

  calculateFxToBase(fxToBaseVlue, cost, costUnit , rateType, quantityConversionFactor = 1){
    if(fxToBaseVlue && cost && costUnit && rateType){
      if(rateType === 'Absolute'){
        let costAmountInBaseCurrency = (fxToBaseVlue * cost).toFixed(this.baseCurrencyDecimal) + ' ' + this.getDisplayValue('costUnitCurrency', this.baseCurrencyValue);
        return costAmountInBaseCurrency;
      }else{
        let costAmountInBaseCurrency = (fxToBaseVlue * this.itemQty * quantityConversionFactor * cost).toFixed(this.baseCurrencyDecimal) + ' ' + this.getDisplayValue('costUnitCurrency', this.baseCurrencyValue);
        return costAmountInBaseCurrency;
      }
    }
  }

  getCostAmountInAccuralEstimateCurrency(rateType, cost, costUnit, quantityConversionFactor = 1){
    if(rateType === 'Absolute'){
      let val = cost + ' ' + this.getDisplayValue('costUnitCurrency', costUnit);
      return val;
    }else{
      let rateVal = this.getDisplayValue('priceUnitId', costUnit);
      let currencyDisplayVal = rateVal.split("/")[0]
      let val = (this.itemQty * cost * quantityConversionFactor).toFixed(this.estimateCurrencyDecimal) + ' ' + currencyDisplayVal;
      return val;
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

  getValue(form,field) {
    return form.get(field).value;
  }

  setValue(form,field, value) {
    form.get(field).setValue(value);
  }

  getDisplayValue(field, value) {
    if(field && value){
      let displayValue = this.fields[field].options.filter(opt => {
        return opt.key === value;
      });
      if(displayValue && displayValue[0]){
        return displayValue[0].value;
      }else{
        return "";
      }
    }else{
      return "";
    }
  }

  addCost(){
    this.showAddCost = !this.showAddCost;
    this.finalValidation = false; 
  }

  addRow() {
    if ((this.secondaryCostForm.valid)) {
      let _newSecCost = this.secondaryCostForm.getRawValue();
      _newSecCost['operation'] = 'CREATE';
      if(this.isSecondaryCostIdEnabled){
        _newSecCost['secondaryCostId'] = Math.floor((Math.random() * 10000000) + 1);
      }
      this.keyValueList.unshift(_newSecCost);
      let row = this.getDisplayValues(_newSecCost);
      this.displayValueList.unshift(row);
      this.editRow.push(false);
      this.showAddCost = true;
      this.secondaryCostForm.reset({itemQty : this.itemQuantity});
      console.log(this.keyValueList);
      console.log(this.displayValueList);
    } else {
      this.triggerValidation(this.secondaryCostForm);
    }
  }

  triggerValidation(form) {
    this.finalValidation = true;
    const controls = form.controls;
    this.errorMsg = 'Enter values for : ';
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errorMsg += '  \"' + this.fields[name].label + '\" '
      }
    }
    if(this.errorMsg === 'Enter values for : '){
      this.errorMsg = 'Comfirm addition of cost by clicking on the tick'
    }
    this.showWarning = true;
  }

  handleAlert(showAlert){
    if(showAlert){
      setTimeout(() => this.showWarning = false, 3000);
    }
    return showAlert;
  }
  
  closeAlert() {
    this.showWarning = false;
  }

  getDisplayValues(scCostValue) {
    let row = Object.assign({}, scCostValue);
    let _row = {};
    Object.keys(row).forEach((key, i) => {
      if (key !== 'itemQty') {
        if (row[key] && this.secondaryCostTableHeaders[i] && this.secondaryCostTableHeaders[i].type === 'dropdown') {
          let option = this.secondaryCostTableHeaders[i].options.filter(opt => opt.key === row[key])
          _row[key] = option[0].value;
        } else {
          _row[key] = row[key];
        }
      } else {
        _row[key] = this.itemQuantity
      }
    })
    return _row;
  }

  validateField(name, edit = false, index) {
    if(edit){
      if (!this.finalValidation) {
        return this.editSecondaryCostForm[index].get(name).invalid && this.editSecondaryCostForm[index].get(name).touched
      } else {
        return this.editSecondaryCostForm[index].get(name).invalid
      }
    }else{
      if (!this.finalValidation) {
        return this.secondaryCostForm.get(name).invalid && this.secondaryCostForm.get(name).touched
      } else {
        return this.secondaryCostForm.get(name).invalid
      }
    }
  }

  validateBeforeSave(){
    let editOn = this.editRow.every(ele=>{
       return !ele
    });
    if(this.showAddCost && editOn){
      return true
    }else{
      return false;
    }
  }

  saveSecondaryCost(modal) {
    if(this.validateBeforeSave()){
      this.keyValueList.forEach((row,index)=>{
        row.cpName = row.cpProfileId;
        delete row['cpProfileId'];
        row.cost = parseFloat(row.cost);
        row.fxToBase = parseFloat(row.fxToBase);
        delete row['costAmountInAccuralEstimateCurrency'];
        delete row['costAmountInBaseCurrency'];
        delete row['itemQty'];
      })
      this.contract.itemDetails[this.itemIndex].estimates = [...this.keyValueList];
      this.addSecCost.emit({keys :this.keyValueList, displayValues: this.displayValueList});
      this.calculateEstimatesNum(this.keyValueList);
      console.log(this.keyValueList);
      console.log(this.displayValueList);
      modal.close('Save click');
    }else{
      if(!this.showAddCost){
        this.triggerValidation(this.secondaryCostForm);
      }
      let editRowIndex = this.editRow.findIndex(ele=>{
        return ele
      });
      if(editRowIndex >= 0){
        this.triggerValidation(this.editSecondaryCostForm[editRowIndex]);
      }
    }
  }

  cancel(modal) {
    this.secondaryCostForm.reset();
    this.displayValueList = [];
    this.keyValueList = [];
    modal.dismiss('Cancel click')
  }

  clear() {
    this.secondaryCostForm.reset();
    this.setValue(this.secondaryCostForm,'itemQty', this.itemQuantity);
    this.showAddCost = true;
    this.finalValidation = false;
  }

  clearRow(i) {
    this.editSecondaryCostForm[i].reset();
    this.finalValidation = false;
  }

  editItem(i) {
    let edit = this.editRow.every(ele=>{
      return !ele
    });
    if(edit){
      this.editRow[i] = true;
      this.editSecondaryCostForm[i] = this.fb.group(this.group);
      this.setCostUnitOptions(this.keyValueList[i].rateType);
      this.editSecondaryCostForm[i].patchValue(this.keyValueList[i]);
      if(this.editSecondaryCostForm[i].get('fxToBase').value === 1){
        this.editSecondaryCostForm[i].get('fxToBase').disable();
      }
      this.monitorChanges(this.editSecondaryCostForm[i]);
    }else{
      this.showWarning = true;
      this.errorMsg = 'Complete the exiting edit of secondary cost';
    }
  }

  updateRow(i) {
    if(this.editSecondaryCostForm[i].valid){
      this.keyValueList[i] = { ...this.keyValueList[i], ...this.editSecondaryCostForm[i].getRawValue() }
      if(this.keyValueList[i]['internalAccrualId']){
        this.keyValueList[i]['operation'] = 'MODIFY';
      }
      let row = this.getDisplayValues(this.editSecondaryCostForm[i].getRawValue());
      this.displayValueList[i] = { ...this.displayValueList[i], ...row };
      this.editRow[i] = false;
      console.log(this.keyValueList);
      console.log(this.displayValueList);
    }else{
      this.triggerValidation(this.editSecondaryCostForm[i]);
    }
  }

  copyItem(i) {
    this.showAddCost = false;
    let clonedItem2 = JSON.parse(JSON.stringify(this.keyValueList[i]));
    clonedItem2['internalAccrualId'] = null;
    clonedItem2['operation'] = 'CREATE';
    clonedItem2['costComponent'] = null;
    if(this.isSecondaryCostIdEnabled){
      clonedItem2['secondaryCostId'] = Math.floor((Math.random() * 10000000) + 1);
    }
    this.secondaryCostForm.patchValue(clonedItem2); 
  }

  deleteItem(i) {
    if(this.keyValueList[i]['internalAccrualId']){
      this.keyValueList[i]['operation'] = 'DELETE';
    }else{
      this.keyValueList.splice(i, 1);
      this.displayValueList.splice(i, 1);
    }
  }

  calculateEstimatesNum(estimates){
    this.estimatesNum = estimates.reduce((acc,cur)=>{
      if(cur.operation !== 'DELETE'){
        acc ++;
      }
      return acc;
   },0);
  }

  fetchBaseCurrencyDecimal(){
    this.mdm.getPriceUnitDecimal(this.productId).subscribe((res:any)=>{
      let basePriceUnitValue = this.getDisplayValue('costUnitCurrency', this.baseCurrencyValue)+'/'+this.getDisplayValue('itemQtyUnitId', this.itemQtyUnitId);
      let basePriceUnitKey = this.fields.priceUnitId.options.filter(option=>option.value === basePriceUnitValue);
      console.log(basePriceUnitKey);
      if(Array.isArray(res) && basePriceUnitKey.length && basePriceUnitKey[0].key){
        let productCurrencyAttributes = res.filter(productAttributes => {
          return productAttributes.productPriceUnitsPkDO.internalPriceUnitId === basePriceUnitKey[0].key
        });
        this.baseCurrencyDecimal = productCurrencyAttributes[0].decimals;
        console.log('the base Currency Decimal is : '+ this.baseCurrencyDecimal);
      }
    })
  }

  fetchEstimateCurrencyDecimal(currency, type){
    if(type === 'Rate'){
      this.mdm.getPriceUnitDecimal(this.productId).subscribe((res:any)=>{
        if(Array.isArray(res)){
          let productCurrencyAttributes = res.filter(productAttributes => {
            return productAttributes.productPriceUnitsPkDO.internalPriceUnitId === currency
          });
          this.estimateCurrencyDecimal = productCurrencyAttributes[0].decimals;
          console.log('the estimate Currency Decimal is : '+ this.estimateCurrencyDecimal);
        }
      })
    }
  }

  getConversionFactorPayload(item, rateItemVal){
    let conversionFactorPayload = {};
    conversionFactorPayload['densityValue'] = item['densityFactor'];
    //conversionFactorPayload['destinationUnitId'] = item['itemQtyUnitId'];
    //conversionFactorPayload['sourceUnitId'] = rateItemVal[0].key;
    conversionFactorPayload['sourceUnitId'] = item['itemQtyUnitId'];
    conversionFactorPayload['destinationUnitId'] = rateItemVal[0].key;
    conversionFactorPayload['productId'] = item['productId'];
    conversionFactorPayload['massUnitId'] = item['densityMassQtyUnitId'];
    conversionFactorPayload['volumeUnitId'] = item['densityVolumeQtyUnitId'];
    console.log(conversionFactorPayload);
    let values = Object.values(conversionFactorPayload);
    var nullValues = values.some(function(value) {
      return value === null;
    });
    if(!nullValues){
      return conversionFactorPayload
    }else{
      return false
    }
  }

  calculateCostAmountByConversionFactor(quantityConversionFactor, form, currencyDisplayVal, data){
    this.setValue(form,'quantityConversionFactor', quantityConversionFactor);
    let val = (this.itemQty * this.getValue(form,'cost') * quantityConversionFactor).toFixed(this.estimateCurrencyDecimal)  + ' ' + currencyDisplayVal;
    this.setValue(form,'costAmountInAccuralEstimateCurrency', val);
    let costAmountInBaseCurrency = this.calculateFxToBase(this.getValue(form,'fxToBase'), this.getValue(form,'cost'), data , this.getValue(form,'rateType'), quantityConversionFactor);
    this.setValue(form,'costAmountInBaseCurrency', costAmountInBaseCurrency);
  }

  getMdmConversionFactor(rateItemVal, row){
    let productId = this.contract.itemDetails[this.itemIndex].productId;
    let rateItemKey = rateItemVal[0].key
    const postData = [
      {
        serviceKey: "quantityConversionFactor",
        dependsOn: [productId, this.itemQtyUnitId, rateItemKey]
      }
    ];
    let workFlowConfigBody:any = {
      workFlowTask: 'mdm_api',
      payLoadData: ''
    };
    workFlowConfigBody.appId = "5d907cd2-7785-4d34-bcda-aa84b2158415";
    workFlowConfigBody.data = postData;

    let obs = this.http.post(Urls.MDM_URL, workFlowConfigBody).pipe(
      tap((res:any)=>{
        if(_.has(res,["quantityConversionFactor",0,"value"])){
          row["quantityConversionFactor"] = parseFloat(res.quantityConversionFactor[0].value);
        }
      }));
    return obs;
  }

  getMdmConversionFactorOnChange(rateItemVal, form, currencyDisplayVal, data){
    let productId = this.contract.itemDetails[this.itemIndex].productId;
    this.mdm.getComboKeys("quantityConversionFactor",[productId, this.itemQtyUnitId, rateItemVal[0].key]).subscribe((res:any)=>{
      if(_.has(res, ["quantityConversionFactor",0,"value"])){
        let quantityConversionFactor = res.quantityConversionFactor[0].value;
        this.calculateCostAmountByConversionFactor(quantityConversionFactor, form, currencyDisplayVal, data);
      }
    })
  }

}
