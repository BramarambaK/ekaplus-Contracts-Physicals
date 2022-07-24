import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { EnvConfig } from '@eka-framework/core';
import { ContractService } from '../../contract-service/contract-service.service';
import { ApplicationService } from '@app/views/application/application.service';

@Injectable()
export class GeneralDetailsResolverService implements Resolve<any>{

  constructor(private appService: ApplicationService, private cs: ContractService) {}

  resolve(route: ActivatedRouteSnapshot) {
    this.appService.appMeta$.subscribe((app:any) => {
      EnvConfig.vars.app_uuid = app.sys__UUID;
    })
    let parentData = JSON.parse(JSON.stringify(route.parent.data.ViewData));
    let contract = parentData[1]; 
    delete contract['itemDetails'];
    delete contract['_id'];
    let generalDetails = [];
    generalDetails.push(contract);
    return forkJoin(
      of (parentData[0]),
      this.cs.getItemsListDisplayValues(generalDetails)
    ).pipe(tap(val=>{
      console.log(val);
    }));
  }
}
