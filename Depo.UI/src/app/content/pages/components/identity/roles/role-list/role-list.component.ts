import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, fromEvent, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RoleService } from '../role.service';
import { RoleDataSource } from '../role.datasource';
import { RoleModel } from '../role.model';
import { RoleEditComponent } from '../role-edit/role-edit.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../../../core/auth/authentication.service';
import { TokenStorage } from '../../../../../../core/auth/token-storage.service';
import { XlsxService } from '../../../../../../core/services/xlsx-service';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { LayoutUtilsService, MessageType } from '../../../../../../core/services/layout-utils.service';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';

@Component({
	selector: 'role-list',
	templateUrl: './role-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleListComponent implements OnInit {
	constructor(
		private roleService: RoleService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router,
		private authService: AuthenticationService,
	) {

	}

	dataSource: RoleDataSource;
	displayedColumns = ['roleName', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;

	// Selection
	selection = new SelectionModel<RoleModel>(true, []);

	result: RoleModel[] = [];

	ngOnInit() {		
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDatatable();
				})
			)
			.subscribe();

		this.searchInput.nativeElement.value = this.tokenStorage.getItemLocalStorage('roleSearchInput');		

		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration(false));
		this.dataSource = new RoleDataSource(this.roleService);
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
			this.filterConfiguration(true),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams);
		this.selection.clear();
	}

	filterConfiguration(isGeneralSearch: boolean = true): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.SearchText = searchText;
		if (!isGeneralSearch) {
			return filter;
		}

		return filter;
	}

	onCreate() {
		const newModel = new RoleModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onDelete(model: RoleModel) {
		const _title: string = this.translate.instant('COMMON.DELETE.TITLE') + " " + model.roleName;
		const _description: string = this.translate.instant('COMMON.DELETE.DESC');
		const _waitDescription: string = this.translate.instant('COMMON.DELETE.WAIT_DESC');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDescription);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.roleService.delete(model.id).subscribe(() => {
				dialogRef.close();
				this.loadDatatable();
			});
		});
	}

	onEdit(model: RoleModel) {
		const _messageType = model.id ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(RoleEditComponent, { width: "500px", data: { model } });
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

		let filename = this.translate.instant('COMMON.EXCEL.ROLES');

		this.roleService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			if(data.isSuccess)
			{
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				RoleName: x.roleName
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		}
		});
	}
}

