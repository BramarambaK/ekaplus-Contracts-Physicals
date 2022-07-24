import { Injectable } from '@angular/core';
import { MasterDataService } from '../master-data.service';

@Injectable({
  providedIn: 'root'
})
export class DropdownChangeHandlerService {

  constructor(private mdm:MasterDataService) { }

  // loadCityData(item){
  //   if (item.destinationCountryId && item.destinationLocationGroupTypeId) {
  //     this.mdm.getCityData(item.destinationCountryId, item.destinationLocationGroupTypeId).subscribe((data: any) => {
  //       this.fields.destinationCityId.options = data.cityComboDataFromDB;
  //     })
  //   }
  //   if (item.originationCountryId && item.loadingLocationGroupTypeId) {
  //     this.mdm.getCityData(item.originationCountryId, item.loadingLocationGroupTypeId).subscribe((data: any) => {
  //       this.fields.originationCityId.options = data.cityComboDataFromDB;
  //     })
  //   }
  // }

  // loadAllDependentFields(fields, contract){
  //   this.mdm.getLocationGroupType(contract.incotermId).subscribe((data: any) => {
  //         fields.loadingLocationGroupTypeId.options = data.incoTermLocationGroupType;
  //         fields.destinationLocationGroupTypeId.options = data.incoTermLocationGroupType;
  //   });
  // }


}
