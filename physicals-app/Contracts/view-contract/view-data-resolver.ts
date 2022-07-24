import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Urls } from '../../urls';
import { EnvConfig } from '@eka-framework/core';
import { ApplicationService } from '@app/views/application/application.service';

@Injectable()
export class ViewDataResolver implements Resolve<any> {
  constructor(private http: HttpClient, private appService: ApplicationService) {}

  resolve(route: ActivatedRouteSnapshot) {
    EnvConfig.vars = {} as any;
    const httpOptions = {
      headers: new HttpHeaders({
      "Content-Type":"application/json", 
      "X-CONTRACT-ACTION":"VIEW"
      })
    };
    this.appService.appMeta$.subscribe((app:any) => {
      EnvConfig.vars.app_uuid = app.sys__UUID;
    })
    return forkJoin(
      this.http.get(Urls.CONTRACT_META_URL).pipe(
        map((val: any) => {
          for (let field of Object.entries(val.fields)) {
            val.fields[field[0]]['label'] = field[1][field[1]['labelKey']];
          }
          return { ...route.params, ...val };
        })
        ),
      this.http.get(Urls.GET_CONTRACT_CTRM + "?contractRefNo=" + route.firstChild.params.id, httpOptions)
    ).pipe(tap(val=>{
      console.log(val);
    }));
  }
}
