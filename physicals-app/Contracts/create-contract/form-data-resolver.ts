import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Resolve,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { MasterDataService } from './master-data.service';
import { HttpHeaders } from '@angular/common/http';
import { Urls } from '../../urls';
import { EnvConfig } from '@eka-framework/core';
import { ApplicationService } from '@app/views/application/application.service';

@Injectable()
export class FormDataResolver implements Resolve<any> {
  constructor(private http: HttpClient, private mdm: MasterDataService, private appService: ApplicationService) {}

  resolve(route: ActivatedRouteSnapshot) {
    EnvConfig.vars = {} as any;
    this.appService.appMeta$.subscribe((app:any) => {
      EnvConfig.vars.app_uuid = app.sys__UUID;
    })
    return forkJoin(
      this.mdm.getMdm(),
      this.http.get(Urls.CONTRACT_META_URL)
    ).pipe(
      mergeMap((val: any) => {
        for (let field of Object.entries(val[1].fields)) {
          val[1].fields[field[0]]['label'] = field[1][field[1]['labelKey']];
        }
        let newFormData = this.mdm.mapMdmFields(val[0], val[1]);
        return of({
          ...route.params,
          ...route.firstChild.params,
          ...route.firstChild.queryParams,
          ...newFormData
        });
      })
    );
  }
}
