import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { PricingService } from '../../../../../Pricing/pricing-app/config.service';

@Component({
  selector: 'app-valuation-details',
  templateUrl: './valuation-details.component.html',
  styleUrls: ['./valuation-details.component.scss']
})
export class ValuationDetailsComponent implements OnInit {
  @Input() formulaName;
  @Input() index;
  @Input() contractDetails;
  @Input() valuationField;
  @Input() valid;
  currentStyles;
  ngOnInit() {
    this.formula = this.formulaName;
  }

  ngOnChanges(change) {
    if (!!change.formulaName) {
      this.formula = change.formulaName.currentValue;
    }
    if (!!change.valid) {
      this.valid = change.valid.currentValue;
    }
    if (!!change.index) {
      this.index = change.index.currentValue;
    }
    this.currentStyles = {
      'background-color': this.formula ? '#eee' : '#fff'
    };
  }

  closeResult: string;
  formula;
  constructor(
    private pricingConfigService: PricingService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  open(content) {
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

    // this.pricingConfigService.contractFormula.subscribe((formula: any) => {
    //   this.formula = formula.formulaName;
    // })

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
