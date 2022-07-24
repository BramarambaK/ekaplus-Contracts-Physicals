import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../Contracts/contract-service/contract-service.service';
import { concatMap, map, tap } from 'rxjs/operators';
import { from, forkJoin, of } from 'rxjs';
import { ContractObjectService } from '../Contracts/contract-service/contract-object.service';
import { ApplicationService } from '@app/views/application/application.service';
import { ComponentService } from '../Contracts/component-service/component.service';

@Component({
  selector: 'app-ctrm-handler',
  templateUrl: './ctrm-handler.component.html',
  styleUrls: ['./ctrm-handler.component.scss']
})
export class CtrmHandlerComponent implements OnInit {
  newCloneId
  @ViewChild('reqFailed') reqFailedPopup;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cs: ContractService,
    private cos : ContractObjectService, 
    private appService : ApplicationService,
    private componentService : ComponentService
  ) {
    this.cs.reqFailedObs.subscribe(err => {
      this.reqFailedPopup.open(err);
    });
  }

  ngOnInit() {
    sessionStorage.setItem('appOrigin', 'platform');
    sessionStorage.removeItem('connectPhysicalsContractData');
    localStorage.removeItem("splitData");
    this.route.queryParams.subscribe(params => {
      switch (params.action) {
        case 'create':
          this.appService.setTitle('New Contract');
          localStorage.setItem("lastAutoSavedContractChecked", "NotChecked");
          if(params.templateId){
            let templateId = sessionStorage.getItem("internalContractRefNo");
            this.cs.getTemplateData(templateId).subscribe((data: any) => {
              let templateData = this.cs.removeAllInternalIDs(data);
              templateData.templateId = templateId;
              delete templateData['_id'];
              this.cos.changeCurrentContractObject({_id:"new_contract", itemDetails: [], ...templateData});
              this.navigateToNewContract(params);
            })
          }else{
            this.cos.changeCurrentContractObject({_id:"new_contract", itemDetails: []});
            this.navigateToNewContract(params);
          }
          break;
        case 'clone':
          this.appService.setTitle('New Contract');
          let toCloneContractRef = sessionStorage.getItem(
            'internalContractRefNo'
          );
          forkJoin(this.cs.getSavedContract(toCloneContractRef), this.cs.startNewContract(), this.componentService.getTieredData(toCloneContractRef))
          .pipe(
            map((res:any)=>{
              this.componentService.cloneContractComponent(res[0]['_id'],res[1]['_id'])
              let splitPriceResponse = res[2];
              if(splitPriceResponse && splitPriceResponse.data){
                res[0] = this.checkSplitPriceClone(res[0], splitPriceResponse.data);
              }
              let clone = this.cleanCloneContract(res[0]);
              this.newCloneId = res[1]['_id'];
              clone._id = this.newCloneId;
              sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(clone));
              this.cos.changeCurrentContractObject(clone);
              return clone
            }),
            concatMap((clone)=>{
                if(this.cs.checkIfSplitPriceContract(clone)){
                  return this.componentService.saveSplitsWithNewDraftId(clone, clone._id).pipe(
                    tap((res:any)=>{
                      clone = this.componentService.updateSplitFormData(clone, res.data);
                      sessionStorage.setItem('connectPhysicalsContractData', JSON.stringify(clone));
                      this.cos.changeCurrentContractObject(clone);
                    })
                  )
                } else {
                  return of(clone)
                }
            }),
          )
          .subscribe((data: any)=>{
            this.router.navigate(
              [
                '../../physicals/' +
                  params.appObject +
                  '/' +
                  params.action +
                  '/general-details/' +
                  this.newCloneId
              ],
              { relativeTo: this.route }
            );
          });
          break;
        case 'edit':
          let contractRef = sessionStorage.getItem('internalContractRefNo');
          this.router.navigate(
            [
              '../' +
                params.appObject +
                '/' +
                params.action +
                '/general-details/' +
                contractRef
            ],
            { relativeTo: this.route }
          );
          break;
        case 'homepage':
          this.router.navigate(['../../pricing/formula/view'], {
            relativeTo: this.route
          });
          break;
        case 'view':
          let internalcontractRef = sessionStorage.getItem(
            'internalContractRefNo'
          );
          this.router.navigate(
            [
              '../' +
                params.appObject +
                '/' +
                params.action +
                '/general-details/' +
                internalcontractRef
            ],
            { relativeTo: this.route }
          );
          break;
        default:
          this.cs.reqFailedObs.next(
            params.action + ' - contract action not available'
          );
          break;
      }
    });
  }

  checkSplitPriceClone(contract, splits){
    let isSplitPricingContract = contract.itemDetails.some((item)=>(item.pricing.pricingStrategy === 'pricingStrategy-002' || item.pricing.pricingStrategy === 'pricingStrategy-003'))
    if(isSplitPricingContract){
      for(let i=0; i < contract.itemDetails.length; i++){
        contract.itemDetails[i].pricing["splitFormData"] = [];
        for(let j=0; j < splits.length; j++){
          if(splits[j].internalContractItemRefNo == contract.itemDetails[i].internalItemRefNo || splits[j].itemNumber == contract.itemDetails[i].itemNo){
            contract.itemDetails[i].pricing["splitFormData"].push(splits[j]);
          }
        }
      }
      return contract;
    }else{
      return contract;
    }
  }

  cleanCloneContract(data) {
    let clone = this.cs.removeAllInternalIDs(data);
    delete clone['_id'];
    let _itemDetails = clone.itemDetails.map((item,index) => {
      //item.itemNo = index+1;
      if(item.pricing.splitFormData && item.pricing.splitFormData){
        item.pricing.splitFormData = item.pricing.splitFormData.map(split=>{
          split.itemNumber = String(item.itemNo)
          return split;
        })
      }
      return item
    })
    _itemDetails.sort((a,b)=>a.itemNo - b.itemNo);
    console.log(_itemDetails);
    clone.itemDetails = _itemDetails;
    return clone;
  }

  navigateToNewContract(params){
    this.router.navigate(
      [
        '../../physicals/' +
          params.appObject +
          '/create/general-details/new_contract'  ],
      { relativeTo: this.route }
    );
  }

}
