import { Component, OnInit, Input, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ContractService } from '../../contract-service/contract-service.service';

@Component({
  selector: 'app-approve-popup',
  templateUrl: './approve-popup.component.html',
  styleUrls: ['./approve-popup.component.scss']
})
export class ApprovePopupComponent implements OnInit {
  action: any;
  @Input() internalContractRefNo
  loading = true;
  approvalDO
  approvalLevels
  subApprovalDos
  userSubLevelAuth
  popupMsg
  next = "PROCEED";
  remark
  userEligible = true

  constructor(private cs: ContractService, public modalService: NgbModal, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() { }

  ngOnChanges(change) { }

  closeResult: string;

  public open(content) {
    this.loading = true;
    this.approvalDO = {};
    this.subApprovalDos = [];
    this.userSubLevelAuth = {};
    this.popupMsg = '';
    this.cs.getPendingApproversList(this.internalContractRefNo).subscribe((approvalDO: any) => {
      this.loading = false;
      this.approvalDO = approvalDO
      let currentUserID = JSON.parse(sessionStorage.getItem("userCorporateDetails")).userId;
      let status = this.approvalDO.activityApprovalStatus;
      if (status === 'Pending') {
        this.approvalLevels = this.approvalDO.approvalLevels;
        for (let i = 0; i < this.approvalDO.approvalLevels.length; i++) {
          let subLevels = this.approvalDO.approvalLevels[i].approvalSubLevelDos
          this.userSubLevelAuth = subLevels.find(subLevel => {
            return subLevel.suggestedApproverId === currentUserID;
          })
          if (this.userSubLevelAuth) break;
        }
        if (!this.userSubLevelAuth) {
          this.popupMsg = 'Current User is not authorized for approval'
          this.userEligible = false;
        }
      } else if (status === 'Approved') {
        this.popupMsg = 'This contract is already approved !'
        this.userEligible = false;
      } else if (status === 'Rejected') {
        this.popupMsg = 'This contract is already rejected !'
        this.userEligible = false;
      }
    })
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

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

  approveReject(action) {
    this.action = action;
  }

  cancel(modal) {
    modal.dismiss('redirecting');
  }

  proceed() {
    if (this.next === 'PROCEED') {
      this.loading = true;
      this.userSubLevelAuth.approvalStatus = this.action;
      this.userSubLevelAuth.remark = this.remark;
      this.cs.approveRejectContract(this.approvalDO, this.internalContractRefNo).subscribe(data => {
        this.popupMsg = "contract approval status has be updated to - " + this.action;
        this.loading = false;
        this.next = "EXIT"
      })
    } else {
      this.cs.redirectToCTRM('contract');
    }
  }



}




