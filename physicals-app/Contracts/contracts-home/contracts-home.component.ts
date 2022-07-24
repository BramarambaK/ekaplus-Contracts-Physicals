import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContractService } from '../contract-service/contract-service.service';

@Component({
  selector: 'app-contracts-home',
  templateUrl: './contracts-home.component.html',
  styleUrls: ['./contracts-home.component.scss']
})
export class ContractsHomeComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private cs: ContractService) { }

  tempId
  ngOnInit() {
    this.tempId = this.route.snapshot.data.DraftId._id;
    sessionStorage.setItem('appOrigin','connect');
  }

  createContract() {
      this.router.navigate(['contract/create/general-details/' + this.tempId],
        { relativeTo: this.route })
  }

  createTemplate() {
      this.router.navigate(['template/create/general-details/' + this.tempId],
        { relativeTo: this.route })
  }
}
