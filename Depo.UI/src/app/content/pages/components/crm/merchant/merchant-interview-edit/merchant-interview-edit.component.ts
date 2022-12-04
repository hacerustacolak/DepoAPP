import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MerchantInterview, MerchantModel } from '../merchant.model';
import { MerchantService } from '../merchant.service';

@Component({
	selector: 'merchant-interview-edit',
	templateUrl: './merchant-interview-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe] 
})
export class MerchantInterviewEditComponent implements OnInit {
	model: MerchantInterview;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	interviewTypeSubject: BehaviorSubject<number>;
	contactPersonSubject:BehaviorSubject<number>;
	merchantSubject:BehaviorSubject<number>;
	interviewTimer: string = '00:00';
	interviewDate:Date;
	// regionSubject: BehaviorSubject<number>;

	constructor(public dialogRef: MatDialogRef<MerchantInterviewEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private merchantService: MerchantService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		public datepipe: DatePipe) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.interviewTypeSubject = new BehaviorSubject<number>(this.model.interviewTypeId);
		this.contactPersonSubject = new BehaviorSubject<number>(this.model.merchantContactId);
		this.merchantSubject = new BehaviorSubject<number>(this.model.merchantId);
		this.interviewTimer = this.datepipe.transform(this.model.interviewDate, 'HH:mm');
		this.interviewDate = new Date(this.datepipe.transform(this.model.interviewDate, 'yyyy-MM-dd'));
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			name: [this.model.name],
			interviewType: [this.model.interviewTypeId],
			description: [this.model.description],
			title: [this.model.title],
			interviewDater: [this.model.interviewDate],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('CRM.MERCHANT.INTERVIEW.EDIT') + ` '${this.model.title}'`
			return title;
		}

		return this.translate.instant('CRM.MERCHANT.INTERVIEW.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): MerchantInterview {
		const controls = this.form.controls;
		const model = new MerchantInterview();
		model.id = this.model.id;
		model.title = controls['title'].value;
		model.interviewTypeId = this.interviewTypeSubject.value;
		model.description = controls['description'].value;
		                           
		let partials = this.interviewTimer.split(':');
		this.interviewDate.setHours(parseInt(partials[0]),parseInt(partials[1]));
		this.interviewDate.setHours(this.interviewDate.getHours() - this.interviewDate.getTimezoneOffset() / 60);
		model.interviewDate = this.interviewDate;
		model.merchantId = this.model.merchantId;
		model.merchantContactId = this.contactPersonSubject.value;
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

	updateModel(model: MerchantInterview) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.updateInterview(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: MerchantInterview) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.createInterview(model).subscribe(res => {
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
