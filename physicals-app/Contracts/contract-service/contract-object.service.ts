import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { first, mergeMap, map, tap } from 'rxjs/operators';
import { ContractService } from './contract-service.service';

@Injectable({
  providedIn: 'root'
})
export class ContractObjectService {

  private contractObjectSubject = new BehaviorSubject('no_contract_present');
  currentContractObjectObs = this.contractObjectSubject.asObservable();

  private contractTxtSubject = new BehaviorSubject({});
  contractTxtValues = this.contractTxtSubject.asObservable();

  constructor(private cs: ContractService) { }

  changeCurrentContractObject(obj) {
    this.contractObjectSubject.next(obj)
    console.log(obj);
  }
  
  onLoadGetContractObject(contractId, action){
    return this.currentContractObjectObs.pipe(
      first(),
      mergeMap((contractObj:any)=>{
        if(contractObj === 'no_contract_present'){
            let sessionContractData = sessionStorage.getItem('connectPhysicalsContractData');
            if(sessionContractData){
              contractObj = JSON.parse(sessionContractData);
              return of(contractObj);
            }else if(contractId !== 'new_contract'){         
              return this.cs.getSavedContractBy_id(contractId).pipe(	           
                map(contractObjArr=>contractObjArr[0]),	              
                tap(contractObj=>this.changeCurrentContractObject(contractObj))	            
              )	            
            }else{
              return of({_id:"new_contract", itemDetails: []});
            } 
        }else{
          return of(contractObj);
        }
      })
    )
  }

  onLoadEditContractHandler(getContractObs){
    return this.currentContractObjectObs.pipe(
      first(),
      mergeMap((contractObj:any)=>{
        if(contractObj === 'no_contract_present'){
          return getContractObs.pipe(
            tap(contractObj=>this.changeCurrentContractObject(contractObj))
          )
        }else{
          return of(contractObj);
        }
      })
    )
  }

  changeContractTxtValues(obj) {
    this.contractTxtSubject.next(obj)
    console.log(obj);
  }

}
