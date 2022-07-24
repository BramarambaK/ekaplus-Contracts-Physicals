import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractsComponent } from './contracts.component';

import { FormDataResolver } from './Contracts/create-contract/form-data-resolver';
import { CreateDraftContract } from './Contracts/create-contract/create-draft-contract-resolver';

import { CreateContractComponent } from './Contracts/create-contract/create-contract.component';
import { SideBarComponent } from './Contracts/create-contract/side-bar/side-bar.component';
import { GeneralDetailsComponent } from './Contracts/create-contract/general-details/general-details.component';
import { ItemDetailsComponent } from './Contracts/create-contract/item-details/item-details.component';
import { DocumentUploadComponent } from './Contracts/create-contract/document-upload/document-upload.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { GenerateItemsPopupComponent } from './Contracts/create-contract/generate-items-popup/generate-items-popup.component';
import { ItemsListComponent } from './Contracts/create-contract/items-list/items-list.component';
import { ContractsHomeComponent } from './Contracts/contracts-home/contracts-home.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SecondaryCostPopupComponent } from './Contracts/create-contract/secondary-cost-popup/secondary-cost-popup.component';
import { GeneralDetailsViewComponent } from './Contracts/view-contract/general-details-view/general-details-view.component';
import { ViewContractComponent } from './Contracts/view-contract/view-contract.component';
import { ItemDetailsViewComponent } from './Contracts/view-contract/item-details-view/item-details-view.component';
import { DocumentUploadViewComponent } from './Contracts/view-contract/document-upload-view/document-upload-view.component';
import { PrintableContractViewComponent } from './Contracts/view-contract/printable-contract-view/printable-contract-view.component';
import { ViewDataResolver } from './Contracts/view-contract/view-data-resolver';
import { ItemViewPopupComponent } from './Contracts/view-contract/item-details-view/item-view-popup/item-view-popup.component';
import { PricingModule } from '../../Pricing/pricing-app/pricing.module';
import { FormulaFormModule } from '../../Pricing/pricing-app/formula-form/formula-form.module';
import { PricingPopupComponent } from './Contracts/create-contract/pricing-popup/pricing-popup.component';
import { FormulaListModule } from '../../Pricing/pricing-app/formula-list/formula-list.module';
import { CtrmHandlerComponent } from './ctrm-handler/ctrm-handler.component';

import { MyDatePickerModule } from 'mydatepicker';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { QaulitySpecPopupComponent } from './Contracts/create-contract/qaulity-spec-popup/qaulity-spec-popup.component';
import { ValuationDetailsComponent } from './Contracts/create-contract/valuation-details/valuation-details.component';
import { SavePopupComponent } from './Contracts/create-contract/save-popup/save-popup.component';
import { ApproveContractPopupComponent } from './Contracts/create-contract/approve-contract-popup/approve-contract-popup.component';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApprovePopupComponent } from './Contracts/view-contract/approve-popup/approve-popup.component';

import { EkaCommonModule } from '@eka-framework/modules/common';
import { TableModule } from 'primeng/table';
import { MultiSelectModule, DropdownModule, CheckboxModule, AccordionModule, TabViewModule } from 'primeng/primeng';
import { FormulaDetailsPopupComponent } from './Contracts/create-contract/formula-details-popup/formula-details-popup.component';
import { ConfirmPopupComponent } from './Contracts/confirm-popup/confirm-popup.component';
import { RecommendationPopupComponent } from './Contracts/recommendation/recommendation-popup.component';
import { ClickElseWhereDirective } from './utils/click-else-where.directive';
import { GeneralDetailsResolverService } from './Contracts/view-contract/view-service/general-details-resolver.service';
import { ItemDetailsResolverService } from './Contracts/view-contract/view-service/item-details-resolver.service';
import { Email } from './Contracts/create-contract/email-popup/email.component';
import { AddDeductionComponent } from './Contracts/create-contract/add-deductions/add-deduction.component';
import { RINsComponent } from './Contracts/create-contract/item-details/rins/rins.component';
import { SplitItem } from './Contracts/create-contract/split-item/split-item.component';
import { SplitPricingPopupComponent } from './Contracts/view-contract/item-details-view/split-pricing-popup/split-pricing-popup.component';
import { ContractService } from './Contracts/contract-service/contract-service.service';


@NgModule({
  declarations: [
    ContractsComponent,
    CreateContractComponent,
    SideBarComponent,
    GeneralDetailsComponent,
    ItemDetailsComponent,
    DocumentUploadComponent,
    GenerateItemsPopupComponent,
    ItemsListComponent,
    ContractsHomeComponent,
    SecondaryCostPopupComponent,
    GeneralDetailsViewComponent,
    ViewContractComponent,
    ItemDetailsViewComponent,
    DocumentUploadViewComponent,
    PrintableContractViewComponent,
    ItemViewPopupComponent,
    PricingPopupComponent,
    CtrmHandlerComponent,
    QaulitySpecPopupComponent,
    ValuationDetailsComponent,
    SavePopupComponent,
    FormulaDetailsPopupComponent,
    ApproveContractPopupComponent,
    ApprovePopupComponent,
    ConfirmPopupComponent,
    RecommendationPopupComponent,
    ClickElseWhereDirective,
    Email,
    AddDeductionComponent,
    RINsComponent,
    SplitItem,
    SplitPricingPopupComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ContractsRoutingModule,
    HttpClientModule,
    NgbModule,
    FormulaListModule,
    FormulaFormModule,
    PricingModule,

    NgCircleProgressModule.forRoot({
      radius: 15,
      outerStrokeWidth: 2,
      innerStrokeWidth: 0,
      outerStrokeColor: '#2d7ebc',
      innerStrokeColor: '#C7E596',
      animation: true,
      animationDuration: 100,
      showTitle: false,
      showSubtitle: false,
      showUnits: false
    }),
    ReactiveFormsModule,
    EkaCommonModule,
    TableModule,
    MultiSelectModule,
    DropdownModule,

    FormsModule,
    MyDatePickerModule,
    NgxDatatableModule,
    ConfirmDialogModule,
    CheckboxModule,
    AccordionModule,
    TabViewModule
  ],
  exports:[
    ApproveContractPopupComponent
  ],
  providers: [ContractService, FormDataResolver, CreateDraftContract, ViewDataResolver, GeneralDetailsResolverService, ItemDetailsResolverService],
  bootstrap: [ContractsComponent]
})
export class ContractsModule { }
