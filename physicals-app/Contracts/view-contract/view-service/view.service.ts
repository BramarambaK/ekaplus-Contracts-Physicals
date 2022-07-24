import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewService {
  
  displayValueApiTriggered = false;
  itemsDisplayValueLoaded = new AsyncSubject<any>();

  constructor() { }
  
}
