import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { ContractService } from '../../contract-service/contract-service.service';
import { MasterDataService } from '../master-data.service';
import { UtilService } from '../../../utils/util.service';
import { IMyDpOptions } from 'mydatepicker';
import { ApproveContractPopupComponent } from '../approve-contract-popup/approve-contract-popup.component';
import { ContractObjectService } from '../../contract-service/contract-object.service';
import { ConfirmationService } from 'primeng/api';
import { tap } from 'rxjs/operators';
import { PercentService } from '../side-bar/side-bar.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
  providers: [ConfirmationService]
})
export class DocumentUploadComponent implements OnInit {
  FormData;
  fields;
  action;
  appObject;
  internalContractRef
  navigationId
  contract

  @ViewChild(ApproveContractPopupComponent)
  approvePopup: ApproveContractPopupComponent;
  @ViewChild('confirm') contractPopup;
  @ViewChild('contractDraftPopup') contractDraftPopup;
  @ViewChild('contractCreated') contractCreated;
  @ViewChild('draftCreated') draftCreated;
  @ViewChild('dt')
  @ViewChild('reqFailed') reqFailedPopup;
  showWarning: boolean = false;
  errorMsg: string = "";

  contractId;
  documentUploadForm;
  newDocumentList: any = [];
  file: File;
  fileList: FileList;

