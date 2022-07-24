import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvConfig } from '@eka-framework/core';
import * as moment from 'moment';
import { UtilService } from '../../../utils/util.service';
import { ContractService } from '../../contract-service/contract-service.service';
declare var require: any
var momentBDs = require('moment-business-days');

@Injectable({
  providedIn: 'root'
})
export class PaymentDueDateAndEventDateService {

  constructor(private http: HttpClient, private us: UtilService, private cs:ContractService) { }

  getPaymentTermDetails(paymentTermId) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'paymentTerms',
      task:"paymentTerms",
      output: {
        paymentTerms: { "paymentTermId": paymentTermId }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody).pipe(this.cs.handleError('Failed to fetch paymentTerm details'));
  }

  getIncotermDetails(incoTermId) {
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'incoterm',
      task:"incoterm",
      output: {
        incoterm : { "incoTermId": incoTermId }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody).pipe(this.cs.handleError('Failed to fetch incoterm details'));
  }

  getHolidaysList(country) {
    let encoded = encodeURI(country);
    let workFlowConfigBody : any = {
      appId : EnvConfig.vars.app_uuid,
      workflowTaskName: 'holidaysList',
      task:"holidaysList",
      output: {
        holidaysList : { "calendarName":encoded }
      }
    }
    return this.http.post('/workflow',workFlowConfigBody);
  }

  calculateBaseDate(DP_fromDate, DP_toDate, paymentTermDetails, incotermDetails, holidayRule, customEventDate){
    let baseDate
    if(DP_fromDate && DP_toDate && incotermDetails) {
        switch(paymentTermDetails.baseDate){
          case 'ShipmentStartDate':
            baseDate = this.us.getMomentDate(DP_fromDate).format('DD-MM-YYYY');
            break;
          case 'ShipmentEndDate':
            baseDate =  this.us.getMomentDate(DP_toDate).format('DD-MM-YYYY');
            break;
          case 'Title_Transfer_Date':
            if (incotermDetails.locationField === 'DESTINATION') {
              baseDate =  this.us.getMomentDate(DP_toDate).subtract(3, 'days').format('DD-MM-YYYY');
            } else {
              baseDate =  this.us.getMomentDate(DP_fromDate).add(3, 'days').format('DD-MM-YYYY');
            }
            break;
          case 'Invoice_Date':
            let days = this.us.getMomentDate(DP_toDate).diff(this.us.getMomentDate(DP_fromDate), 'days') + 1;
            let mid = Math.floor(days/2);
            baseDate =  this.us.getMomentDate(DP_fromDate).add(mid,'days').format('DD-MM-YYYY');
            break;
          default :
            if(customEventDate){
              baseDate =  this.us.getMomentDate(customEventDate).format('DD-MM-YYYY');
            }
            break;
        }
        console.log(' the base date is :');
        console.log(baseDate);
        if(baseDate){
          let paymentDueDate
          if(paymentTermDetails.isEomTerm !== 'N'){
            paymentDueDate = this.calcuateEOM(baseDate, paymentTermDetails, holidayRule);
          } else if (paymentTermDetails.isEowTerm !== 'N') { 
            paymentDueDate = this.calcuateEOW(baseDate, paymentTermDetails, holidayRule);
          } else if (paymentTermDetails.numberOfCreditDays) {
            paymentDueDate = this.calculateCreditDays(baseDate, paymentTermDetails, holidayRule);
          } else {
            paymentDueDate = this.checkHoliday(baseDate, holidayRule);
          }
          return paymentDueDate;
        }
    }
  }

  calculateCreditDays(baseDate, paymentTermDetails, holidayRule) {
    let creditDays = paymentTermDetails.numberOfCreditDays
    let generatedDate
    if(holidayRule === 'IgnoreHolidays') {
      if(paymentTermDetails.isBeforeAfter === "N" || paymentTermDetails.isBeforeAfter === "After" || paymentTermDetails.isBeforeAfter == null) {
        let business_date = String(momentBDs(baseDate, 'DD-MM-YYYY').businessAdd(creditDays)._d);
        generatedDate = moment(new Date(business_date.substr(0, 16))).format("DD-MM-YYYY");
      } else {
        let business_date = String(momentBDs(baseDate, 'DD-MM-YYYY').businessSubtract(creditDays)._d);
        generatedDate = moment(new Date(business_date.substr(0, 16))).format("DD-MM-YYYY");
      }
    } else {
      if(paymentTermDetails.isBeforeAfter === "N" || paymentTermDetails.isBeforeAfter === "After" || paymentTermDetails.isBeforeAfter == null) {
        generatedDate = moment(baseDate, 'DD-MM-YYYY').add(creditDays, 'days').format('DD-MM-YYYY');
      } else {
        generatedDate = moment(baseDate, 'DD-MM-YYYY').subtract(creditDays, 'days').format('DD-MM-YYYY');
      }
    }
    return this.checkHoliday(generatedDate, holidayRule);
  }

  getHolidayList(res) {
    if(res.data.weeklyHoliday){
      let weekMap = {
        "Sun" : 0,
        "Mon" : 1,
        "Tue" : 2,
        "Wed" : 3,
        "Thu" : 4,
        "Fri" : 5,
        "Sat" : 6
      };
      let week = Object.keys(weekMap).filter(day=>{
        return !(res.data.weeklyHoliday.find(holiday=>day===holiday))
      })
      console.log(week);
      let weekDays = week.map(day=>weekMap[day]);
      console.log(weekDays);
      momentBDs.updateLocale('us', {
        workingWeekdays: weekDays
      });
    }
    if(res.data.holidayDates){
      momentBDs.updateLocale('us', {
        holidays: res.data.holidayDates,
        holidayFormat: 'YYYY-MM-DD'
      });
    }
  }

  calcuateEOW(baseDate, paymentTermDetails, holidayRule) {
    let EOW_baseDate = moment(baseDate,'DD-MM-YYYY').day(1+7).format('DD-MM-YYYY');
    return this.calculateCreditDays(EOW_baseDate, paymentTermDetails, holidayRule);
  }

  calcuateEOM(baseDate, paymentTermDetails, holidayRule) {
    let EOM_baseDate = moment(baseDate,'DD-MM-YYYY').endOf('month').format('DD-MM-YYYY');
    return this.calculateCreditDays(EOM_baseDate, paymentTermDetails, holidayRule);
  }

  checkHoliday(generatedDate, holidayRule) {
    if(momentBDs(generatedDate, 'DD-MM-YYYY').isBusinessDay()) {
      return this.us.getMyDatePickerDate(generatedDate);
    } else {
      let new_generatedDate
      switch(holidayRule){
        case 'PriorBusinessDay':
          let prior = String(momentBDs(generatedDate, 'DD-MM-YYYY').prevBusinessDay()._d);
          new_generatedDate = moment(new Date(prior.substr(0, 16))).format("DD-MM-YYYY");
          break;
        case 'NextBusinessDay':
          let next = String(momentBDs(generatedDate, 'DD-MM-YYYY').nextBusinessDay()._d);
          new_generatedDate = moment(new Date(next.substr(0, 16))).format("DD-MM-YYYY");
          break;
        case 'IgnoreHolidays':
          let ignore = String(momentBDs(generatedDate, 'DD-MM-YYYY').businessAdd()._d);
          new_generatedDate = moment(new Date(ignore.substr(0, 16))).format("DD-MM-YYYY");
          break;
        case 'NotApplicable':
          new_generatedDate = generatedDate
          break;
      }
      return this.us.getMyDatePickerDate(new_generatedDate);
    }
  }

  calculateCustomEventDate(deliveryFromDate, deliveryToDate, incotermDetails){
    let date 
    if(incotermDetails.locationField === 'ORIGINATION'){
      date = deliveryFromDate;
      if(date){
        let momentDate = this.us.getMomentDate(date);
        let month = momentDate.month();
        let year = momentDate.year();
        let eventDate = moment([year, month, '03']).format('DD-MM-YYYY');
        return eventDate;
      }
    }else{
      date = deliveryToDate;
      if(date){
        let momentDate = this.us.getMomentDate(date);
        let eventDate = momentDate.endOf('month').subtract('2', 'days').format('DD-MM-YYYY');
        return eventDate;
      }
    }
  }

  recalculatePaymentDates(contract, paymentTermDetails, incotermDetails, customEvent){
    let itemDetails = contract.itemDetails.map(item=>{
      if(item.deliveryFromDate && item.deliveryToDate && item.holidayRule){
        if(customEvent){
          let customEventDate = this.calculateCustomEventDate(item['deliveryFromDate'], item['deliveryToDate'], incotermDetails);
          if(customEventDate){
            item.customEvent = customEvent.key;
            let displayValue = JSON.parse(item["itemDisplayValue"]);
            item["itemDisplayValue"] = JSON.stringify({ ...displayValue, 'customEvent': customEvent.value });
            item.customEventDate = customEventDate;
          }
        }else{
          item.customEvent = null;
          item.customEventDate = null;
        }
        let paymentDueDate = this.calculateBaseDate(item['deliveryFromDate'], item['deliveryToDate'], paymentTermDetails, incotermDetails, item.holidayRule, item.customEventDate);
        if(paymentDueDate){
          item.paymentDueDate = paymentDueDate;
        }
      }
      return item
    }) 
    return itemDetails;
  }

}
