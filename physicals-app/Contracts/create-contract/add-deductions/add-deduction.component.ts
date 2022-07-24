import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Urls } from '../../../urls';
import { PercentService } from '../side-bar/side-bar.component';
import { ContractService } from '../../contract-service/contract-service.service';
import { MasterDataService } from '../master-data.service';

@Component({
  selector: 'app-add-deduction',
  templateUrl: './add-deduction.component.html',
  styleUrls: ['./add-deduction.component.scss']
})
export class AddDeductionComponent implements OnInit {
  @Input() fields
  @Input() contract
  @Input() itemIndex
  @Input() id
  @Input() currentItem
  @Input() addDed = [];
  @ViewChild('confirm') contractPopup;
  @Output() addAddDeduction = new EventEmitter<any>();
  addDedNum = 0;
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
  textFields = {};
  priceUnitId
  priceCurrency

  ngOnInit() { }

  ngOnChanges(change) {
    if(change.addDed){
      this.calculateAddDedNum(change.addDed.currentValue);
    }
  }

  closeResult: string;

  constructor(private mdm : MasterDataService,private cs: ContractService, private ps: PercentService, private modalService: NgbModal, private fb: FormBuilder, private http: HttpClient) {
      
  }

  costUnit() {
    let rate = this.group.get('rateType').value;
    if (rate && rate === 'Rate') {
      return this.group.get('costUnitRate');
    } else {
      return this.group.get('costUnitCurrency');
    }
  }
  
  showAdditionDeductions(content){
    let pricingUnitId 
    if(this.currentItem.pricing){
      pricingUnitId = this.currentItem.pricing.priceUnitId;
    }
    this.mdm.getMdmForAdditionDeduction(this.currentItem.productId, this.fields, pricingUnitId)
    .subscribe(()=>{
      this.open(content)
    })
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

    if(this.currentItem.pricing && this.currentItem.pricing.priceTypeId){
      let priceType =  this.currentItem.pricing.priceTypeId;
      if(priceType === 'Flat' || priceType === 'FormulaPricing'){
        this.priceUnitId = this.currentItem.pricing.priceUnitId;
      }else{
        this.priceUnitId = this.currentItem.pricing.basisPriceUnitId;
      }
    }

    if(this.priceUnitId){
      let option = this.fields.priceUnitId.options.find(row=>{
        return this.priceUnitId === row.key;
      })
      if(option){
        this.priceCurrency = option.value.split("/")[0];
      }
    }

    let item = JSON.parse(JSON.stringify(this.contract.itemDetails[this.itemIndex]));
    if (item.hasOwnProperty('itemAdditionDeductions') && item.itemAdditionDeductions.length > 0) {
      let itemAdditionDeductions = [...item.itemAdditionDeductions];
      this.keyValueList = JSON.parse(JSON.stringify(itemAdditionDeductions));
      this.displayValueList = JSON.parse(JSON.stringify(itemAdditionDeductions));
      this.keyValueList.length > 0 ? this.showAddCost = true : this.showAddCost = false;
      let keyData = [...itemAdditionDeductions];
      keyData.forEach(row=>{
        if(row.rateType === "rate"){
          row["costUnitRate"] = row.costUnit;
        }else{
          row["costUnitCurrency"] = row.costUnit;
        }
      })
      let SCid2values = JSON.parse(JSON.stringify(itemAdditionDeductions));
      SCid2values.forEach(row => {
                 row["productId"] = this.currentItem.productId;
                 row["rateTypePrice"] = row["rateType"];
                 if(row["rateTypePrice"]==="rate"){
                   row["priceUnitId"] = this.priceUnitId;     
                 }
      });
      this.cs.getSecodaryCostDisplayValues(SCid2values).subscribe((data:any)=>{
           data.forEach((row,index)=>{
             row["rateType.displayText"] = row["rateTypePrice.displayText"];
             if(row.rateType === 'absolute'){
               row["costPriceUnitId.displayText"] = this.priceCurrency;
             }else if(row.rateType === 'PER_PRICE'){
              row["costPriceUnitId.displayText"] = '%';
             }
             for(let key in row){
               if(key.includes("displayText")){
                 let tempKey = key.split(".")[0];
                 this.displayValueList[index][tempKey] = row[key];
               }
             }
           })
      })
    }else{
      this.keyValueList = [];
      this.displayValueList = [];
    }

    this.finalValidation = false;

    this.secondaryCostTableHeaders = this.fields.additionsDeductions.fields.map(ele=>{
         let _temp = { ...ele, ...this.fields[ele.field] }
         return _temp;
    });

    console.log(this.secondaryCostTableHeaders);

    this.fields.costUnit.options = this.fields.costUnitCurrency.options;

    this.group = this.fields.additionsDeductions.fields.reduce((acc, cur)=>{
      let _temp = {};
      if(cur.required){
        _temp[cur.scGroup] = [null, Validators.required];
      }else{
        _temp[cur.scGroup] = [null];
      }
      _temp = { ...acc, ..._temp }
      return _temp;
    }, {});
    
    this.secondaryCostForm = this.fb.group(this.group);
    console.log(this.secondaryCostForm);
    this.monitorChanges(this.secondaryCostForm);

  }

