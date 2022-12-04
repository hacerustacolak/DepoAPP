import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '../../../../../../core/services/layout-utils.service';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { XlsxService } from '../../../../../../core/services/xlsx-service';
import { TokenStorage } from '../../../../../../core/auth/token-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HierarchyModel } from '../hierarchy.model';
import { HierarchyService } from '../hierarchy.service';
import { Router } from '@angular/router';


@Component({
	selector: 'hierarchy-edit',
	templateUrl: './hierarchy-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HierarchyEditComponent implements OnInit {
	constructor(public dialogRef: MatDialogRef<HierarchyEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private hierarchyService: HierarchyService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private xlsxService: XlsxService,
		private tokenStorage: TokenStorage,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private router: Router
	) {

	}

	model: HierarchyModel = new HierarchyModel();
	result: HierarchyModel[] = [];

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	ngOnInit() {
		this.model = this.data.model;
		this.createForm();
	}


	createForm() {
		this.form = this.fb.group({
			title: [this.model.title]
		});
	}

	getTitle(): string {
		return this.translate.instant('IDENTITY.HIERARCHY.CREATE');
	}

	createModel(model: HierarchyModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.hierarchyService.create(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	updateModel(model: HierarchyModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.hierarchyService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	prepareModel(): HierarchyModel {
		const controls = this.form.controls;
		const model = new HierarchyModel();
		model.id = this.model.id;
		model.parentId = this.model.parentId;
		model.title = controls['title'].value;
		return model;
	}

	onSubmit() {
		this.formErrorMsg = null;
		this.loadingAfterSubmit = false;
		const controls = this.form.controls;

		if (this.form.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.formErrorMsg = this.translate.instant("COMMON.FORM_ERROR_MSG");
			return;
		}

		const editedModel = this.prepareModel();
		if (editedModel.id) {
			this.updateModel(editedModel);
		} else {
			this.createModel(editedModel);
		}		
	}

	reloadCurrentRoute() {
		let currentUrl = this.router.url;
		this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
			this.router.navigate([currentUrl]);
		});
	}

	private handleResponse(res: any) {
		this.viewLoading = false;
		if (!res.isSuccess && res.type === 'FORM') {
			this.formErrorMsg = res.message;
		}
		else {
			this.dialogRef.close(res);
		}
		this.cdr.detectChanges();
		this.reloadCurrentRoute();
	}

	onAlertClose($event) {
		this.formErrorMsg = null;
	}
}

