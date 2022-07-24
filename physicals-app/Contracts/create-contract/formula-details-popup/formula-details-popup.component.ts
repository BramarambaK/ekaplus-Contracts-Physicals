import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PricingService } from '../../../../../Pricing/pricing-app/config.service';

@Component({
  selector: 'app-formula-details-popup',
  templateUrl: './formula-details-popup.component.html',
  styleUrls: ['./formula-details-popup.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})
export class FormulaDetailsPopupComponent implements OnInit {
  @Input() DataForPricing;
  @Input() formulaName;
  @Input() index;
  @Input() contractDetails;
  @Input() valuationField;
  @Input() itemIndex;
  @Input() mdmPriceUnit;
  @Input() formulaId;
  @Input() openInstantly;
  @Input() disableFormulaModification = false;
  @Input() fromViewContractPage = false;
  @ViewChild('content') content: ElementRef;
  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private pricingConfigService: PricingService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() { }

  ngOnChanges(changes){
    if(changes.fromViewContractPage){
      this.fromViewContractPage = changes.fromViewContractPage.currentValue;
    }
  }

  open(content=this.content) {
    this.modalService.open(content, {
      windowClass: 'ContractPopup'
    });
    this.pricingConfigService.changeCurrentComponent('formulaForm');
  }
}
