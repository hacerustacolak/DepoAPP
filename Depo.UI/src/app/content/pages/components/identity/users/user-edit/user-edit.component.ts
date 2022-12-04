import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from '../user.model';
import { UserService } from '../user.service';

@Component({
	selector: 'user-edit',
	templateUrl: './user-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditComponent implements OnInit {
	model: UserModel;
	regionSubject: BehaviorSubject<number>;
	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<UserEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private userService: UserService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.regionSubject = new BehaviorSubject<number>(this.model.regionId);		
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			name: [this.model.name],
			surname: [this.model.surname],
			password: [this.model.password],
			email: [this.model.email],
			phoneNumber: [this.model.phoneNumber],
			regionSubject: [this.model.regionId],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('IDENTITY.USER.EDIT') + ` '${this.model.name}'`
			return title;
		}

		return this.translate.instant('IDENTITY.USER.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): UserModel {
		const controls = this.form.controls;
		const model = new UserModel();
		model.id = this.model.id;
		model.name = controls['name'].value;
		model.surname = controls['surname'].value;
		model.password = controls['password'].value;
		model.email = controls['email'].value;
		model.phoneNumber = controls['phoneNumber'].value;
		model.passwordHash = this.model.passwordHash;
		model.regionId = this.regionSubject.value;
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

	updateModel(model: UserModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.userService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: UserModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.userService.create(model).subscribe(res => {
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
