import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { PricingService } from '../../../../../Pricing/pricing-app/config.service';
import { ContractService } from '../../contract-service/contract-service.service';

@Component({
  selector: 'pricing-popup',
  templateUrl: './pricing-popup.component.html',
  styleUrls: ['./pricing-popup.component.scss']
})
export class PricingPopupComponent implements OnInit {
  @Input() formulaName;
  @Input() formulaId;
  @Input() index;
  @Input() itemIndex;
  @Input() contractDetails;
  @Input() valuationField;
  @Input() DataForPricing;
  @Input() mdmPriceUnit;
  @Input() checkItemQty;
  @Input() valuation 
  @Input() disableFormulaModification = false;
  @Input() currentItem
  @Input() fromViewContractPage = false;
  ngOnInit() {
    this.formula = this.formulaName;
  }

  ngOnChanges(change) {
    if(change.formulaName){
      this.formula = change.formulaName.currentValue;
    }
    if (change.index) {
      this.index = change.index.currentValue;
    }
    if(change.fromViewContractPage){
      this.fromViewContractPage = change.fromViewContractPage.currentValue;
    }
  }

  closeResult: string;
  formula;
  constructor(
    private cs: ContractService,
    private pricingConfigService: PricingService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  open(content) {

    //let currentItem = this.contractDetails.itemDetails[this.itemIndex];
    let errorMsg = "";
    if(!this.currentItem.deliveryFromDate || !this.currentItem.deliveryToDate){
      errorMsg += " 'Delivery Period' "
    }
    if(!this.currentItem.pricing.payInCurId){
      errorMsg += " 'Pay-In Settlement Currency' "
    }
    if(!this.currentItem.pricing.priceUnitId){
      errorMsg += " 'Price Unit' "
    }
    if(!this.mdmPriceUnit || this.mdmPriceUnit.length === 0){
      errorMsg += " 'MDM Price Units Dropdown' "
    }

    if(errorMsg){
      errorMsg = `Enter the following for Formula Pricing : ${errorMsg}`;
      this.cs.reqFailedObs.observers = this.cs.reqFailedObs.observers.slice(-1);
      this.cs.reqFailedObs.next(errorMsg);
    }else{
      this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        windowClass: 'ContractPopup'
      })
      .result.then(
        result => {
          this.closeResult = `Closed with: ${result}`;
        },
        reason => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    }
    
    this.pricingConfigService.changeCurrentComponent('listing');

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
}