  monitorChanges(form){
    form.get('rateType').valueChanges.subscribe(data => {
      this.loadCostPrice(form, data);
    })
  }

  loadCostPrice(form, data){
    form.get('weightBasisId').enable();
      if (data === 'rate') {
        this.secondaryCostTableHeaders[4].options = this.fields.costPriceUnitId.options;
      } else if (data === 'absolute') {
        this.secondaryCostTableHeaders[4].options = this.fields.costUnitCurrency.options.filter(option=>{
          return option.value === this.priceCurrency
        });
        form.get('weightBasisId').reset();
        form.get('weightBasisId').disable();
      } else if (data === 'PER_PRICE') {
        this.secondaryCostTableHeaders[4].options = [{ key: '%', value: '%'}];
        form.get('costPriceUnitId').setValue('%');
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
    let displayValue = this.fields[field].options.filter(opt => {
      return opt.key === value;
    });
    return displayValue[0].value;
  }

  addTextField(event, fieldName){
    let field = fieldName.slice(0, -2);
    let necessaryTextFields = { addDedName : true, weightBasis: true }
    if(necessaryTextFields[field]){
      if(event.target.options){
        this.textFields[field] = event.target.options[event.target.options.selectedIndex].text;
      }
    }
  }

  addRow() {
    if ((this.secondaryCostForm.valid)) {
        let _newSecCost = this.secondaryCostForm.getRawValue();
        _newSecCost['productId'] = this.currentItem.productId;
        _newSecCost['entryType'] = 'New';
        Object.assign(_newSecCost,this.textFields);
        this.textFields = {};
        let additionalFields = {
          "internalAddDedId": "",
          "contractItem": "",
          "contractItemTitle": "",
          "wtBasisOn": null,
          "wtBasisType": null,
          "isEditable": "",
          "isDeleted": false
        }
        Object.assign(_newSecCost,additionalFields);
        this.keyValueList.unshift(_newSecCost);
        let row = this.getDisplayValues(_newSecCost);
        this.displayValueList.unshift(row);
        this.editRow.push(false);
        this.showAddCost = true;
    } else {
      this.finalValidation = true;
      this.findInvalidControls();
      this.showWarning = true;
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

  findInvalidControls() {
    const controls = this.secondaryCostForm.controls;
    this.errorMsg = 'Enter values for : ';
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errorMsg += '  \"' + this.fields[name].label + '\" '
      }
    }
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

  validateField(name, form) {
    if (!this.finalValidation) {
      return form.get(name).invalid && form.get(name).touched
    } else {
      return form.get(name).invalid
    }
  }

  saveAddDeduction(modal) {
    this.keyValueList.forEach((row,index)=>{
      row.costValue = parseFloat(row.costValue);
    })
    let displayNames = this.displayValueList.map(row=>{
      let displayNamesRow = {};
      Object.keys(row).map(field=>{
        displayNamesRow[field+'DisplayName'] = row[field];
      })
      return displayNamesRow;
    })
    this.contract.itemDetails[this.itemIndex].itemAdditionDeductions = [...this.keyValueList];
    this.addAddDeduction.emit({'keyValue' : this.keyValueList, 'displayNames': displayNames});
    this.calculateAddDedNum(this.keyValueList);
    modal.close('Save click');
  }

  cancel(modal) {
    this.secondaryCostForm.reset();
    this.displayValueList = [];
    this.keyValueList = [];
    modal.dismiss('Cancel click')
  }

  clear() {
    this.secondaryCostForm.reset();
    if(this.itemQuantity){
      this.setValue(this.secondaryCostForm,'itemQty', this.itemQuantity);
    }
    this.showAddCost = true;
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
      this.editSecondaryCostForm[i].patchValue(this.keyValueList[i]);
      let rateType = this.editSecondaryCostForm[i].get('rateType').value;
      this.loadCostPrice(this.editSecondaryCostForm[i], rateType);
      this.monitorChanges(this.editSecondaryCostForm[i]);
    }else{
      this.showWarning = true;
      this.errorMsg = 'Complete the existing edit by clicking on the tick';
    }
  }

  updateRow(i) {
    if(this.editSecondaryCostForm[i].valid){
      let updatedRow = this.editSecondaryCostForm[i].getRawValue();
      this.keyValueList[i] = { ...this.keyValueList[i], ...updatedRow };
      let row = this.getDisplayValues(this.editSecondaryCostForm[i].getRawValue());
      this.displayValueList[i] = row;
      this.editRow[i] = false;
    }else{
      this.triggerValidation(this.editSecondaryCostForm[i]);
    }
  }

  copyItem(i) {
    this.showAddCost = false;
    let keyValClone = JSON.parse(JSON.stringify(this.keyValueList[i]));
    keyValClone['entryType'] = 'New';
    this.secondaryCostForm.patchValue(keyValClone);
  }

  deleteItem(i) {
    if(this.keyValueList[i]['entryType'] === 'Existing'){
      this.keyValueList[i]['isDeleted'] = true;
    }else{
      this.displayValueList.splice(i, 1);
      this.keyValueList.splice(i, 1);
    }
  }

  calculateAddDedNum(addDed){
    if(addDed){
      this.addDedNum = addDed.reduce((acc,cur)=>{
          if(!cur.isDeleted){
            acc ++;
          }
          return acc;
      },0);
    }
  }

}


