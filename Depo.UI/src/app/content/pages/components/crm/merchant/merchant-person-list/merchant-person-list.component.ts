import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, fromEvent, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LayoutUtilsService } from '../../../../../../core/services/layout-utils.service';
import { AuthenticationService } from '../../../../../../core/auth/authentication.service';
import { XlsxService } from '../../../../../../core/services/xlsx-service';
import { TokenStorage } from '../../../../../../core/auth/token-storage.service';
import { MerchantService } from '../merchant.service';
import { MerchantDataSource } from '../merchant.datasource';
import { MerchantPerson } from '../merchant.model';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { MerchantPersonAddComponent } from '../merchant-person-add/merchant-person-add.component';

@Component({
	selector: 'merchant-person-list',
	templateUrl: './merchant-person-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantPersonListComponent implements OnInit {
	constructor(
		private merchantService: MerchantService,
		private translate: TranslateService,
		private dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any,
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
	filterStatus: any = -1;
	filterMerchant: number = 0;
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<MerchantPerson>(true, []);

	result: MerchantPerson[] = [];
	ngOnInit() {

		this.displayedColumns = [
			'name',
			'email',
			'phoneNumber',
			'title',
			'actions'
		];

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDatatable();
				})
			)
			.subscribe();

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('merchantPersonSearchInput');


		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration());
		this.dataSource = new MerchantDataSource(this.merchantService);
		// First load
		this.dataSource.loadContact(this.data.id,queryParams);
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
		this.dataSource.loadContact(this.data.id,queryParams);
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {
			SearchText: this.searchInput.nativeElement.value,
			Merchant: this.filterMerchant,
		};

		return filter;
	}

	onCreate(){

		var data = new MerchantPerson();
		data.merchantId = this.data.id;
		this.openEditOrCreate(data);		
	}

	onEdit(model:MerchantPerson){
		this.openEditOrCreate(model)		
	}

	onDelete(model){
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.contactPerson;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.merchantService.deletePerson(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	openEditOrCreate(data : MerchantPerson){
		const dialogRef = this.dialog.open(MerchantPersonAddComponent, { width: "1200px", data: { data } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
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

		let filename = this.translate.instant('COMMON.EXCEL.MERCHANT_CONTACT');

		this.merchantService.findContact(queryParams,this.data.id).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				ContactName: x.contactPerson,
				Email: x.contactEmail,
				PhoneNumber: x.contactPhone,
				Title: x.contactTitle,
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}

	onSearch() {
		this.paginator.pageIndex = 0;
		this.loadDatatable();
	}
}

