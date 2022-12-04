import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CompanyModel } from '../company.model';
import { CompanyService } from '../company.service';

@Component({
	selector: 'company-edit',
	templateUrl: './company-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyEditComponent implements OnInit {
	model: CompanyModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	groupSubject: BehaviorSubject<number>;

	constructor(public dialogRef: MatDialogRef<CompanyEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private companyService: CompanyService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.groupSubject = new BehaviorSubject<number>(this.model.groupId);		
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			name: [this.model.name],
			description: [this.model.description],
			groupSubject: [this.model.groupId]
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('CRM.COMPANY.EDIT') + ` '${this.model.name}'`
			return title;
		}

		return this.translate.instant('CRM.COMPANY.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): CompanyModel {
		const controls = this.form.controls;
		const model = new CompanyModel();
		model.id = this.model.id;
		model.name = controls['name'].value;
		model.groupId = this.groupSubject.value;
		model.description = controls['description'].value;
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

	updateModel(model: CompanyModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.companyService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: CompanyModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.companyService.create(model).subscribe(res => {
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
