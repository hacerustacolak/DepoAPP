import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, fromEvent, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LayoutUtilsService, MessageType } from '../../../../../../../core/services/layout-utils.service';
import { AuthenticationService } from '../../../../../../../core/auth/authentication.service';
import { XlsxService } from '../../../../../../../core/services/xlsx-service';
import { TokenStorage } from '../../../../../../../core/auth/token-storage.service';
import { QueryParamsModel } from '../../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../../core/models/query-results.model';
import { VehicleCapacityService } from '../vehicleCapacity.service';
import { VehicleCapacityDataSource } from '../vehicleCapacity.datasource';
import { VehicleCapacityModel } from '../vehicleCapacity.model';
import { VehicleCapacityEditComponent } from '../vehicleCapacity-edit/vehicleCapacity-edit.component';

@Component({
	selector: 'vehicleCapacity-list',
	templateUrl: './vehicleCapacity-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleCapacityListComponent implements OnInit {
	constructor(
		private vehicleCapacityService: VehicleCapacityService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private authService: AuthenticationService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router,
	) {

	}

	dataSource: VehicleCapacityDataSource;
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<VehicleCapacityModel>(true, []);

	result: VehicleCapacityModel[] = [];

	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if (!(user.permissions.indexOf('canReadVehicleCapacity') > -1)) {
				this.router.navigate(['/']);
			}

			this.displayedColumns = [
				'capacityName',
				'typeName',
				'description',
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

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('vehicleCapacitySearchInput');


		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration());
		this.dataSource = new VehicleCapacityDataSource(this.vehicleCapacityService);
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
		const newModel = new VehicleCapacityModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onDelete(model: VehicleCapacityModel) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.capacityName;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.vehicleCapacityService.delete(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	onEdit(model: VehicleCapacityModel) {
		const _messageType = model.id ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(VehicleCapacityEditComponent, { width: "500px", data: { model } });
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

		let filename = this.translate.instant('COMMON.EXCEL.VEHICLE_CAPACITY');

		this.vehicleCapacityService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				CapacityName: x.capacityName,
				TypeName: x.vehicleTypeName,
				Description: x.description,
				ModifiedDate: x.modifiedDate,
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}
}

