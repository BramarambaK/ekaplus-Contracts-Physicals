import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  DefaultLayoutComponent,
  ConfigService,
  CtrmLayoutComponent
} from '@eka-framework/layout';
import { AuthenticationGuard } from '@eka-framework/core';

import { CreateContractComponent } from './Contracts/create-contract/create-contract.component';
import { GeneralDetailsComponent } from './Contracts/create-contract/general-details/general-details.component';
import { ItemDetailsComponent } from './Contracts/create-contract/item-details/item-details.component';
import { DocumentUploadComponent } from './Contracts/create-contract/document-upload/document-upload.component';
import { ItemsListComponent } from './Contracts/create-contract/items-list/items-list.component';

import { FormDataResolver } from './Contracts/create-contract/form-data-resolver';
import { CreateDraftContract } from './Contracts/create-contract/create-draft-contract-resolver';
import { ContractsHomeComponent } from './Contracts/contracts-home/contracts-home.component';
import { GeneralDetailsViewComponent } from './Contracts/view-contract/general-details-view/general-details-view.component';
import { ViewContractComponent } from './Contracts/view-contract/view-contract.component';
import { ItemDetailsViewComponent } from './Contracts/view-contract/item-details-view/item-details-view.component';
import { DocumentUploadViewComponent } from './Contracts/view-contract/document-upload-view/document-upload-view.component';
import { PrintableContractViewComponent } from './Contracts/view-contract/printable-contract-view/printable-contract-view.component';
import { ViewDataResolver } from './Contracts/view-contract/view-data-resolver';
import { CtrmHandlerComponent } from './ctrm-handler/ctrm-handler.component';
import { EnvService } from '@eka-framework/layout/env.service';
import { GeneralDetailsResolverService } from './Contracts/view-contract/view-service/general-details-resolver.service';
import { ItemDetailsResolverService } from './Contracts/view-contract/view-service/item-details-resolver.service';
import { CanDeactivateGuardService } from './http-interceptors/can-deactivate-guard.service';

export const contractRoutes: Routes = [
  {
    path: 'physicals',
    component: CtrmLayoutComponent,
    resolve: { data: ConfigService },
    canActivate: [AuthenticationGuard],
    data: {
      title: 'Physicals'
    },
    children: [
      {
        path: 'ctrmhandler',
        component: CtrmHandlerComponent
      },
      {
        path: '',
        component: ContractsHomeComponent,
        resolve: { DraftId: CreateDraftContract }
      },
      {
        path: 'contract/view',
        component: ViewContractComponent,
        resolve: { ViewData: ViewDataResolver },
        children: [
          {
            path: 'general-details/:id',
            component: GeneralDetailsViewComponent,
            resolve: { ViewData: GeneralDetailsResolverService }
          },
          {
            path: 'item-list/:id',
            component: ItemDetailsViewComponent,
            resolve: { ViewData: ItemDetailsResolverService }
          },
          {
            path: 'document-upload/:id',
            component: DocumentUploadViewComponent
          },
          {
            path: 'printable-contract/:id',
            component: PrintableContractViewComponent
          }
        ]
      },
      {
        path: ':appObject/:action',
        component: CreateContractComponent,
        resolve: { FormData: FormDataResolver },
        children: [
          {
            path: 'general-details/:id',
            component: GeneralDetailsComponent,
            canDeactivate: [CanDeactivateGuardService]
          },
          {
            path: 'item-details/:id/:itemNo',
            component: ItemDetailsComponent,
            canDeactivate: [CanDeactivateGuardService]
          },
          {
            path: 'item-list/:id',
            component: ItemsListComponent
          },
          {
            path: 'document-upload/:id',
            component: DocumentUploadComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(contractRoutes)],
  exports: [RouterModule]
})
export class ContractsRoutingModule {}
