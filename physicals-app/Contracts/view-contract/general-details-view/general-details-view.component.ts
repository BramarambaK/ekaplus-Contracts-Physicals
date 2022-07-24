import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from '../../../utils/util.service';

@Component({
  selector: 'app-general-details-view',
  templateUrl: './general-details-view.component.html',
  styleUrls: ['./general-details-view.component.scss']
})
export class GeneralDetailsViewComponent implements OnInit {

  viewData
  fields
  contract
  mandatoryFieldsCol1View = [];
  mandatoryFieldsCol2View = [];
  optionalFieldsCol1View = [];
  optionalFieldsCol2View = [];
  mandatoryFieldsCol1 = [
      "templateId",
      "issueDate",
      "dealType",
      "traderUserId",
      "contractType",
      "cpProfileId"
  ];
  mandatoryFieldsCol2 = [
    "paymentTermId",
    "provisionalPaymentTermId",
    "applicableLawId",
    "arbitrationId",
    "incotermId",
    "remark"
  ]
  optionalFieldsCol1 = [
      "prePaymentPct",
      "prePaymentDays",
      "qualityFinalAt",
      "weightFinalAt",
      "agentProfileId",
      "agentPersonInCharge",
  ];
  optionalFieldsCol2 = [
    "agentRefNo",
    "agentCommValue",
    "agentCommPriceUnitId",
    "cpPersonInCharge",
    "cpRefNo"
  ]
  viewColumns = ['mandatoryFieldsCol1','mandatoryFieldsCol2','optionalFieldsCol1','optionalFieldsCol2'];
  constructor(private route: ActivatedRoute, private router: Router, private us: UtilService) {}

  ngOnInit() {
    this.viewData = this.route.snapshot.data.ViewData;
    this.fields = this.viewData[0].fields;
    this.contract = this.viewData[1][0];
    
    this.contract.issueDate = this.us.getPhysicalsDate(this.contract.issueDate);
    let generalDetailsDisplayValue = JSON.parse(this.contract.generalDetailsDisplayValue);
    this.viewColumns.forEach(columnName => {
      let viewName = columnName + 'View'
      this[columnName].forEach(element => {
        let property = element+'.displayText';
        let displayValue = element + 'DisplayName';
          if(this.contract.hasOwnProperty(property) && this.contract[property] !== null){
            this[viewName].push({ 'label' : this.fields[element].label , 'value': this.contract[property]})
          }else if(generalDetailsDisplayValue[displayValue]){
            this[viewName].push({ 'label' : this.fields[element].label , 'value': generalDetailsDisplayValue[displayValue]})
          }else if(this.contract[element] !== "null"){
            this[viewName].push({ 'label' : this.fields[element].label , 'value': this.contract[element]})
          }else{
            this[viewName].push({ 'label' : this.fields[element].label , 'value': ''});
          }
      });
   });

  //  this.optionalFieldsView.filter(ele=>{
  //    return ele.label === 'Broker Commission' || ''
  //  })

  }

  editItem() {
    this.router.navigate(['../../../edit/general-details/' + this.contract.internalContractRefNo], { relativeTo: this.route });
  }

}
