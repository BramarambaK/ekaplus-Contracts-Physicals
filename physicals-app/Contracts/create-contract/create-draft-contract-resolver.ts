import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ContractService } from '../contract-service/contract-service.service';
import { EnvConfig } from '@eka-framework/core';
import { ApplicationService } from '@app/views/application/application.service';

@Injectable()
export class CreateDraftContract implements Resolve<any> {
  constructor(private cs: ContractService, private appService: ApplicationService) {}

  resolve() {
    EnvConfig.vars = {} as any;
    this.appService.appMeta$.subscribe((app:any) => {
      EnvConfig.vars.app_uuid = app.sys__UUID;
    })
    EnvConfig.vars.app_uuid = "5d907cd2-7785-4d34-bcda-aa84b2158415";
    return this.cs.startNewContract();
  }
}
