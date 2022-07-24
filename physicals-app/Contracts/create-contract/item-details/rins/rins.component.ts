import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'RINs',
  templateUrl: './rins.component.html',
  styleUrls: ['../item-details.component.scss', './rins.component.scss']
})
export class RINsComponent implements OnInit {

  @Input() fields
  @Input() renewableForm
  @Input() finalValidation

  itemQuantity
  rinEquivalanceValueObs
  rinQuantityObs
  isRinContract

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeIsRinContract();
    this.subscribe_itemQuantityChanges();
    this.subscribe_rinEquivalanceValue();
    this.subscribe_rinQuantity();
  }

  ngOnChanges(change) {
    if(change.finalValidation){
      this.finalValidation = change.finalValidation.currentValue;
      console.log(this.finalValidation)
    }
  }

  initializeIsRinContract(){
    let val = this.renewableForm.get('isRinContract').value;
    if(val === 'Y'){
      this.isRinContract = true;
    }else{
      this.isRinContract = false;
    }
  }

  get rinUnit() { return this.renewableForm.get('rinUnit'); }
  get rinEquivalanceValue() { return this.renewableForm.get('rinEquivalanceValue'); }
  get rinQuantity() { return this.renewableForm.get('rinQuantity'); }

  isRinContractCheck(value){
    if(value){
      this.renewableForm.get('isRinContract').setValue("Y");
      this.rinUnit.setValue("RINS"); 
      this.rinEquivalanceValue.setValidators([Validators.required]);
      this.rinQuantity.setValidators([Validators.required]);
    }else{
      this.renewableForm.get('isRinContract').setValue("N");
      this.rinUnit.setValue(null);
      this.rinEquivalanceValue.setValue(null);
      this.rinQuantity.setValue(null);
      this.rinEquivalanceValue.setValidators(null);
      this.rinQuantity.setValidators(null);
    }
    this.rinEquivalanceValue.updateValueAndValidity();
    this.rinQuantity.updateValueAndValidity();
  }

  subscribe_itemQuantityChanges() {
    this.itemQuantity = this.renewableForm.get('itemQty').value;
    this.renewableForm.get('itemQty').valueChanges.subscribe(res => {
      this.itemQuantity = res;
      if (this.isRinContract) {
        let val = this.renewableForm.get('rinEquivalanceValue').value;
        this.renewableForm.get('rinEquivalanceValue').setValue(val);
      }
    })
  }

  subscribe_rinEquivalanceValue() {
    this.rinEquivalanceValueObs = this.renewableForm.get('rinEquivalanceValue').valueChanges.subscribe(rinEquivalanceValue => {
      let rinQuantity = this.itemQuantity * rinEquivalanceValue;
      this.unSubscribeFrom('rinQuantityObs');
      this.renewableForm.get('rinQuantity').setValue(rinQuantity);
      this.subscribe_rinQuantity();
    })
  }

  subscribe_rinQuantity() {
    this.rinQuantityObs = this.renewableForm.get('rinQuantity').valueChanges.subscribe(rinQuantity => {
      let rinEquivalanceValue = rinQuantity / this.itemQuantity;
      this.unSubscribeFrom('rinEquivalanceValueObs');
      this.renewableForm.get('rinEquivalanceValue').setValue(rinEquivalanceValue);
      this.subscribe_rinEquivalanceValue();
    })
  }

  unSubscribeFrom(obsName) {
    this[obsName].unsubscribe();
  }
}

