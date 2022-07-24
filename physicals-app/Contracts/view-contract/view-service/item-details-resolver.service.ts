import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { EnvConfig } from '@eka-framework/core';
import { ApplicationService } from '@app/views/application/application.service';


@Injectable({
  providedIn: 'root'
})
export class ItemDetailsResolverService implements Resolve<any>{

  constructor(private appService: ApplicationService) {}

  resolve(route: ActivatedRouteSnapshot) {
    this.appService.appMeta$.subscribe((app:any) => {
      EnvConfig.vars.app_uuid = app.sys__UUID;
    })
    let parentData = JSON.parse(JSON.stringify(route.parent.data.ViewData));
    return parentData;
  }
}
