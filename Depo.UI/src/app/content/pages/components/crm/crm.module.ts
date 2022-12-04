import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CronEditorComponent, CronEditorModule } from 'cron-editor';
import { PartialsModule } from '../../../partials/partials.module';
import { CompanyEditComponent } from './company/company-edit/company-edit.component';
import { CompanyListComponent } from './company/company-list/company-list.component';
import { CompanyService } from './company/company.service';
import { CrmComponent } from './crm.component';
import { GroupEditComponent } from './group/group-edit/group-edit.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupService } from './group/group.service';
import { MerchantContractEditComponent } from './merchant/merchant-contract-edit/merchant-contract-edit.component';
import { MerchantContractListComponent } from './merchant/merchant-contract-list/merchant-contract-list.component';
import { MerchantDetailComponent } from './merchant/merchant-detail/merchant-detail.component';
import { MerchantEditComponent } from './merchant/merchant-edit/merchant-edit.component';
import { MerchantInterviewEditComponent } from './merchant/merchant-interview-edit/merchant-interview-edit.component';
import { MerchantInterviewListComponent } from './merchant/merchant-interview-list/merchant-interview-list.component';
import { MerchantListComponent } from './merchant/merchant-list/merchant-list.component';
import { MerchantOfferEditComponent } from './merchant/merchant-offer-edit/merchant-offer-edit.component';
import { MerchantOfferListComponent } from './merchant/merchant-offer-list/merchant-offer-list.component';
import { MerchantPersonAddComponent } from './merchant/merchant-person-add/merchant-person-add.component';
import { MerchantPersonListComponent } from './merchant/merchant-person-list/merchant-person-list.component';
import { MerchantService } from './merchant/merchant.service';
import { FileUploadModule } from 'ng2-file-upload';

const routes: Routes = [
	{
		path: '',
		component: CrmComponent, 
		children: [
			{
				path: 'company',
				component: CompanyListComponent
			},
			{
				path: 'group',
				component: GroupListComponent
			},
			{
				path: 'merchant',
				component: MerchantListComponent
			},
		]
	}
];

@NgModule({
	imports: [
		PartialsModule,
		CronEditorModule,
		FileUploadModule,
		RouterModule.forChild(routes)
	],
	exports: [
		MerchantDetailComponent,
		MerchantPersonListComponent,
		MerchantPersonAddComponent,
		MerchantInterviewListComponent,
		MerchantContractListComponent,
		MerchantOfferListComponent
	],
	entryComponents: [
		CompanyEditComponent,
		GroupEditComponent,
		MerchantEditComponent,
		MerchantDetailComponent,
		MerchantPersonListComponent,
		MerchantPersonAddComponent,
		MerchantInterviewListComponent,
		MerchantInterviewEditComponent,
		MerchantContractListComponent,
		MerchantContractEditComponent,
		MerchantOfferListComponent,
		MerchantOfferEditComponent,
		CronEditorComponent,
	],
	providers: [
		CompanyService,
		GroupService,
		MerchantService
	],
	declarations: [
		CompanyListComponent,
		CrmComponent,
		CompanyEditComponent,
		GroupListComponent,
		GroupEditComponent,
		MerchantEditComponent,
		MerchantListComponent,
		MerchantDetailComponent,
		MerchantPersonListComponent,
		MerchantPersonAddComponent,
		MerchantInterviewListComponent,
		MerchantInterviewEditComponent,
		MerchantContractListComponent,
		MerchantContractEditComponent,
		MerchantOfferListComponent,
		MerchantOfferEditComponent,
	]
})
export class CrmModule { }
