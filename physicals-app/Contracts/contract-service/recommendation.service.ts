import { Injectable } from '@angular/core';
import { MasterDataService } from '../create-contract/master-data.service';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  constructor() { }

  getGeneralDetailsFirstTimeDefaults(){
    let defaultsConfig = {
      incotermId : "cif",
      shipmentMode : 'container'
    }
  }

  getItemDetailsFirstTimeDefaults(){

  }


  getFirstTimeUserDefaults(fields, page){
    let defaultsConfig = {
      generalDetails : {
        incotermId : "cif",
      },
      itemDetails : {
        shipmentMode : 'container'
      }
    };
    let firstTimeUserDefaults = {};
    Object.entries(defaultsConfig[page]).forEach((val)=>{
      let [key, defaultVal] = val;
      let defaultKeyVal = fields[key].options.find(opt=>{
        return opt.value.trim().toLowerCase() === defaultVal;
      });
      if(defaultKeyVal){
        firstTimeUserDefaults[key] = defaultKeyVal.key;
      }
    })
    return firstTimeUserDefaults;
  }

}
