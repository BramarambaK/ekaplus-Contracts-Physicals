import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getUnixDate(date) {
    if (date) {
      return this.getMomentDate(date).valueOf();
    }
    return null;
  }

  getPhysicalsDate(date) {
    if (date) {
      return this.getMomentDate(date).format('DD-MM-YYYY');
    }
    return null;
  }

  getItemListDate(date, format='DD-MMM-YYYY') {
    format = format.toUpperCase();
    if (date && date !== ' - ' && date !== "null") {
      let _temp = this.getMomentDate(date);
      let _newDate = _temp.format(format);
      return _newDate;
    }
    return null;
  }

  getMyDatePickerDate(date) {
    if (date) {
      if (typeof date === 'object' && date.hasOwnProperty('date')) {
        return date;
      } else {
        let temp: any;
        temp = this.getMomentDate(date);
        if(temp){
          let date_new = {
            date: {
              year: temp.year(),
              month: temp.month() + 1,
              day: temp.date()
            }
          }
          return date_new;
        }
      }
    }
    return null;
  }

  getMomentDate(date) {
    if (date) {
      if (typeof date === 'object') {
        if (date.hasOwnProperty('formatted')) {
          return moment(date.formatted, 'DD-MMM-YYYY');
        } else if (date.hasOwnProperty('date')) {
          let _temp = {...date.date}
          _temp.month -= 1;
          return moment(_temp);
        }
      } else if (typeof date === 'string') {
        if(moment(date, "YYYY-MM-DDTHH:mm:ss.SSS+0000", true).isValid()){
          let _date = date.split('T')[0];
          return moment(_date, "YYYY-MM-DD");
        }
        if (/([0-3][0-9]-[0-1][0-9]-[0-9]{4})/.test(date)) {
          return moment(date, 'DD-MM-YYYY');
        }
        if (/([0-9]{4}-[0-1][0-9]-[0-3][0-9])/.test(date)) {
          date = date.slice(0, 11);
          return moment(date, 'YYYY-MM-DD');
        }
        if (/([0-9]{8})/.test(date)) {
          let _date = date.slice(0,2) + '-' +  date.slice(2,4) + '-' + date.slice(4,8);
          return moment(date, 'DD-MM-YYYY');
        }
        if (/^\d{2}-[a-zA-Z]{3}-\d{4}$/.test(date)){
          return moment(date, 'DD-MMM-YYYY');
        }
      } else if (typeof date === 'number') {
        return moment(date);
      }
    }
  }

  getISO(date){
    if(date){
      if(moment(date, "YYYY-MM-DDTHH:mm:ss.SSS+0000", true).isValid()){
        return date;
      }else{
        return this.getMomentDate(date).format("YYYY-MM-DDTHH:mm:ss.SSS+0000");
      }
    }else{
      return null;
    }
  }

  objPropRemoveNull(obj){
    Object.keys(obj).forEach((key) => (obj[key] == null) && delete obj[key]);
  }

  checkNullInArray(arr){
     return arr.every(ele=>ele!==null)
  }
  getDateForUploadDocument(date){
    let d1 = this.getISO(date)
    return moment(d1).format('DD-MMM-YYYY')
  }

}
