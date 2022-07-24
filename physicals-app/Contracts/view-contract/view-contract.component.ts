import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-contract',
  templateUrl: './view-contract.component.html',
  styleUrls: ['./view-contract.component.scss']
})
export class ViewContractComponent{

  FormData
  saveContractChild
  onItemList=true
  constructor(private http: HttpClient,private router: Router, private route: ActivatedRoute) {
     this.FormData = this.route.snapshot.data.FormData;

     this.router.events.subscribe((res) => { 
        if(this.router.url.indexOf('item-details-list')>0){
            this.onItemList=false;
        }else{
            this.onItemList=true;
        }
     })
   }

  public onRouterOutletActivate(event : any) {
    this.saveContractChild = event.saveContract;
  }
  
  saveContract(){
    this.saveContractChild();
  }

}
