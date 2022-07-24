import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractService } from '../../contract-service/contract-service.service';

@Component({
  selector: 'email-popup',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})

export class Email implements OnInit {

  @Input() attachedDocument: any;
  @Input() attachmentRequired = true;
  emailForm = new FormGroup({
    To: new FormControl(null, Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
    CC: new FormControl(null, Validators.compose([
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
    Subject: new FormControl('')
  });
  body: FormControl = new FormControl('');
  errorMsg
  showWarning = false;
  showLoader = false;

  constructor(config: NgbModalConfig, private modalService: NgbModal, private service: ContractService) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.emailForm.valueChanges.subscribe(res => {
      console.log(res);
    })
  }

  ngOnChanges(change) {
    // this.emailForm.get('Subject').setValue(this.attachedDocument.fileName);
  }

  ngOnInit() { }

  open(content) {
    this.emailForm.get('Subject').setValue(this.attachedDocument.fileName);
    this.modalService.open(content, {
      windowClass: 'ContractPopup'
    });
  }

  sendMail(modal) {
    if (this.emailForm.invalid) {
      this.showErrorMessage("Enter To address");
      return
    }
    let body:any = {
      "toAddress": [],
      "subject": "",
      "message": "",
      "fileNames": [],
      "docId": [],
      "contentType": "text/plain",
      "fileModel": {
        "id": "5d78f428ddb1382f6823c515"
      }
    }
    body.toAddress.push(this.emailForm.controls.To.value)
    if(this.emailForm.controls.CC.value){
      body.ccAddress = [];
      body.ccAddress.push(this.emailForm.controls.CC.value)
    }
    body.subject = (this.emailForm.controls.Subject.value)
    body.message = this.body.value
    body.fileNames.push(this.attachedDocument.fileName)
    body.docId.push(this.attachedDocument.documentId)
    body.fileModel.id = (this.attachedDocument.documentId);
    this.showLoader = true;
    this.service.emailSend(body).subscribe((res) => {
      this.showLoader = false;
      this.emailForm.reset();
      modal.dismiss('Cancel click');
    },error => {
      this.showLoader = false;
      this.showErrorMessage("Failed to send email");
    })
    console.log(this.attachedDocument);
    console.log(this.emailForm.value);
    console.log(this.body.value);
  }

  cancel(modal) {
    modal.dismiss('Cancel click');
  }

  showErrorMessage(error){ 
    this.errorMsg = error;
    this.showWarning = true;
    setTimeout(()=>{ this.showWarning = false; }, 3000)
  }

  closeAlert() {
    this.showWarning = false;
  }

}