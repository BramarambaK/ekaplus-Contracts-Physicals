import { Component, OnInit, Input, SimpleChange, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { ContractService } from '../../contract-service/contract-service.service';
import { MasterDataService } from '../master-data.service';
import { ApprovalService } from '../../contract-service/approval.service';
import { skip, filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import {Injector} from '@angular/core';
import { ApplicationService } from '../../../../../application/application.service';
@Component({
  selector: 'app-approve-contract-popup',
  templateUrl: './approve-contract-popup.component.html',
  styleUrls: ['./approve-contract-popup.component.scss']
})
export class ApproveContractPopupComponent implements OnInit {
  modalReference: any;
  numberOfApprovalLevels: number;
  approvers: any = [];
  closeResult: string;
  sublevel
  approversDAO
  approvalLevels
  approvalForm
  authorizedForApprovalSublevelGroup = [];
  finalValidation = false;
  showWarning = false;
  errorMsg = "";
  appService;

  @Input() contract
  @Output() action = new EventEmitter<string>();
  @Output() cancelApproval = new EventEmitter<string>();
  loading: boolean = true;
  @ViewChild('content') savePopup: ElementRef;


  constructor(private as: ApprovalService,private route: ActivatedRoute,private router: Router, private cs: ContractService, public modalService: NgbModal, private fb: FormBuilder, private mdm: MasterDataService,private toastr: ToastrService,private injector: Injector) {
     this.appService = injector.get(ApplicationService);
   }

  ngOnInit() {
 
  }

  ngOnChanges(change) { }

  getControl(level, sublevel, controlType) {
     return this.approvalForm.controls[level].controls[sublevel].controls[controlType];
  }

  getClass(level, sublevel){
    let control = this.approvalForm.controls[level].controls[sublevel].controls['approver'];
    if (!this.finalValidation) {  
      return control.invalid && control.touched;
    } else {
      return control.invalid;
    }
  }

  public open(contractData, content = this.savePopup) {
    this.modalReference = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    
    this.approvalForm = this.fb.array([]);
    this.contract = contractData;
    this.loading = true;
    this.numberOfApprovalLevels = 0;
    this.approvers = [];
    this.approversDAO = {};
    this.approvalLevels = "";
    this.authorizedForApprovalSublevelGroup = [];
    this.finalValidation = false;

    this.as.approversDataSubject.subscribe((approversData: any) => {
      let data = approversData.approversDAO
      this.approversDAO = data;
      this.approvalLevels = data.approvalLevels;
      this.numberOfApprovalLevels = parseInt(data.totalNoOfApprovalLevel);
      if(this.numberOfApprovalLevels === 0 && this.approvalLevels === null || Object.entries(data).length === 0){
        this.bypassApproval();
      }
      if(contractData.dealType === 'Inter_Company' || contractData.dealType === 'Intra_Company'){
        this.addInterCompanyApproval();
      }
      for (let levelIndex = 0; levelIndex < this.numberOfApprovalLevels; levelIndex++) {
        let numberOfSubLevels = parseInt(data.approvalLevels[levelIndex].totalNoOfSubApproval);
        let sublevelForm = this.fb.array([]);
        let approvalsRequired = parseInt(data.approvalLevels[levelIndex].noOfApprovalRequired);
        if(numberOfSubLevels === 0 && approvalsRequired > 0){ 
          this.approvalLevels[levelIndex].subLevelNotAvailable = true;
          this.toastr.error('unable to get approval sub-level settings');
        }
        for (let subLevelIndex = 0; subLevelIndex < numberOfSubLevels; subLevelIndex++) {
          sublevelForm.push(this.fb.group({
            radio: [null],
            approver: [null]
          }));
          let subLevelRow = sublevelForm.get(subLevelIndex.toString());
          subLevelRow.get('approver').setValidators([Validators.required])
          if (data.approvalLevels[levelIndex].approvalSubLevelDos[subLevelIndex].authorizedForApproval !== 'Y') {
            let radio = subLevelRow.get('radio')
            radio.setValue('approver');
            radio.disable();
          }
          sublevelForm.get(subLevelIndex.toString()).get('radio').valueChanges.subscribe(data => {
            if (data) {
              sublevelForm.controls.forEach((row, index) => {
                if (index === subLevelIndex) {
                  row.get('approver').markAsUntouched();
                  row.get('approver').reset();
                  row.get('approver').setErrors(null);
                  row.get('approver').disable();
                }
              })
            } else {
              sublevelForm.controls.forEach((row, index) => {
                if (index === subLevelIndex) {
                  row.get('approver').enable();
                  row.get('approver').setValidators([Validators.required])
                }
              })
            }
          })
          this.approvers = approversData.approvers
          this.loading = false;
        }
        this.approvalForm.push(sublevelForm);
      }
    })
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

  redirect(modal) {
    this.cancelApproval.emit('cancel approval');
    modal.dismiss('redirecting');
  }

  submit(modal) {
    if(this.approvalForm.valid){
        let formVal = this.approvalForm.value;
        for (let levelIndex = 0; levelIndex < this.numberOfApprovalLevels; levelIndex++) {
          let numberOfSubLevels = this.approversDAO.approvalLevels[levelIndex].totalNoOfSubApproval;
          for(let sublevelIndex = 0; sublevelIndex < parseInt(numberOfSubLevels); sublevelIndex++){
            if (formVal[levelIndex][sublevelIndex].radio) {
              this.approversDAO.approvalLevels[levelIndex].approvalSubLevelDos[sublevelIndex].approvalStatus = "Approved";
            } else {
              this.approversDAO.approvalLevels[levelIndex].approvalSubLevelDos[sublevelIndex].suggestedApproverId = formVal[levelIndex][sublevelIndex].approver;
              this.approversDAO.approvalLevels[levelIndex].approvalSubLevelDos[sublevelIndex].approvalStatus = "Pending";
            }
          }
        }
        this.contract["approvalManagementDO"] = this.approversDAO;
         if(this.contract.bulkamend){
            if(this.contract["output"]["_PROCESSOR_CONTRACTS_SAVE"]){
              this.contract["output"]["_PROCESSOR_CONTRACTS_SAVE"]['bulkcontractsupdate']["editcontract"]["approvalManagementDO"] = this.approversDAO;
              this.appService.setLoaderState({type: 'physicals', value: true})
              this.mdm.updatecontracts(this.contract).subscribe((res:any) =>{
                let selectedData = this.appService._selected.getValue();
                this.appService.setLoaderState({type: 'physicals', value: false})
                let finaldata = []
                for(let i=0;i<res.data.length;i++){
                  if(res.data[i]['errors'])
                  res.data[i]['reason'] = res.data[i]['errors'].join(' ')
                  if(res.data[i]['status']=='success'){
                  for(let key in res.data[i].data.contractDetails){
                    res.data[i][key] = res.data[i].data.contractDetails[key]
                  }
                }
                else if(!(res.data[i].hasOwnProperty('contractRefNo'))){
                  res.data[i].contractRefNo = selectedData.selected.bulkcontractsupdate.listingcontract[i].contractRefNo
                }
                  finaldata.push(res.data[i])
                }
                this.appService.handleSelectedDataUpdation({ data:finaldata, setSelected:['selected.acknowledgementpagecontract.ackcontract']  })
                this.router.navigate(['app/physicals/acknowledgementpagecontract']);
              },err =>{
                this.appService.setLoaderState({type: 'physicals', value: false})
                this.toastr.error(err.error.errorLocalizedMessage);
                console.log(err);
              })
              
            }
            else if(this.contract["output"]["_PROCESSOR_CONTRACTS_ITEM_SAVE"]){
              this.contract["output"]["_PROCESSOR_CONTRACTS_ITEM_SAVE"]['bulkcontractitemsupdate']["editcontractitem"]["approvalManagementDO"] = this.approversDAO;
              this.appService.setLoaderState({type: 'physicals', value: true})
              this.mdm.updatecontracts(this.contract).subscribe((res:any) =>{
                this.appService.setLoaderState({type: 'physicals', value: false})
                let finaldata = []
                let selectedData = this.appService._selected.getValue();
                if(selectedData.selected.bulkcontractitemsupdate.listingcontractitem){
                  finaldata = selectedData.selected.bulkcontractitemsupdate.listingcontractitem
                }
                for(let i = 0; i<finaldata.length;i++){
                  if(finaldata[i].hasOwnProperty('sys__state')){
                    delete finaldata[i].sys__state
                  }
                  if(Number(finaldata[i].finalInvoicedQty)>0){
                    finaldata[i]['status'] = 'Failed'
                    finaldata[i]['reason'] = 'Final Invoiced Contract is not modifiable'
                  }
                }
                for(let i = 0; i<finaldata.length;i++){
                   for(let j=0;j<res.data.length;j++){
                    if(res.data[j].contractRefNo && finaldata[i].contractRefNo == res.data[j].contractRefNo && finaldata[i].internalContractItemRefNo == res.data[j].internalContractItemRefNo){
                      finaldata[i]['status'] = res.data[j]['status']
                      finaldata[i]['reason'] = res.data[j]['errors']
                      if(res.data[i]['errors'] && Array.isArray(res.data[i]['errors']))
                        res.data[i]['reason'] = res.data[i]['errors'].join(" ")
                    }
                    else if(res.data[j].data.hasOwnProperty('contractDetails') && finaldata[i].contractRefNo===res.data[j].data.contractDetails.contractRefNo){
                      finaldata[i]['status'] = res.data[j]['status']
                      finaldata[i]['reason'] = res.data[j]['errors']
                    }
                    else{
                      finaldata[i]['status'] = res.data[j]['status']
                      if(res.data[i]['errors'] && Array.isArray(res.data[i]['errors']))
                        res.data[i]['reason'] = res.data[i]['errors'][0]
                      else res.data[i]['reason'] = res.data[i]['errors']
                    }

                }
                }
                this.appService.handleSelectedDataUpdation({ data:finaldata, setSelected:['selected.acknowledgementpageitem.ackitem']  })
                this.router.navigate(['app/physicals/acknowledgementpageitem']);
              },err =>{
                this.appService.setLoaderState({type: 'physicals', value: false})
                this.toastr.error(err.error.errorLocalizedMessage);
                console.log(err);
              })
            }
        }else{
           this.action.emit(this.contract);
         }  
        modal.dismiss('redirecting');
    }else{
        this.finalValidation = true;
        this.errorMsg = "Select appropriate approvers"
        this.showWarning = true;
        setTimeout(()=>{    
          this.showWarning = false;
        }, 4000);
    }
  }

  closeAlert() {
    this.showWarning = false;
  }

  bypassApproval(){
    this.contract["approvalManagementDO"] = null;
    this.action.emit(this.contract);
    this.modalReference.close();
  }

  addInterCompanyApproval(){
    if(this.contract.IS_INTER_INTRA_COMP_APPROVAL_REQ){
      this.approversDAO.approvalLevels[0].approvalSubLevelDos[0].approvalStatus = "Approved";
      this.contract["approvalManagementDO"] = this.approversDAO;
    }else{
      this.contract["approvalManagementDO"] = null;
    }
    this.action.emit(this.contract);
    this.modalReference.close();
  }
}
