import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PercentService {
  gen
  itd
  genchange: Subject<number> = new Subject<number>();
  itdchange: Subject<number> = new Subject<number>();
  docPercent: Subject<number> = new Subject<number>();
  showItemList: Subject<boolean> = new Subject<boolean>();
  itemNo: Subject<String> = new Subject<String>();
  isNewItemVal: Subject<String> = new Subject<String>();
  newContractId: Subject<String> = new Subject<String>();
  completePercent

  generalDetailsMandatoryFields = [
    'issueDate',
    'dealType',
    'contractType',
    'traderUserId',
    'cpProfileId',
    'paymentTermId',
    'provisionalPaymentTermId',
    'applicableLawId',
    'arbitrationId',
    'incotermId',
    'totalQtyUnitId',
    'legalEntityId'
  ];

  itemDetailsMandatoryFields = {
    'productId' : true,
    'quality' : true,
    'itemQty' : true,
    'itemQtyUnitId' : true,
    'toleranceLevel' : true,
    'toleranceType' : true,
    'shipmentMode' : true,
    'deliveryFromDate' : true,
    'deliveryToDate' : true,
    'paymentDueDate' : true,
    'profitCenterId' : true,
    'strategyAccId' : true,
    'taxScheduleCountryId' : true,
    'taxScheduleId' : true,
    //'valuationFormula'
    'toleranceMin' : true,
    'toleranceMax' : true
  };

  perPriceTypeValidationList = {
    Flat: ['priceDf', 'priceUnitId', 'fxBasisToPayin'],
    'On Call Basis Fixed': [
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
    FormulaPricing: ['pricingStrategy', 'priceUnitId'],
    'Futures First': [
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


  genp(p) {
    this.genchange.next(p);
  }
  itdp(p) {
    this.itdchange.next(p);
  }
  setDocPercent(p) {
    this.docPercent.next(p);
  }
  showItems(val) {
    this.showItemList.next(val);
  }
  changedItemNo(ref) {
    this.itemNo.next(ref);
  }
  isNewItem(val){
    this.isNewItemVal.next(val);
  }
  setNewContractId(val){
    this.newContractId.next(val);
  }
  setSingleTolerance(val){
   if(val){
     delete this.itemDetailsMandatoryFields["toleranceMin"];
     delete this.itemDetailsMandatoryFields["toleranceMax"];
     this.itemDetailsMandatoryFields["tolerance"] = true;
   }
  }

  loadingAndDischargerHandler(addGroup){
    if(addGroup === 'discharge'){
      delete this.itemDetailsMandatoryFields['loadingLocationGroupTypeId'];
      delete this.itemDetailsMandatoryFields['originationCityId'];
      delete this.itemDetailsMandatoryFields['originationCountryId'];
      this.itemDetailsMandatoryFields['destinationCountryId'] = true;
      this.itemDetailsMandatoryFields['destinationLocationGroupTypeId'] = true;
      this.itemDetailsMandatoryFields['destinationCityId'] = true;
    }else if(addGroup === 'loading'){
      delete this.itemDetailsMandatoryFields['destinationCountryId'];
      delete this.itemDetailsMandatoryFields['destinationLocationGroupTypeId'];
      delete this.itemDetailsMandatoryFields['destinationCityId'];
      this.itemDetailsMandatoryFields['loadingLocationGroupTypeId'] = true;
      this.itemDetailsMandatoryFields['originationCityId'] = true;
      this.itemDetailsMandatoryFields['originationCountryId'] = true;
    }
  }

  generalDetailsFillPercentage(data) {
    let generalDetails_completePercent = 0;
    let eachFraction = 100 / this.generalDetailsMandatoryFields.length;
    this.generalDetailsMandatoryFields.forEach(element => {
      if (data[element]) {
        generalDetails_completePercent += eachFraction;
      }
    });
    this.genp(Math.ceil(generalDetails_completePercent));
    if (Math.ceil(generalDetails_completePercent) >= 100) {
      return true;
    }else{
      return false;
    }
  }

  itemDetailsFillPercentage(data) {
    this.completePercent = 0;
    if (data) {
      let mandatoryFields = Object.keys(this.itemDetailsMandatoryFields);
      let numOfMandatoryFields = mandatoryFields.length;
      let perFieldCompletePercentage = 80/numOfMandatoryFields;
      mandatoryFields.forEach(element => {
        if (data[element] || data[element] === 0) {
          this.completePercent += perFieldCompletePercentage;
        } else {
          //console.log(element + ' not filled');
        }
      });
      if (data.pricing && data.pricing.priceTypeId && data.pricing.priceTypeId !== 'loading') {
        let pricing = { ...data.pricing };
        let pricingComplete = this.perPriceTypeValidationList[
          pricing.priceTypeId
        ].every(field => {
          if(!pricing[field]){
            console.log(field+ ' not filled')
          }
          return pricing[field] !== null;
        });
        if (pricingComplete) {
          this.completePercent += 20;
        }
      }
      // if (data.estimates && data.estimates.length){
      //     this.completePercent += 8;
      // }
      this.completePercent = Math.round(this.completePercent);
      this.itdp(this.completePercent);
      return this.completePercent;
    } else {
      this.completePercent = 0;
      this.showItems(false);
      this.itdp(0);
    }
  }
}


import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, Event } from '@angular/router'
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Urls } from '../../../urls';
import { ContractService } from '../../contract-service/contract-service.service';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit {
  id
  itemNo = 0;
  icon = "play_arrow"
  menu_icons
  view = false;
  gen = 0;
  itd = 0;
  edit = false;
  clone = false;
  itemsGenerated = false
  itemDetailsScreen = false
  newDraftNum
  printUrl
  newItem = false;
  docUploadPercent = 0;
  constructor(private cs: ContractService, private http: HttpClient, private ps: PercentService, private elem: ElementRef, private route: ActivatedRoute, private router: Router) {
    
    router.events.subscribe((event: Event) => {
      this.view = this.router.url.includes("view");
      this.edit = this.router.url.includes("edit");
      this.clone = this.router.url.includes("clone");
      this.newItem = this.router.url.includes("newItem"); 
      this.itemsGenerated = this.router.url.includes("item-list");
      this.itemDetailsScreen = this.router.url.includes("item-details");
    });

    this.ps.genchange.subscribe(d => {
      this.gen = d;
    });
    this.ps.itdchange.subscribe(d => {
      this.itd = d;
    });
    this.ps.showItemList.subscribe(data => {
      this.itemsGenerated = data;
    });
    this.ps.itemNo.subscribe((data:any) => {
      this.itemNo = data;
    })
    this.ps.isNewItemVal.subscribe((data:any) => {
      this.newItem = data;
    })
    this.ps.newContractId.subscribe(data=>{
      this.id = data;
    })
    this.ps.docPercent.subscribe(data=>{
      this.docUploadPercent = data;
    })
  }

  ngOnInit() {
    this.id = this.route.firstChild.snapshot.params['id'];
    this.itemNo = this.route.firstChild.snapshot.params['itemNo'] || 1;
  }

  navigateToPrint(){
    window.location.href = Urls.CTRM_PRINTABLE_TEMPLATE_URL+this.id;
  }

}




