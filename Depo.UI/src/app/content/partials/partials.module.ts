import { WarehouseListComponent } from './../pages/components/definitions/warehouse/warehouse-list/warehouse-list.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../../core/core.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
	MatInputModule,
	MatSortModule,
	MatProgressSpinnerModule,
	MatTableModule,
	MatPaginatorModule,
	MatSelectModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatIconModule,
	MatTooltipModule,
	MatDialogModule,
	MatExpansionModule,
	MatCardModule,
	MatListModule,
	MatMenuModule,
	MatAutocompleteModule,
	MatRadioModule,
	MatNativeDateModule,
	MatDatepickerModule,
	MatSnackBarModule,
	MatTabsModule,
	MatGridListModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatTreeModule,
	MatPaginatorIntl,
	MatSidenavModule,
	MatSlideToggleModule,
	MatChipsModule
} from '@angular/material';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AlertComponent } from './components/alert/alert.component';
import { ActionNotificationComponent } from './components/action-notification/action-notification.component';
import { DeleteEntityDialogComponent } from './components/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from './components/fetch-entity-dialog/fetch-entity-dialog.component';
import { QuickSidebarComponent } from './components/quick-sidebar/quick-sidebar.component';
import { ScrollTopComponent } from './components/scroll-top/scroll-top.component';
import { PortletModule } from './modules/portlet/portlet.module';
import { SpinnerButtonModule } from './modules/spinner-button/spinner-button.module';
import { MessengerModule } from './components/quick-sidebar/messenger/messenger.module';
import { HttpUtilsService } from '../../core/services/http-utils.service';
import { TypesUtilsService } from '../../core/services/types-utils.service';
import { LayoutUtilsService } from '../../core/services/layout-utils.service';
import { InterceptService } from '../../core/services/intercept.service';
import { NoticeComponent } from './components/notice/notice.component';
import { ChartsModule } from 'ng2-charts';
import { MatPaginatorIntlService } from '../../core/services/mat-paginator-intl.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CronEditorComponent } from './components/cron-editor/cron-editor.component';
import { CronEditorModule } from 'cron-editor';
import { AgmCoreModule } from '@agm/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CityAutocompleteComponent } from './components/autocomplete/city-autocomplete/city-autocomplete.component';
import { GroupAutocompleteComponent } from './components/autocomplete/group-autocomplete/group-autocomplete.component';
import { CompanyAutocompleteComponent } from './components/autocomplete/company-autocomplete/company-autocomplete.component';
import { RegionAutocompleteComponent } from './components/autocomplete/region-autocomplete/region-autocomplete.component';
import { DailyPeriodAutocompleteComponent } from './components/autocomplete/daily-period-autocomplete/daily-period-autocomplete.component';
import { InterviewTypeAutocompleteComponent } from './components/autocomplete/interview-type-autocomplete/interview-type-autocomplete.component';
import { VehicleBrandAutocompleteComponent } from './components/autocomplete/vehicle-brand-autocomplete/vehicle-brand-autocomplete.component';
import { VehicleTypeAutocompleteComponent } from './components/autocomplete/vehicle-type-autocomplete/vehicle-type-autocomplete.component';
import { VehicleCapacityAutocompleteComponent } from './components/autocomplete/vehicle-capacity-autocomplete/vehicle-capacity-autocomplete.component';
import { CompetitorAutocompleteComponent } from './components/autocomplete/competitor-autocomplete/competitor-autocomplete.component';
import { CustomerRepresentativeAutocompleteComponent } from './components/autocomplete/customer-representative-autocomplete/customer-representative-autocomplete.component';
import { MultiUserAutocompleteComponent } from './components/autocomplete/multi-user-autocomplete/multi-user-autocomplete.component';
import { MerchantContactAutocompleteComponent } from './components/autocomplete/merchant-contact-autocomplete/merchant-contact-autocomplete.component';
import { MerchantOfferStatusAutocompleteComponent } from './components/autocomplete/merchant-offer-status-autocomplete/merchant-offer-status-autocomplete.component';
import { MerchantOfferFileTypeAutocompleteComponent } from './components/autocomplete/merchant-offer-file-type-autocomplete/merchant-offer-file-type-autocomplete.component';
import { SCVehicleTypeAutocompleteComponent } from './components/autocomplete/sc-vehicle-type-autocomplete/sc-vehicle-type-autocomplete.component';
import { VehicleTrackingDeviceCompanyAutocompleteComponent } from './components/autocomplete/vehicle-tracking-device-company-autocomplete/vehicle-tracking-device-company-autocomplete.component';
import { VehicleModelAutocompleteComponent } from './components/autocomplete/vehicle-model-autocomplete/vehicle-model-autocomplete.component';
import { VehicleYearAutocompleteComponent } from './components/autocomplete/vehicle-year-autocomplete/vehicle-year-autocomplete.component';


