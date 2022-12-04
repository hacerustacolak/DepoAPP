import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, fromEvent, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LayoutUtilsService, MessageType } from '../../../../../../core/services/layout-utils.service';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { HierarchyService } from '../hierarchy.service';
import { HierarchyDataSource } from '../hierarchy.datasource';
import { HierarchyModel } from '../hierarchy.model';
import { HierarchyEditComponent } from '../hierarchy-edit/hierarchy-edit.component';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { XlsxService } from '../../../../../../core/services/xlsx-service';
import { TokenStorage } from '../../../../../../core/auth/token-storage.service';
import { AuthenticationService } from '../../../../../../core/auth/authentication.service';
import { Router } from '@angular/router';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';

@Component({
	selector: 'hierarchy-list',
	templateUrl: './hierarchy-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HierarchyListComponent implements OnInit {
	constructor(
		private hierarchyService: HierarchyService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private router: Router,
		private authService: AuthenticationService
	) {

	}


	ngOnInit() {
		this.authService.getCurrentUser().subscribe((user) => {
			if(!(user.permissions.indexOf('canReadHierarchy') > -1)){
				this.router.navigate(['/']);
			}
		});
	}

 
	onCreate() {
		const newModel = new HierarchyModel();
		newModel.clear();
		this.onEdit(newModel);
	}

	onEdit(model: HierarchyModel) {
		const _messageType = model.id ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(HierarchyEditComponent, { width: "500px", data: { model } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) { return; }
		});
	}

	viewExcelLoading = new BehaviorSubject<boolean>(false);
	onExportToExcel() {
		this.viewExcelLoading.next(true);

		const queryParams = new QueryParamsModel(null, 'asc', '', 0, 100000);

		let filename = this.translate.instant('COMMON.EXCEL.HIERARCHIES');

		this.hierarchyService.find(queryParams).subscribe((data: ApiResponseModel<QueryResultsModel>) => {
			this.xlsxService.downloadExcel(filename, data.data.items.map(x => ({
				Title: x.title
			}))).subscribe(() => {
				this.viewExcelLoading.next(false);
			});
		});
	}
}

