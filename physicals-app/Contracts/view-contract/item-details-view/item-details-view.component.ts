import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Urls } from '../../../urls';
import { UtilService } from '../../../utils/util.service';
import { ContractService } from '../../contract-service/contract-service.service';
import { first, tap } from 'rxjs/operators';
import { ViewService } from '../view-service/view.service';
import { MasterDataService } from '../../create-contract/master-data.service';
import { ComponentService } from '../../component-service/component.service';

@Component({
  selector: 'app-item-details-view',
  templateUrl: './item-details-view.component.html',
  styleUrls: ['./item-details-view.component.scss']
})
export class ItemDetailsViewComponent implements OnInit {
  ViewData
  fields
  contract
  itemsData
  listViewData = [];
  dataList
  internalContractRefNo
  basicFields = [
    'itemNo',
    'priceTypeIdDisplayName',
    'pricingStrategyDisplayName',
    'formula',
    'components',
    'valuationFormula'
  ];
  headerList = [
    'Item No.',
    'Price Type',
    'Pricing Strategy',
    'Contract Pricing',
    'Components'
  ];
  itemsDisplayText = [];
  popupItem
  apiCalled = false;
  splitsData: any = [];
  splitData: any = [];
  pricingFormulaNames = [];
  pricingTriggerFor = 'priceTypeId';
  itemIndex = 0;
  fromViewContractPage = true

  constructor(private ComponentService:ComponentService, private mdm: MasterDataService,private vs: ViewService, private cs: ContractService, private us: UtilService, private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {

    this.ViewData = this.route.snapshot.data.ViewData;
    this.internalContractRefNo = this.route.snapshot.params.id;
    this.fields = this.ViewData[0].fields
    this.contract = this.ViewData[1];
    this.itemsData = this.ViewData[1].itemDetails.sort((a, b) => {
      return a.itemNo - b.itemNo;
    });

    console.log(this.contract);

    let itemsNum = this.itemsData.length;

    for (let i = 0; i < itemsNum; i++) {
      let item = this.itemsData[i];
      let itemDisplayValues = JSON.parse(this.itemsData[i].itemDisplayValue)
      this.listViewData[i] = item;
      this.listViewData[i]['itemNo'] = item['itemNo'];
      this.listViewData[i]['priceTypeIdDisplayName'] = itemDisplayValues['priceTypeIdDisplayName'];
      this.listViewData[i]['pricingStrategyDisplayName'] = itemDisplayValues['pricingStrategyDisplayName'];
      this.listViewData[i]['pricingFormulaId'] = item.pricing['pricingFormulaId'];
      this.listViewData[i]['valuationFormula'] = item['valuationFormula'];
      this.listViewData[i]['components'] = 'Components';
      if (item.pricing.priceTypeId === 'FormulaPricing') {
        this.mdm.getComboKeys('productPriceUnit', [this.itemsData[0].productId, this.itemsData[0].payInCurId]).subscribe((res: any) => {
          this.fields.priceUnitId.options = res.productPriceUnit;
          console.log(this.fields.priceUnitId.options);
        });
        if(item.pricing.pricingStrategy === 'pricingStrategy-001'){
          this.cs.getFormulaName(item.pricing.pricingFormulaId)
            .subscribe((data: any) => {
              this.pricingFormulaNames[i] = data[0].formulaName;
              console.log('the pricing formula name is:');
              console.log(this.pricingFormulaNames);
            });
        }
        this.ComponentService.getComponent(this.contract).subscribe(res=>{
          console.log(res);
        })
      }
    }

    this.cs.getTieredData(this.internalContractRefNo).subscribe((data: any) => {
      data = this.sortElementsDowntoUp(data.data);
      for(let i=0; i<data.length; i++){
          let itemNo = parseInt(data[i].itemNumber); 
          if(this.splitsData[itemNo]){
            this.splitsData[itemNo].push(data[i]);
          }else{
          this.splitsData[itemNo] = [];
          this.splitsData[itemNo].push(data[i]);
          }
      }
      console.log(this.splitsData);
    }, err => {
      this.splitsData = [];
    })
    
    this.getItemPopupDisplayValues();

    console.log(this.listViewData);
  }

  getItemPopupDisplayValues() {
    this.itemsData.forEach(element => {
      Object.assign(element, element.pricing);
      Object.assign(element, element.latePaymentInterestDetails);
      if (element.estimates && element.estimates.length) {
        element.estimates.forEach(row => {
          row["SECONDARY_COST"] = "SECONDARY_COST";
          row["CONTRACT"] = "CONTRACT";
          row["dealType"] = this.contract.dealType;
          if (row.rateType === "Rate") {
            row["costUnitRate"] = row.costUnit;
          } else {
            row["costUnitCurrency"] = row.costUnit;
          }
        })
      }
    });
    if (!this.vs.displayValueApiTriggered) {
      this.cs.getItemsListDisplayValues(this.itemsData)
        .pipe(tap((data) => console.log(data)))
        .subscribe((data: any) => {
          this.itemsDisplayText = this.itemsData.map((item,index)=>{
            return { ...data[index], ...item }
          });
          this.vs.itemsDisplayValueLoaded.next(this.itemsDisplayText);
          this.vs.itemsDisplayValueLoaded.complete();
        });
      this.vs.displayValueApiTriggered = true;
    }
  }

  showItemDetails(popup, itemsDisplayTextIndex) {
    this.vs.itemsDisplayValueLoaded.subscribe((itemsDisplayText) => {
      popup.open(popup.content, itemsDisplayText[itemsDisplayTextIndex]);
      this.apiCalled = false;
    })
  }

  openPopup(userdata) { }

  editItem() {
    this.router.navigate(['../../../edit/item-list/' + this.internalContractRefNo], { relativeTo: this.route });
  }

  sortElementsDowntoUp(elementList) {
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

  openItemComponentWindow(itemIndex){
    let url =window.location.href
    url = url.split('physicals')[0]
    url = url + 'app/physicals/componentPricinglistingview?'
    url = url + 'ContractRefNo=' + this.contract.internalContractRefNo
    if(this.contract.itemDetails[itemIndex].internalItemRefNo){
      url = url + '&ContractItemRefNo=' + this.contract.itemDetails[itemIndex].internalItemRefNo
    }
    url = url + '&itemNo=' + this.contract.itemDetails[itemIndex].itemNo
    url = url + '&componentDraftId=' + this.contract._id
    url = url + '&isPopUp=true'
    url = url + '&productId='+ this.contract.itemDetails[itemIndex].productId
    window.open(url, '', 'width=700,height=300,left=400,top=200');
  }

  onClickpricingTriggerFor(){
    this.pricingTriggerFor='priceTypeId';
    this.fromViewContractPage = true;
  }

}
