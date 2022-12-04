import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, fromEvent, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LayoutUtilsService, MessageType } from '../../../../../../core/services/layout-utils.service';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { XlsxService } from '../../../../../../core/services/xlsx-service';
import { AuthenticationService } from '../../../../../../core/auth/authentication.service';
import { TokenStorage } from '../../../../../../core/auth/token-storage.service';
import { Router } from '@angular/router';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';
import { MerchantService } from '../merchant.service';
import { MerchantDataSource } from '../merchant.datasource';
import { MerchantModel } from '../merchant.model';
import { CompanyEditComponent } from '../../company/company-edit/company-edit.component';
import { MerchantEditComponent } from '../merchant-edit/merchant-edit.component';
import { MerchantDetailComponent } from '../merchant-detail/merchant-detail.component';
import { MerchantPersonListComponent } from '../merchant-person-list/merchant-person-list.component';
import { MerchantInterviewListComponent } from '../merchant-interview-list/merchant-interview-list.component';
import { MerchantContractListComponent } from '../merchant-contract-list/merchant-contract-list.component';
import { MerchantOfferListComponent } from '../merchant-offer-list/merchant-offer-list.component';

@Component({
	selector: 'merchant-list',
	templateUrl: './merchant-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantListComponent implements OnInit {
	constructor(
		private merchantService: MerchantService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private authService: AuthenticationService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router,
	) {

	}

	dataSource: MerchantDataSource;
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<MerchantModel>(true, []);

	result: MerchantModel[] = [];

	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if (!(user.permissions.indexOf('canReadMerchant') > -1)) {
				this.router.navigate(['/']);
			}

			this.displayedColumns = [
				'merchantName',
				'aliasName',
				'phone',
				'city',
				'createDate',
				'representive',
				'logoCode',
				'actions',
			];

		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDatatable();
				})
			)
			.subscribe();

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('merchantSearchInput');


		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration());
		this.dataSource = new MerchantDataSource(this.merchantService);
		// First load
		this.dataSource.load(queryParams);
		this.dataSource.entitySubject.subscribe(res => (this.result = res));
	}

	masterToggle() {
		if (this.selection.selected.length === this.result.length) {
			this.selection.clear();
		} else {
			this.result.forEach(row => this.selection.select(row));
		}
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.result.length;
		return numSelected === numRows;
	}

	loadDatatable() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams);
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {
			SearchText: this.searchInput.nativeElement.value,
		};

		return filter;
	}

	onCreate() {
		const newModel = new MerchantModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onDelete(model: MerchantModel) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.merchantName;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.merchantService.delete(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	onEdit(model: MerchantModel) {
		const _messageType = model.id ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(MerchantEditComponent, { width: "500px", data: { model } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) { return; }
			this.loadDatatable();
		});
	}

	onAddDetail(id: number) {
			this.merchantService.getDetailById(id).subscribe(model => {
				const merchantDetailComponent = model.data;
				const dialogRef = this.dialog.open(MerchantDetailComponent, { width: "700px", data: { merchantDetailComponent } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
			});
	}

	onContactPanel(id:any)
	{
		const dialogRef = this.dialog.open(MerchantPersonListComponent, { width: "1200px", data: { id } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
			
	}
	onInterviewPanel(id:any)
	{
		const dialogRef = this.dialog.open(MerchantInterviewListComponent, { width: "1000px", data: { id } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
	}
	onContractPanel(id:number)
	{
		const dialogRef = this.dialog.open(MerchantContractListComponent, { width: "1000px", data: { id } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
	}

	onOfferPanel(id:number)
	{
		const dialogRef = this.dialog.open(MerchantOfferListComponent, { width: "1000px", data: { id } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
	}

	onSearch() {
		this.paginator.pageIndex = 0;
		this.loadDatatable();
	}

	viewExcelLoading = new BehaviorSubject<boolean>(false);
	onExportToExcel() {
		this.viewExcelLoading.next(true);

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			0, this.dataSource.paginatorTotalSubject.value
		);

		let filename = this.translate.instant('COMMON.EXCEL.MERCHANT');

		this.merchantService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				Name: x.name,
				CompanyName: x.companyName,
				RegionName: x.regionName,
				ContactPhone: x.contactPhone,
				ContactMail: x.contactEmail,
				ContactPerson: x.contactPerson,
				Latitude: x.latitude,
				Longitude: x.longitude,
				Address: x.address,
				WebSiteUrl: x.webSiteUrl,
				Description: x.description,
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}
}

