import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ContractsInterceptor } from './contracts-interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ContractsInterceptor, multi: true },
];