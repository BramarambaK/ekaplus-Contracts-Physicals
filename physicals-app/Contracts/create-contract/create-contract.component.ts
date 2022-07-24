import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ContractService } from '../contract-service/contract-service.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.scss']
})
export class CreateContractComponent {
  
  FormData
  saveContractChild
  active = true;
  currentComponent
  documentUpload = false;
  constructor(private cs: ContractService,private http: HttpClient,private router: Router, private route: ActivatedRoute) {
     this.FormData = this.route.snapshot.data.FormData;
     this.cs.refreshTrigger.subscribe(val=>{
       this.active = false;
       setTimeout(()=>{ 
         this.active = true;
       },500)
     })
   }

  public onRouterOutletActivate(event : any) {
    this.saveContractChild = event.saveContract;
    this.currentComponent = event;
    try{
      if((this.route.snapshot.children[0].url[0].path === 'document-upload')){
        this.documentUpload = true;
      }else{
        this.documentUpload = false;
      }
    }catch(err){
      console.log('error in snapshot for bottom bar');
      this.documentUpload = false;
    }
  }
  
  saveContract(){
    this.saveContractChild();
  }
  
  redirect(){
    if(this.currentComponent.handleCancel){
      this.currentComponent.handlePageCancel();
    }else{
      if(sessionStorage.getItem('appOrigin')==='platform'){
        this.cs.redirectToCTRM(this.router.url.split('/',3)[2]);
      }else{
        this.router.navigate(['/physicals']);
      }
    }
  }

}