  docType: any;
  data: Object;
  error: any;
  new1 = [];
  formData: FormData = new FormData();
  showLoader: boolean = false;
  attachedDocument: any;
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy'
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cs: ContractService,
    private doc: MasterDataService,
    private util: UtilService,
    private cos: ContractObjectService,
    private ps: PercentService
  ) {
    this.FormData = this.route.snapshot.parent.data.FormData;
    this.fields = this.FormData.fields;
    this.action = this.FormData.action;
    this.appObject = this.FormData.appObject;
    this.contractId = this.route.snapshot.params.id;
    this.doc.getDocumentType().subscribe((res: any) => {
      this.docType = res.listOfDocumentNameByDocumentSetName;
    });
  }

  ngOnInit() {
    this.documentUploadForm = this.fb.group({
      documentType: [''],
      document: [''],
      documentDate: [''],
      description: ['']
    });
    this.getContract()
    this.getAllDocuments();
  }

  getAllDocuments() {
    this.showLoader = true;
    this.cs.getListDocument(this.internalContractRef).subscribe((res: any) => {
      this.new1 = res.data;
      this.newDocumentList = this.new1;
      for (var i = 0; i < this.newDocumentList.length; i++) {
        this.newDocumentList[i].documentType = this.documentTypeToShow(this.newDocumentList[i].documentType)
      }
      if (this.newDocumentList.length > 0) {
        this.ps.docPercent.next(100);
      }
      this.showLoader = false;
    }, error => {
      this.showLoader = false;
      this.showErrorMessage("Failed to load documents");
    });
  }

  documentTypeToShow(key) {
    let formatteddoc = '';
    if (this.docType != undefined)
      for (let i = 0; i < this.docType.length; i++) {
        if (this.docType[i].key == key) {
          formatteddoc = this.docType[i].value;
          return formatteddoc;
        }
      }
  }

  addRow() {
    this.upload();
    this.documentUploadForm.reset();
  }

  fileChange(event) {
    this.fileList = event.target.files;
    if (this.fileList.length > 0) {
      let file: File = this.fileList[0];
      const session = sessionStorage.getItem('userName');
      this.formData.set('uploadedBy', session);
      this.formData.set('file', file);
    }
  }
  
  upload() {
    this.formData.set(
      'description',
      this.documentUploadForm.value.description
    );
    let DocType = {
      "entityId": this.internalContractRef, "documentDate": this.util.getDateForUploadDocument(this.documentUploadForm.value.documentDate),
      documentType: this.documentUploadForm.value.documentType
    };
    this.formData.set("refObject", "physicals")
    this.formData.set("refObjectId", "5d907cd2-7785-4d34-bcda-aa84b2158415")
    this.formData.set('otherAttributes', JSON.stringify(DocType));
    
    this.showLoader = true;
    this.cs.upload(this.formData, this.internalContractRef).subscribe((res: any) => {
      this.ps.docPercent.next(100);
      this.showLoader = false;
      this.getAllDocuments();
    }, error=>{
      this.showLoader = false;
      //this.showErrorMessage("Failed to upload document");
      this.getAllDocuments();
    });
  }

  cancel() {
    this.documentUploadForm.reset();
  }

  deleteItem(item, i) {
    let entityId = item.entityId
    let document = item.documentId;
    this.showLoader = true;
    this.cs
      .deleteUpload(entityId, document)
      .map(res => res)
      .subscribe(
        data => {
          this.showLoader = false;
          this.getAllDocuments();
        },
        err => {
          this.showLoader = false;
          //this.showErrorMessage("Failed to delete document");
          this.getAllDocuments();
        }
      );
  }

  downloadItem(item) {
    let headers = new HttpHeaders({
      "storageType": "trmAGS",
      "forcedownload": 'true'
    });
    var downloadData = {
      "fileContentType": item.contentType,
      "fileName": item.fileName,
      "id": "5d5e65155611f317d8c869c1",
      "otherAttributes": {
        "entityId": item.documentId
      }
    }
    this.showLoader = true;
    return this.http.post('/download/', downloadData, { responseType: 'blob', headers }).subscribe((data: any) => {
      this.showLoader = false;
      const blob = new Blob([data], { type: downloadData.fileContentType });
      saveAs(blob, downloadData.fileName);
    }, error => {
      this.showLoader = false;
      this.showErrorMessage("Failed to download document");
    });
  }

  getContract() {
    if (this.action === 'create' || this.action === 'clone') {
      this.navigationId = this.contractId;
      this.cos.onLoadGetContractObject(this.contractId, this.action)
        .pipe(
          tap(contractObj => {
            this.contract = contractObj;
          })
        ).subscribe();
    } else {
      this.internalContractRef = this.FormData.id;
      this.navigationId = this.internalContractRef;
      let getContractObs
      switch (this.appObject) {
        case 'contract':
          getContractObs = this.cs.getSavedContract(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contract = data;
            this.contractId = data._id;
          });
          break;
        case 'template':
          getContractObs = this.cs.getTemplateData(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contract = data;
            this.contractId = data._id;
          });
          break;
        case 'draft':
          getContractObs = this.cs.getDraftContract(this.internalContractRef);
          this.cos.onLoadEditContractHandler(getContractObs).subscribe((data: any) => {
            this.contract = data;
            this.contractId = data._id;
          });
          break;
      }
    }
  }

  isContractValid() {
    if (this.ps.generalDetailsFillPercentage(this.contract) && this.ps.completePercent === 100) {
      return true;
    } else {
      return false;
    }
  }

  public saveContract = () => {
    if (this.isContractValid()) {
      switch (this.appObject) {
        case 'contract':
          if (this.action === 'create' || this.action === 'clone') {
            this.checkSaveContractOrDraft();
          } else {
            this.showLoader = true;
            this.cs.saveEditedContractReturn(this.contract).subscribe(data => {
              this.showLoader = false;
              this.contractPopup.open('Existing contract has been updated');
              this.cs.redirectToCTRM('contract');
            });
          }
          break;
        case 'template':
          this.showLoader = true;
          if (
            (this.action === 'create' || this.action === 'clone') &&
            !this.contract.hasOwnProperty('internalContractRefNo') &&
            !this.contract.internalContractRefNo
          ) {
            this.cs.saveTemplate(this.contract).subscribe((res: any) => {
              this.showLoader = false;
              this.contractCreated.open(
                'Template saved with Reference No. : ' + res.data.contractDetails.contractRefNo
              );
            });
          } else {
            this.cs.updateTemplate(this.contract).subscribe((res: any) => {
              this.showLoader = false;
              this.contractCreated.open(
                'Template updated with Reference No. : ' + res.data.contractDetails.contractRefNo
              );
            });
          }
          break;
        case 'draft':
          this.checkSaveContractOrDraft();
          break;
      }
    } else {
      this.showErrorMessage("Fill all mandatory fields in General Details and Item Details");
    }
  };

  saveAsCtrmDraft() {
    this.showLoader = true;
    if (this.contract.internalContractRefNo) {
      this.cs
        .updateCtrmDraft(this.contract, this.contract.internalContractRefNo)
        .subscribe((res: any) => {
          this.showLoader = false;
          this.draftCreated.open(
            'Previously saved Draft with Ref No.' +
            res.data.contractDetails.contractRefNo +
            ' has been updated'
          );
        });
    } else {
      this.cs.saveCtrmDraftContract(this.contract).subscribe((res: any) => {
        this.showLoader = false;
        this.contract.internalContractRefNo = res.data.contractDetails.internalContractRefNo;
        this.draftCreated.open(
          'Contract saved as draft with Ref No. : ' + res.data.contractDetails.contractRefNo
        );
      });
    }
  }

  checkSaveContractOrDraft() {
    this.contractDraftPopup.open(
      'Do you want to create contract or save as draft?'
    );
  }

  confirmSaveContractOrDraft(msg) {
    if (msg === 'SAVE AS CONTRACT') {
      let contractObjCopy = JSON.parse(JSON.stringify(this.contract));
      contractObjCopy = this.cs.removeAllInternalIDs(contractObjCopy);
      if (this.appObject === 'draft' && this.action === 'edit') {
        contractObjCopy.internalDraftId = this.contract["internalContractRefNo"];
        this.showLoader = true;
        this.cs.startNewContract().subscribe((data: any) => {
          contractObjCopy._id = data._id;
          this.showLoader = false;
          this.approvePopup.open(contractObjCopy);
        })
      } else {
        this.approvePopup.open(contractObjCopy);
      }
    } else if (msg === 'SAVE AS DRAFT') {
      this.saveAsCtrmDraft();
    }
  }

  afterApprovalPopupCreateContract(contractDataWithApproval) {
    this.showLoader = true;
    this.cs.createContract(contractDataWithApproval).subscribe((res: any) => {
      this.showLoader = false;
      this.contractCreated.open(
        'contract created with Contract Ref No. :' +
        res.data.contractDetails.contractRefNo
      );
    });
  }

  afterApprovalCancel() {
    this.showErrorMessage("selection of approver mandatory for contract creation");
  }

  showErrorMessage(error){ 
    this.errorMsg = error;
    this.showWarning = true;
    setTimeout(()=>{ this.showWarning = false; }, 3000)
  }

  closeAlert() {
    this.showWarning = false;
  }

  afterContractCreated() {
    this.cs.redirectToCTRM('contract');
  }

  afterDraftCreated(msg) {
    if (msg === 'EXIT TO DRAFT LISTING') {
      this.cs.redirectToDraft();
    }
  }

}
