import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Urls } from '../../../urls';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { UtilService } from '../../../utils/util.service';
import { ContractService } from '../../contract-service/contract-service.service';
import { ItemNoService } from '../../item-no.service';
import { ComponentService } from '../../component-service/component.service';
import { PaymentDueDateAndEventDateService } from '../payment-due-date-and-event-date/payment-due-date-and-event-date.service';

@Component({
  selector: 'app-generate-items-popup',
  templateUrl: './generate-items-popup.component.html',
  styleUrls: ['./generate-items-popup.component.scss']
})
export class GenerateItemsPopupComponent implements OnInit {
  @Input() action
  @Input() appObject
  @Input() contract
  @Input() id
  @Input() itemIndex
  @Input() fields
  @Input() splitData;
  @Output() saveGeneratedItems = new EventEmitter<string>();
  @Input() paymentTermDetails
  @Input() incotermDetails

  closeResult: string;
  GenerateDataForm
  from_date
  to_date
  save_data
  currentItem
  numItems
  momentAddString: string = 'M';

  @ViewChild('content') content;
  itemNoArr: any[] = [];
  totalItem: number;
  constructor(private itemNoService: ItemNoService, private cs: ContractService, private us: UtilService, private http: HttpClient, private modalService: NgbModal, private fb: FormBuilder, private router: Router, private route: ActivatedRoute,private componentService:ComponentService, private PaymentAndEventService: PaymentDueDateAndEventDateService) { }


  deliveryFromDateOptions: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '150px'
  };

  deliveryToDateOptions: IMyDpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '28px',
    width: '150px',
  };

  onDateChanged(event: IMyDateModel) {
    this.disableUntil(event.date, 'deliveryToDateOptions');
  }

  disableUntil(date, dateOptions) {
    let _temp = this.us.getMomentDate({'date':date}).subtract(1, "days").toObject();
    let disableTillDate = { 'day' : _temp.date, 'month': _temp.months + 1, 'year': _temp.years};
    let copy = JSON.parse(JSON.stringify(this[dateOptions]));
    copy.disableUntil = disableTillDate;
    this[dateOptions] = copy;
  }

  ngOnInit() { 
  }

  open(content = this.content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    if(this.splitData){
       localStorage.setItem('splitData', JSON.stringify(this.splitData));
    }

    if (this.contract.issueDate) {
      let datePicker_format_issueDate = this.us.getMyDatePickerDate(this.contract.issueDate);
      this.disableUntil(datePicker_format_issueDate.date, 'deliveryFromDateOptions');
    }

    this.GenerateDataForm = this.fb.group({
      from_date: [moment().format("YYYY-MM-DD")],
      to_date: [moment().add(1, 'years').format("YYYY-MM-DD")],
      frequency: ['Monthly']
    })
    this.GenerateDataForm.valueChanges.subscribe(data => {
      this.calculateNumberOfItems();
    })
    this.currentItem = this.contract.itemDetails[parseInt(this.itemIndex)];
    let from_date = this.GenerateDataForm.get('from_date');

    from_date.setValue(this.us.getMyDatePickerDate(this.currentItem.deliveryFromDate));
    this.disableUntil(from_date.value.date, 'deliveryToDateOptions');
    this.GenerateDataForm.get('to_date').setValue(this.us.getMyDatePickerDate(this.currentItem.deliveryToDate));
  }

  calculateNumberOfItems() {
    let startDate = this.us.getMomentDate(this.GenerateDataForm.get('from_date').value);
    let endDate = this.us.getMomentDate(this.GenerateDataForm.get('to_date').value);
    if (startDate && endDate) {
      this.numItems = 0;
      let frequency = this.GenerateDataForm.get('frequency').value;
      switch (frequency) {
        case 'Monthly':
          this.momentAddString = 'M'
          break;
        case 'Quarterly':
          this.momentAddString = 'Q'
          break;
        case 'Yearly':
          this.momentAddString = 'y'
          break;
      }
      var num = 1 as any;
      while (startDate.isBefore(endDate)) {
        startDate.add(num, this.momentAddString);
        this.numItems++;
      }
      this.generateItemNums();
    }
  }

  generateItemNums() {
    this.itemNoArr = [];
    let max = this.itemNoService.getBiggestItemNo(this.contract);
    let currentItemNo = this.contract.itemDetails[parseInt(this.itemIndex)].itemNo;	
    this.itemNoArr.push(currentItemNo);
    for (let i = max + 1; i < max + this.numItems; i++) {
      this.itemNoArr.push(i);
    }
  }

  calculateItems() {
    var num = 1 as any;
    let itemNoIndex = 0;
    let startDate = this.us.getMomentDate(this.GenerateDataForm.get('from_date').value);
    let endDate = this.us.getMomentDate(this.GenerateDataForm.get('to_date').value);
    let all_generated_items = [];
    while (startDate.isBefore(endDate)) {
      let newItem = JSON.parse(JSON.stringify(this.contract.itemDetails[this.itemIndex]));
      newItem = this.cs.removeAllItemInternalIDs(newItem);
      let newItem_start_date = startDate.format("DD-MM-YYYY");
      startDate.add(num, this.momentAddString);
      let newItem_end_date = startDate.clone().subtract(1, "days");
      newItem['deliveryFromDate'] = newItem_start_date;
      if(endDate.isBefore(newItem_end_date)){
        newItem['deliveryToDate'] = endDate.format("DD-MM-YYYY");
      }else{
        newItem['deliveryToDate'] = newItem_end_date.format("DD-MM-YYYY");
      }
      newItem['itemNo'] = this.itemNoArr[itemNoIndex];
      let currentItemPricing = this.contract.itemDetails[this.itemIndex].pricing;
      if(currentItemPricing.pricingStrategy === 'pricingStrategy-002' || currentItemPricing.pricingStrategy === 'pricingStrategy-003'){
        if(currentItemPricing.splitFormData && currentItemPricing.splitFormData.length>0){
          newItem.pricing.splitFormData.forEach(split => {
            split["itemNumber"] = String(newItem['itemNo']);
          });
        }
      }
      if(newItem.customEventDate && this.paymentTermDetails && this.incotermDetails){
        newItem.customEventDate = this.PaymentAndEventService.calculateCustomEventDate(newItem['deliveryFromDate'], newItem['deliveryToDate'], this.incotermDetails);
      }
      if(newItem.paymentDueDate && this.paymentTermDetails && this.incotermDetails){
        let paymentDueDate = this.PaymentAndEventService.calculateBaseDate(newItem['deliveryFromDate'], newItem['deliveryToDate'], this.paymentTermDetails, this.incotermDetails, newItem.holidayRule, newItem.customEventDate);
        if(paymentDueDate){
          newItem.paymentDueDate = paymentDueDate;
        }
      }
      itemNoIndex++;
      all_generated_items.push(newItem);
    }

    this.currentItem.deliveryFromDate = all_generated_items[0].deliveryFromDate;
    this.currentItem.deliveryToDate = all_generated_items[0].deliveryToDate;
    this.currentItem.customEventDate = all_generated_items[0].customEventDate;
    this.currentItem.paymentDueDate = all_generated_items[0].paymentDueDate;
    all_generated_items[0] = this.currentItem;

    let newItemsArr = [...this.contract.itemDetails];
    newItemsArr.splice(this.itemIndex, 1);
    newItemsArr = [...newItemsArr, ...all_generated_items];

    this.contract.itemDetails = newItemsArr;
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


  generateListItems(modal) {
    this.calculateItems();
    this.saveGeneratedItems.emit(this.contract.itemDetails);
    modal.dismiss('Contract Created');
  }

}
