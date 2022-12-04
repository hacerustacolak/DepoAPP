import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LayoutUtilsService, MessageType } from '../../../../../../../core/services/layout-utils.service';
import { AuthenticationService } from '../../../../../../../core/auth/authentication.service';
import { XlsxService } from '../../../../../../../core/services/xlsx-service';
import { TokenStorage } from '../../../../../../../core/auth/token-storage.service';
import { QueryParamsModel } from '../../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../../core/models/query-results.model';
import { VehicleDataSource } from '../vehicle.datasource';
import { VehicleModel } from '../vehicle.model';
import { VehicleEditComponent } from '../vehicle-edit/vehicle-edit.component';
import { VehicleService } from '../vehicle.service';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
	selector: 'vehicle-list',
	templateUrl: './vehicle-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleListComponent implements OnInit {
	constructor(
		private vehicleService: VehicleService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private authService: AuthenticationService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router
	) {

	}

	dataSource: VehicleDataSource;
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<VehicleModel>(true, []);

	result: VehicleModel[] = [];

	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if (!(user.permissions.indexOf('canReadVehicle') > -1)) {
				this.router.navigate(['/']);
			}

			this.displayedColumns = [
				'vehiclePlate',
				'scVehicleTypeName',
				'vehicleModelName',
				'vehicleCapacityName',
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
		this.dataSource = new VehicleDataSource(this.vehicleService);
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
		const newModel = new VehicleModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onDelete(model: VehicleModel) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.vehiclePlate;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.vehicleService.delete(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	onEdit(model: VehicleModel) {
		this.viewLoading = true;
		this.loadingAfterSubmit = true;

		this.vehicleService.getImagesById(model.id).subscribe(img => {
			if (model.vehiclePhotoList && model.vehiclePhotoList.length > 0) {
				for (var i = 0; i < model.vehiclePhotoList.length; i++) {
					if (img.data && img.data.images && img.data.images.length > 0) {
						let bs64 = img.data.images.filter(opt => opt.filePath == model.vehiclePhotoList[i].filePath);
						if (bs64 && bs64.length > 0) {
							model.vehiclePhotoList[i].fileBase64 = 'data:image/jpg;base64,' + bs64[0].fileBase64;
						}
					}
				}
			}

			if (model.vehicleLisenceList) {
				if (img.data && img.data.images && img.data.images.length > 0) {
					let bs64 = img.data.images.filter(opt => opt.filePath == model.vehicleLisenceList.filePath);
					if (bs64 && bs64.length > 0) {
						model.vehiclePhotoList[i].fileBase64 = 'data:image/jpg;base64,' + bs64[0].fileBase64;
					}
				}
			}

			this.viewLoading = false;
			this.loadingAfterSubmit = false;
			const _messageType = model.id ? MessageType.Update : MessageType.Create;
			const dialogRef = this.dialog.open(VehicleEditComponent, { width: "800px", data: { model } });
			dialogRef.afterClosed().subscribe(res => {
				if (!res) { return; }
				this.loadDatatable();
			});
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

		let filename = this.translate.instant('COMMON.EXCEL.VEHICLE_SELF');

		this.vehicleService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				Plate: x.vehiclePlate,
				VehicleType: x.scVehicleTypeName,
				BrandModel: x.vehicleModelName,
				Capacity: x.vehicleCapacityName,
				Rental: x.vehicleRental,
				TrackingDeviceNo: x.vehicleTrackingDeviceNo,
				ModelYear: x.vehicleModelYear,
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}
}

