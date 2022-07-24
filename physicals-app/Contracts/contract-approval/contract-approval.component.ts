import { Component, OnInit, Input, Injector, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApproveContractPopupComponent } from '@app/views/Contracts-Physicals/physicals-app/Contracts/create-contract/approve-contract-popup/approve-contract-popup.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalService } from '@app/views/Contracts-Physicals/physicals-app/Contracts/contract-service/approval.service';
import { ApplicationService } from '@app/views/application/application.service';

@Component({
  selector: 'contract-approval',
  templateUrl: './contract-approval.component.html'
})
export class ContractApprovalComponent implements OnInit {
  appName;
  appService;
  selected: any;
  objectName;
  appMeta: any;
  @ViewChild(ApproveContractPopupComponent)
  approvePopup: ApproveContractPopupComponent;
  constructor(private route: ActivatedRoute,private changeDetectorRef:ChangeDetectorRef, private injector: Injector, private router: Router,private ngb: NgbActiveModal,private as : ApprovalService) {
    if (this.appName) {
    } else {
      this.appService = <ApplicationService>this.injector.get(ApplicationService);
    }
  }

  ngOnInit() {
      this.route.paramMap.subscribe(params => {
        this.objectName = params.get('objectName');
        this.appService.appMeta$.subscribe(app => {
          this.appName = app.name;
        });
        this.as.callApprovalAPI();
        this.ngb.close();
        let workFlowTaskNew = {
            workflowTaskName: this.appService.workFlowData.storage.decisions[0].task,
            task: this.appService.workFlowData.storage.decisions[0].task,
            appName: this.appName,
            appId: this.appService.appMetaDetails.sys__UUID,
            output: {
              [this.appService.workFlowData.storage.decisions[0].task]: this.appService._selected.getValue()['selected']
            },
            id: ''
        };
        workFlowTaskNew['bulkamend']= true;
         this.approvePopup.open(workFlowTaskNew);
      }) 

  }
  ngOnDestroy() {
    this.changeDetectorRef.detach();
    // this.subscription.unsubscribe();
}
}
