import { Injectable } from '@angular/core';
import { ContractService } from './contract-service.service';
import { MasterDataService } from '../create-contract/master-data.service';
import { of, BehaviorSubject, ReplaySubject, from, forkJoin } from 'rxjs';
import { mergeMap, tap, map, bufferCount, first, concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {

  approversData 
  approvers = {};
  approverIndex = 0
  approvalKeys = [];
  public approversDataSubject = new ReplaySubject();
  approversDataObjectObs = this.approversDataSubject.asObservable();
  apiCalled = new BehaviorSubject(true);

  constructor(private cs: ContractService, private mdm: MasterDataService) { }

  callApprovalAPI() {
    this.apiCalled.subscribe((val) => {
      this.getApprovalData()
    });
    this.apiCalled.complete();
  }

  getApprovalData() {
    this.cs.getApprovalLevels().pipe(
      first(),
      concatMap((data: any) => {
        this.approversData = {};
        data ? this.approversData["approversDAO"] = data : this.approversData["approversDAO"] = {};
        let keys = [];
        if(this.approversData.approversDAO.approvalLevels){
          this.approversData.approversDAO.approvalLevels.forEach(level => {
            if(level.approvalSubLevelDos){
              level.approvalSubLevelDos.forEach(subLevel => {
                keys.push({value: subLevel.approvalSubLevelId, index : this.approverIndex});
              });
            }
            this.approverIndex++;
          });
        }else{
          this.approversDataSubject.next(this.approversData);
        }
        return from(keys);
      }),
      mergeMap((key: any) => {
        return forkJoin(this.mdm.getComboKeys('sublevelApprovalUsersList', [key.value]),
                        of(key.value))
      }),
      map((data: any) => {
        if (data) {
          this.approvers[data[1]] = data[0].sublevelApprovalUsersList;
        }
      }),
      bufferCount(this.approverIndex),
      map(() => {
        this.approversData["approvers"] = this.approvers;
        return this.approversData
      }),
      tap(() => this.approversDataSubject.next(this.approversData)),
    ).subscribe();
  }


}
