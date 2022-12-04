import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, fromEvent, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LayoutUtilsService, MessageType } from '../../../../../../core/services/layout-utils.service';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { UserService } from '../user.service';
import { UserDataSource } from '../user.datasource';
import { UserModel } from '../user.model';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { UserRoleComponent } from '../user-role/user-role.component';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { XlsxService } from '../../../../../../core/services/xlsx-service';
import { AuthenticationService } from '../../../../../../core/auth/authentication.service';
import { TokenStorage } from '../../../../../../core/auth/token-storage.service';
import { UserHierarchyComponent } from '../user-hierarchy/user-hierarchy.component';
import { Router } from '@angular/router';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';

@Component({
	selector: 'user-list',
	templateUrl: './user-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
	constructor(
		private userService: UserService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private authService: AuthenticationService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router,
	) {

	}

	dataSource: UserDataSource;
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	filterStatus: any = -1;
	filterMerchant: number = 0;
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<UserModel>(true, []);

	result: UserModel[] = [];

	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if (!(user.permissions.indexOf('canReadUser') > -1)) {
				this.router.navigate(['/']);
			}

			this.displayedColumns = [
				'regionName',
				'name',
				'surname',
				'email',
				'phoneNumber',
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

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('userSearchInput');


		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration());
		this.dataSource = new UserDataSource(this.userService);
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
			Merchant: this.filterMerchant,
			Status: this.filterStatus != -1 ? this.filterStatus : null
		};

		return filter;
	}

	onCreate() {
		const newModel = new UserModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onDelete(model: UserModel) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.name;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.userService.delete(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	onEdit(model: UserModel) {
		const _messageType = model.id ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(UserEditComponent, { width: "500px", data: { model } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) { return; }
			this.loadDatatable();
		});
	}

	onSetRole(model: UserModel) {
		const dialogRef = this.dialog.open(UserRoleComponent, { width: "750px", data: { model } });
	}

	onSetHierarchy(model: UserModel) {
		const dialogRef = this.dialog.open(UserHierarchyComponent, { width: "750px", data: { model } });
	}

	onChangeStatus(model: UserModel) {
		this.userService.changeStatus(model.id).subscribe(() => {
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

		let filename = this.translate.instant('COMMON.EXCEL.USERS');

		this.userService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				Email: x.email,
				Name: x.name,
				Surname: x.surname,
				PhoneNumber: x.phoneNumber,
				RegionName: x.regionName
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}
}

