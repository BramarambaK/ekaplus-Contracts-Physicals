import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, forkJoin } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { MasterDataService } from '../master-data.service';
import { Urls } from '../../../urls';
import { FormBuilder, Validators } from '@angular/forms';
import { allOrNoneRequiredValidator } from '../../contract-service/loading-validator';

@Component({
  selector: 'app-qaulity-spec-popup',
  templateUrl: './qaulity-spec-popup.component.html',
  styleUrls: ['./qaulity-spec-popup.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})
export class QaulitySpecPopupComponent implements OnInit {
  specificationArr = [];
  quality: any;
  @Input() id;
  @Input() productId
  @Input() itemDetails
  @Input() fields
  @Input() disableDensityFields 
  contractQualityForm
  @Output() addContractQualityDensity = new EventEmitter<any>();
  errorMsg
  finalValidation
  showWarning
  loading

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private mdm: MasterDataService,
    private http: HttpClient,
    private fb: FormBuilder,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnChanges(change) {
    if(change.productId){
      this.productId = change.productId.currentValue;
    }
    if(change.itemDetails){
      this.itemDetails = change.itemDetails.currentValue;
    }
  }

  ngOnInit() {}

  open(content) {
    this.modalService.open(content).result.then((result) => {
    }, (reason) => {
    });
    // this.mdm.getQualitySpec(this.id).subscribe((res:any) => {
    //   this.quality = res.data;
    // });
    this.contractQualityForm = this.fb.group({
      densityFactor: [0],
      densityMassQtyUnitId: [''],
      densityVolumeQtyUnitId: ['']
    }, { validators: allOrNoneRequiredValidator })

    this.contractQualityForm.patchValue(this.itemDetails)
    
    let allUnitAPIBody:any = {
      appId : "5d907cd2-7785-4d34-bcda-aa84b2158415",
      data : [{
        serviceKey: "productQtyUnitByType",
        dependsOn: [this.productId]
      }],
      workFlowTask: "mdm_api"
    };

    let volumeUnitAPIBody:any = {
      appId : "5d907cd2-7785-4d34-bcda-aa84b2158415",
      data : [{
        serviceKey: "productQtyUnitByType",
        dependsOn: [this.productId, "Volume"],
      }],
      workFlowTask: "mdm_api"
    };

    if(!this.fields.densityVolumeQtyUnitId || !this.fields.densityVolumeQtyUnitId.options || this.fields.densityVolumeQtyUnitId.options.length === 0){
      this.fields.densityVolumeQtyUnitId = { options : [] };
      this.fields.densityMassQtyUnitId = { options : [] };
      this.loading = true;
    }
    
    concat(this.http.post(Urls.MDM_URL, allUnitAPIBody),this.http.post(Urls.MDM_URL, volumeUnitAPIBody))
    .pipe(toArray()).subscribe((res:any)=>{
      this.loading = false;
      let volumeUnits = res[1].productQtyUnitByType;
      let allUnits = res[0].productQtyUnitByType;
      this.fields.densityVolumeQtyUnitId = { options : volumeUnits}
      let massUnits = allUnits.filter(allUnit=>{
        return (volumeUnits.every((volUnit)=>volUnit.key !== allUnit.key))
      })
      this.fields.densityMassQtyUnitId = { options : massUnits};
    })

    if(this.disableDensityFields){
      this.contractQualityForm.disable();
    }

  }

  cancel(modal) {
    modal.dismiss('Cancel click')
  }

  saveContractQualityDensity(modal){
    if(this.contractQualityForm.valid){
      this.addContractQualityDensity.emit(this.contractQualityForm.value);
      modal.close('Save click');
    }else{
      this.errorMsg = 'Fill all fields before save';
      this.finalValidation = true;
      this.showWarning = true;
    }
  }

  handleAlert(showAlert){
    if(showAlert){
      setTimeout(() => this.showWarning = false, 4000);
    }
    return showAlert;
  }

  closeAlert() {
    this.showWarning = false;
  }

  setFieldClasses(field){
    let classes = {
      "is-invalid": this.validateField(field),
    };
    return classes;
  }

  validateField(name) {
    if (!this.finalValidation) {
      return (this.contractQualityForm.get(name).value === null) && this.contractQualityForm.get(name).touched
    } else {
      return this.contractQualityForm.get(name).value === null
    }
  }

  deleteDensity() {
    this.contractQualityForm.reset({
      densityFactor: 0,
      densityMassQtyUnitId: '',
      densityVolumeQtyUnitId: ''
    });
  }
}
