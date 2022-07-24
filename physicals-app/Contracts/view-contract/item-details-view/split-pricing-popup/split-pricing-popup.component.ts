import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PricingService } from '@app/views/Pricing/pricing-app/config.service';

@Component({
  selector: 'split-pricing-popup',
  templateUrl: './split-pricing-popup.component.html',
  styleUrls: ['./split-pricing-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SplitPricingPopupComponent implements OnInit {

  @Input() splitsData;
  @Input() contractDetails;
  @Input() itemIndex;
  @Input() mdmPriceUnit;
  itemSplits = [];
  
  closeResult: string;
  tabNames = [];

  contractDetailsWithSplitFormula = [];

  constructor(private modalService: NgbModal, private pricingConfigService: PricingService) {}

  ngAfterViewInit() {}

  open(content) {
    let itemNo = this.contractDetails.itemDetails[this.itemIndex].itemNo;
    this.itemSplits = this.splitsData[itemNo];
    for(let i=0; i<this.itemSplits.length; i++){
      let _tempContract = JSON.parse(JSON.stringify(this.contractDetails));
      _tempContract.itemDetails[this.itemIndex].pricing.pricingFormulaId = this.itemSplits[i].formulaId;
      _tempContract.itemDetails[this.itemIndex].pricing.pricingFormulaName = this.itemSplits[i].formulaName;
      this.contractDetailsWithSplitFormula[i] = _tempContract;
    }
    console.log(this.contractDetailsWithSplitFormula);
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',size: 'lg',windowClass: 'ContractPopup'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    console.log(this.splitsData);
    this.pricingConfigService.changeCurrentComponent('formulaForm');
  }

  ngOnInit() {
    console.log('hello from splits popup');
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

  handleTabChange(e) {
    let currentTab = e.index;
    console.log(e);
  }

}
