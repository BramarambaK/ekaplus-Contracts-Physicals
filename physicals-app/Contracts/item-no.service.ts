import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ItemNoService {

  constructor() { }

  
  getBiggestItemNo(contract) {
    let len = contract.itemDetails.length;
    let biggest = 0;
    for (let i = 0; i < len; i++) {
      let itemNo = contract.itemDetails[i].itemNo;
      if (itemNo > biggest) {
        biggest = itemNo;
      }
    }
    return biggest;
  }


}
