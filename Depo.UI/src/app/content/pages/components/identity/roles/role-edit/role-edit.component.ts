import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../role.service';
import { RoleModel } from '../role.model';
import { SelectionModel } from '@angular/cdk/collections';
import { TodoItemFlatNode } from '../role-permission/role-permission.model';
import { MenuConfig } from '../../../../../../config/menu';
import { MenuConfigService } from '../../../../../../core/services/menu-config.service';

@Component({
	selector: 'role-edit',
	templateUrl: './role-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleEditComponent implements OnInit {
	model: RoleModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<RoleEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private roleService: RoleService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private menuConfigService: MenuConfigService) {
		dialogRef.disableClose = true;
	}

	menuItems;

	selectedPermissions: string[] = [];

	checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

	ngOnInit() {
		this.model = this.data.model;
		this.createForm();

		if(this.model.rolePermissions){
			this.selectedPermissions = this.model.rolePermissions.split(',');
		}

		this.menuConfigService.onMenuUpdated$.subscribe((config: MenuConfig) => {
			this.menuItems = config.config.aside.items;
			console.log(this.menuItems);
		});
	}

	createForm() {
		this.form = this.fb.group({
			roleName: [this.model.roleName]
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('IDENTITY.ROLE.EDIT') + ` '${this.model.roleName}'`
			return title;
		}

		return this.translate.instant('IDENTITY.ROLE.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): RoleModel {
		const controls = this.form.controls;
		const model = new RoleModel();
		model.id = this.model.id;
		model.roleName = controls['roleName'].value;
		model.rolePermissions = this.checklistSelection.selected.filter(x => x.data.code != null).map(x => x.data.code).join(',');
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

	updateModel(model: RoleModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.roleService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: RoleModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.roleService.create(model).subscribe(res => {
			this.handleResponse(res);
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
	}

	onAlertClose($event) {
		this.formErrorMsg = null;
	}
}
