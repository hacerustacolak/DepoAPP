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
import { MerchantContract, MerchantOffer } from '../merchant.model';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { DatePipe } from '@angular/common';
import { MerchantOfferEditComponent } from '../merchant-offer-edit/merchant-offer-edit.component';

@Component({
	selector: 'merchant-offer-list',
	templateUrl: './merchant-offer-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers:[DatePipe]
})
export class MerchantOfferListComponent implements OnInit {
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
		private datepipe:DatePipe
	) {
	}

	dataSource: MerchantDataSource;
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	filterStatus: any = -1;
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<MerchantContract>(true, []);

	result: MerchantContract[] = [];
	allIds: number[] = [];
	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if (!(user.permissions.indexOf('canReadMerchant') > -1)) {
				this.router.navigate(['/']);
			}
			this.displayedColumns = [
				'createDate',
				'profitMultiplier',
				'fuelLiterFee',
				'userName',
				'modifiedDate',
				'status',
				'actions'
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

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('merchantOfferSearchInput');

		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration());
		this.dataSource = new MerchantDataSource(this.merchantService);
		// First load
		this.dataSource.loadOffer(queryParams);
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
		this.dataSource.loadOffer(queryParams);
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {
			SearchText: this.searchInput.nativeElement.value,
			MerchantId: this.data.id
		};
		return filter;
	}

	onCreate(){
		var model = new MerchantOffer();
		model.clear();
		model.merchantId = this.data.id;
		this.onEdit(model); 
	}

	onEdit(model:MerchantOffer)
	{
		const dialogRef = this.dialog.open(MerchantOfferEditComponent, { width: "800px", data: { model } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) { return; }
					this.loadDatatable();
				});
	}

	onDelete(model: MerchantOffer) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + this.datepipe.transform(model.createDate, 'yyyy-MM-dd');
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.merchantService.deleteOffer(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
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

		let filename = this.translate.instant('COMMON.EXCEL.MERCHANT_OFFER');

		this.merchantService.findOffer(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				CreateDate: this.datepipe.transform(x.createDate, 'yyyy-MM-dd HH:mm'),
				ModifiedDate: this.datepipe.transform(x.modifiedDate, 'yyyy-MM-dd HH:mm'),
				DriverCost : x.driverCost,
				ProjectManagerCost : x.projectManagerCost,
				ControlToolCost : x.controlToolCost,
				ControlToolCount : x.controlToolCount,
				FuelLiterFee : x.fuelLiterFee,
				FuelCommissionRate : x.fuelCommissionRate,
				LetterOfGuaranteeFee : x.letterOfGuaranteeFee,
				AnnualFinancingFee : x.annualFinancingFee,
				ProfitMultiplier : x.profitMultiplier,
				MidiRentalFee : x.midiRentalFee,
				MiniRentalFee : x.miniRentalFee,
				BusRentalFee : x.busRentalFee,
				CarRentalFee : x.carRentalFee,
				CustomerMaturity : x.customerMaturity,
				SubcontractorMaturity : x.subcontractorMaturity,
				FuelMaturity : x.fuelMaturity,
				Status : x.status,
				Description:x.description

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

