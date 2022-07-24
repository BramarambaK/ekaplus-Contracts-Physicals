import { Injectable, Inject } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders
} from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { Observable } from 'rxjs';


@Injectable()
export class ContractsInterceptor implements HttpInterceptor {
  
  credentials
  constructor(@Inject(APP_BASE_HREF) private baseHref: string) {}
  intercept(req: HttpRequest<any>, next: HttpHandler,):
    Observable<HttpEvent<any>> {

      const savedCredentials = sessionStorage.getItem('credentials') || localStorage.getItem('credentials');
      const credentials = JSON.parse(savedCredentials);
      const tenant = this.baseHref.split('/')[1];
      const lang = navigator.language;
      
      const headers = new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': credentials.token,
          'X-Locale': 'en-US',
          'X-TenantID': tenant,
          "userName": "admin"
        });
  
  
      const cloneReq = req.clone({headers});
      return next.handle(cloneReq);
  }
}