import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupModel } from '../group.model';
import { GroupService } from '../group.service';

@Component({
	selector: 'group-edit',
	templateUrl: './group-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupEditComponent implements OnInit {
	model: GroupModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<GroupEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private groupService: GroupService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			name: [this.model.name],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('CRM.GROUP.EDIT') + ` '${this.model.name}'`
			return title;
		}

		return this.translate.instant('CRM.GROUP.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): GroupModel {
		const controls = this.form.controls;
		const model = new GroupModel();
		model.id = this.model.id;
		model.name = controls['name'].value;
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

	updateModel(model: GroupModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.groupService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: GroupModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.groupService.create(model).subscribe(res => {
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
