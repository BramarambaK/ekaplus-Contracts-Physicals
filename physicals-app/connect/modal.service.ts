import { Injectable } from '@angular/core';
import { CreateAndEditComponent } from './create-and-edit/create-and-edit.component';
import { ViewComponent } from './view/view.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LifecycleComponent } from '@eka-framework/modules/lifecycle/lifecycle.component';
import { MessageModalComponent } from './messagemodal/messagemodal.component';
import { ProfileEditComponent } from '@eka-framework/modules/profile-edit/profile-edit.component';
import { ProfileViewComponent } from '@eka-framework/modules/profile-view/profile-view.component';
import { CancelpopupComponent } from '@eka-framework/modules/cancelpopup/cancelpopup.component';
import { DetailsPopupComponent } from '@eka-framework/modules/detailspopup/detailspopup.component';
import { CompositeComponent } from './composite/composite.component';
import { ListComponent } from './list/list.component';
import { DataViewComponent } from './data-view/data-view.component';
import { ContractApprovalComponent } from '../Contracts-Physicals/physicals-app/Contracts/contract-approval/contract-approval.component';
import { CargillCancelpopupComponent } from '@eka-framework/modules/cancelpopup/v2/cargill-cancelpopup/cargill-cancelpopup.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  layoutType;
  componentToRender;
  size;
  messageType;
  message;
  isModal: boolean = false;
  backdrop: boolean | 'static' = 'static';
  centered: boolean = true;
  backdropClass = '';
  container;
  constructor(private ngb: NgbModal) {}

  renderModal({ name, status, type, response, customClass }, appService, appName) {
    this.messageType = status;
    this.layoutType = type === 'row' ? 'popup-modal-row ' : 'popup-modal-column ';
    if (name === 'create' || name === 'edit') {
      if (customClass) {
        this.layoutType = this.layoutType + customClass;
      }
      this.componentToRender = CreateAndEditComponent;
    } else if (name === 'list') {
      this.componentToRender = ListComponent;
      if (customClass) {
        this.layoutType = this.layoutType + customClass;
      }
    } else if (name === 'view') {
      this.componentToRender = ViewComponent;
    } else if (name === 'data-view') {
      this.componentToRender = DataViewComponent;
      if (customClass) {
        this.layoutType = this.layoutType + customClass;
      }
    } else if (name === 'lifecycle') {
      this.componentToRender = LifecycleComponent;
      this.layoutType = customClass || 'popup-lifecycle';
    } else if (name === 'cancelpopup') {
      this.componentToRender = CancelpopupComponent;
      this.layoutType = '';
      this.size = 'md';
    } else if (name === 'custom' || name === 'customv2') {
      this.componentToRender = CompositeComponent;
      this.layoutType = customClass || 'popup-lifecycle';
    } else if (name === 'viewprofile') {
      this.componentToRender = ProfileViewComponent;
      if (customClass) {
        this.layoutType = this.layoutType + customClass;
      }
      this.size = 'sm';
    } else if (name === 'editprofile') {
      this.componentToRender = ProfileEditComponent;
      if (customClass) {
        this.layoutType = this.layoutType + customClass;
      }
      this.size = 'sm';
    } else if (name === 'detailspopup') {
      this.componentToRender = DetailsPopupComponent;
      if (customClass) {
        this.layoutType = this.layoutType + customClass;
      }
      this.size = 'xs';
    } else if(name == "contractapproval" || name == "contractitemapproval"){
      this.componentToRender = ContractApprovalComponent;
    } else if (name === 'cargillcancelpopup') {
      this.componentToRender = CargillCancelpopupComponent;
      this.layoutType = this.layoutType + customClass;
      this.size = 'md';
    } else {
      this.componentToRender = MessageModalComponent;
      this.layoutType = '';
      this.size = 'sm';
    }
    if ('SUCCESS' == status) this.message = response.message;
    else if ('FAILURE' == status) {
      this.messageType = 'WARNING';
      if (
        null != response &&
        null != response.error &&
        null != response.error.errors &&
        response.error.errors.length > 0
      ) {
        if (typeof response.error.errors[0].errorMessage !== 'string') {
          var json = JSON.parse(response.error.errors[0].errorMessage);
          this.message = json.errorLocalizedMessage;
        }
      } else this.message = response.error.errorLocalizedMessage;
    }
    this.isModal = true;
    let modal = this.ngb.open(this.componentToRender, {
      size: this.size || 'lg',
      centered: this.centered,
      windowClass: this.layoutType,
      backdrop: this.backdrop,
      backdropClass: this.backdropClass,
      container: this.container
    });
    modal.componentInstance.appService = appService;
    modal.componentInstance.appName = appName;
    modal.componentInstance.response = response;
    modal.componentInstance.modalRef = modal;
    modal.componentInstance.messageType = this.messageType;
    modal.componentInstance.message = this.message;
    modal.componentInstance.layout = 'popup';

    modal.result.then(
      result => {},
      reason => {
        this.isModal = false;
       if(this.componentToRender === MessageModalComponent) {
          appService.fromPopup = false;
        } else
        appService.fromPopup = true;
        if (reason === ModalDismissReasons.ESC || reason === ModalDismissReasons.BACKDROP_CLICK) {
          this.handleCloseButton(appName, appService);
        }
      }
    );
  }

  handleCloseButton(appName, appService) {
    appService.workFlowData.storage.decisions.forEach(btn => {
      if (btn.type === 'close') {
        let task = btn.outcomes;
        appService.workFlow(appName, undefined, task, false);
      }
    });
  }

  closeModal() {
    this.ngb.dismissAll();
  }
}
