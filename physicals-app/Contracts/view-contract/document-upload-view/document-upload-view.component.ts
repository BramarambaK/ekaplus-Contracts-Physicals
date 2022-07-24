import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../contract-service/contract-service.service';
import { MasterDataService } from '../../create-contract/master-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-document-upload-view',
  templateUrl: './document-upload-view.component.html',
  styleUrls: ['./document-upload-view.component.scss']
})
export class DocumentUploadViewComponent implements OnInit {
  contractId = this.route.snapshot.parent.data.ViewData[1].internalContractRefNo;
  fields = this.route.snapshot.parent.data.ViewData[0].fields;
  newDocumentList: any;
  docType: any;
  showLoader: boolean = false;
  showWarning: boolean = false;
  errorMsg: string = "";

  constructor(
    private route: ActivatedRoute,
    private cs: ContractService,
    private doc: MasterDataService,
    private http: HttpClient
  ) {
    this.doc.getDocumentType().subscribe((res: any) => {
      this.docType = res.listOfDocumentNameByDocumentSetName;
    });
  }

  ngOnInit() {
    this.cs.getListDocument(this.contractId).subscribe((res: any) => {
      this.newDocumentList = res.data;
      for (var i = 0; i < this.newDocumentList.length; i++) {
        if (this.newDocumentList[i].uploadedDate) {
          this.newDocumentList[i].documentType = this.documentTypeToShow(this.newDocumentList[i].documentType);
        }
      }
    });
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

  showErrorMessage(error) {
    this.errorMsg = error;
    this.showWarning = true;
    setTimeout(() => { this.showWarning = false; }, 3000)
  }

  dateInFormat(date) {
    let formattedDate = date.split('T')[0].split('-');
    formattedDate =
      formattedDate[2] + '-' + formattedDate[1] + '-' + formattedDate[0];
    return formattedDate;
  }

  documentTypeToShow(key) {
    let formatteddoc = '';
    if (this.docType != undefined)
      for (let i = 0; i < this.docType.length; i++) {
        if (this.docType[i].key === key) {
          formatteddoc = this.docType[i].value;
          return formatteddoc;
        }
      }
  }
}
