import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, BehaviorSubject } from 'rxjs';
import { tap} from 'rxjs/operators';
import { Router } from '@angular/router';
import { LayoutUtilsService, MessageType } from '../../../../../../../core/services/layout-utils.service';
import { AuthenticationService } from '../../../../../../../core/auth/authentication.service';
import { XlsxService } from '../../../../../../../core/services/xlsx-service';
import { TokenStorage } from '../../../../../../../core/auth/token-storage.service';
import { VehicleBrandService } from '../vehicleBrand.service';
import { VehicleBrandDataSource } from '../vehicleBrand.datasource';
import { VehicleBrandModel } from '../vehicleBrand.model';
import { QueryParamsModel } from '../../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../../core/models/query-results.model';
import { VehicleBrandEditComponent } from '../vehicleBrand-edit/vehicleBrand-edit.component';
import { ShowVehicleBrandLogoComponent } from '../showVehicleBrandLogo/showVehicleBrandLogo.component';


@Component({
	selector: 'vehicleBrand-list',
	templateUrl: './vehicleBrand-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleBrandListComponent implements OnInit {
	constructor(
		private vehicleBrandService: VehicleBrandService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private authService: AuthenticationService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router
	) {

	}

	dataSource: VehicleBrandDataSource;
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<VehicleBrandModel>(true, []);

	result: VehicleBrandModel[] = [];

	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if (!(user.permissions.indexOf('canReadVehicleBrand') > -1)) {
				this.router.navigate(['/']);
			}

			this.displayedColumns = [
				'brandName',
				'description',
				'logo',
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

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('vehicleBrandSearchInput');


		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration());
		this.dataSource = new VehicleBrandDataSource(this.vehicleBrandService);
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
		const newModel = new VehicleBrandModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onDelete(model: VehicleBrandModel) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.brandName;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.vehicleBrandService.delete(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	onEdit(model: VehicleBrandModel) {
		const _messageType = model.id ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(VehicleBrandEditComponent, { width: "500px", data: { model } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) { return; }
			this.loadDatatable();
		});
	}

	onSearch() {
		this.paginator.pageIndex = 0;
		this.loadDatatable();
	}

	
	getImage(filePath: string) {
		const dialogRef = this.dialog.open(ShowVehicleBrandLogoComponent, { width: "500px", data: { filePath } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) { return; }
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

		let filename = this.translate.instant('COMMON.EXCEL.VEHICLE_BRAND');

		this.vehicleBrandService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				BrandName: x.brandName,
				Description: x.description,
				ModifiedDate: x.modifiedDate,
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}
}