@NgModule({
	declarations: [
		QuickSidebarComponent,
		ScrollTopComponent,
		AlertComponent,
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		NoticeComponent,
		CronEditorComponent,
		CityAutocompleteComponent,
		GroupAutocompleteComponent,
		CompanyAutocompleteComponent,
		RegionAutocompleteComponent,
		DailyPeriodAutocompleteComponent,
		InterviewTypeAutocompleteComponent,
		VehicleBrandAutocompleteComponent,
		VehicleTypeAutocompleteComponent,
		VehicleCapacityAutocompleteComponent,
		CompetitorAutocompleteComponent,
		CustomerRepresentativeAutocompleteComponent,
		MultiUserAutocompleteComponent,
		MerchantContactAutocompleteComponent,
		MerchantOfferStatusAutocompleteComponent,
		MerchantOfferFileTypeAutocompleteComponent,
		SCVehicleTypeAutocompleteComponent,
		VehicleTrackingDeviceCompanyAutocompleteComponent,
		VehicleModelAutocompleteComponent,
		VehicleYearAutocompleteComponent
	],
	entryComponents: [
		DeleteEntityDialogComponent
	],
	providers: [
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'm-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		{
			provide: MatPaginatorIntl,
			useFactory: (translate) => {
				const service = new MatPaginatorIntlService(translate);
				return service;
			},
			deps: [TranslateService]
		},
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService,
	],
	exports: [
		CronEditorComponent,
		MatTreeModule,
		QuickSidebarComponent,
		ScrollTopComponent,
		PortletModule,
		PerfectScrollbarModule,
		SpinnerButtonModule,
		AlertComponent,
		CoreModule,
		PortletModule,
		CommonModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		LayoutModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatPaginatorModule,
		MatExpansionModule,
		MatCardModule,
		MatListModule,
		MatDialogModule,
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		MatGridListModule,
		NgxMatSelectSearchModule,
		TranslateModule,
		NoticeComponent,
		ChartsModule,
		MatSidenavModule,
		MatSlideToggleModule,
		NgxMaterialTimepickerModule,
		AgmCoreModule,
		MatChipsModule,
		NgxPermissionsModule,
		CityAutocompleteComponent,
		GroupAutocompleteComponent,
		CompanyAutocompleteComponent,
		RegionAutocompleteComponent,
		DailyPeriodAutocompleteComponent,
		InterviewTypeAutocompleteComponent,
		VehicleBrandAutocompleteComponent,
		VehicleTypeAutocompleteComponent,
		VehicleCapacityAutocompleteComponent,
		CompetitorAutocompleteComponent,
		CustomerRepresentativeAutocompleteComponent,
		MultiUserAutocompleteComponent,
		MerchantContactAutocompleteComponent,
		MerchantOfferStatusAutocompleteComponent,
		MerchantOfferFileTypeAutocompleteComponent,
		SCVehicleTypeAutocompleteComponent,
		VehicleTrackingDeviceCompanyAutocompleteComponent,
		VehicleModelAutocompleteComponent,
		VehicleYearAutocompleteComponent
	],
	imports: [
		MatChipsModule,
		CronEditorModule,
		MatTreeModule,
		CommonModule,
		RouterModule,
		NgbModule,
		PerfectScrollbarModule,
		MessengerModule,
		FormsModule,
		ReactiveFormsModule,
		CoreModule,
		PortletModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		LayoutModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatPaginatorModule,
		MatExpansionModule,
		MatCardModule,
		MatListModule,
		MatDialogModule,
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		MatGridListModule,
		NgxMatSelectSearchModule,
		ChartsModule,
		MatSidenavModule,
		MatSlideToggleModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyBuHYU_NRbZrtjz69GfU4yIZKC0imhsnI4'
		}),
		NgxMaterialTimepickerModule.forRoot(),
		TranslateModule.forChild(),
		NgxPermissionsModule.forChild()
	]
})
export class PartialsModule { }
