import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MerchantModel } from '../merchant.model';
import { MerchantService } from '../merchant.service';

@Component({
	selector: 'merchant-edit',
	templateUrl: './merchant-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantEditComponent implements OnInit {
	model: MerchantModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	companySubject: BehaviorSubject<number>;
	regionSubject: BehaviorSubject<number>;
	citySubject: BehaviorSubject<number>;
	warehouseSubject: BehaviorSubject<number>;
	warehouseSubject2: BehaviorSubject<number>;

	constructor(public dialogRef: MatDialogRef<MerchantEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private merchantService: MerchantService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.citySubject = new BehaviorSubject<number>(this.model.city);
		this.warehouseSubject = new BehaviorSubject<number>(this.model.depo1Id);
		this.warehouseSubject2 = new BehaviorSubject<number>(this.model.depo2Id);
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			merchantName: [this.model.merchantName],
			aliasName: [this.model.aliasName],
			city: [this.model.city],
			// representive: [this.model.representive],
			phone: [this.model.phone],
			logoCode: [this.model.logoCode],
			warehouse1: [this.model.depo1Id],
			warehouse2: [this.model.depo2Id], 
			citySubject: [this.citySubject.value],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('CRM.MERCHANT.EDIT') + ` '${this.model.merchantName}'`
			return title;
		}

		return this.translate.instant('CRM.MERCHANT.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): MerchantModel {
		const controls = this.form.controls;
		const model = new MerchantModel();
		model.id = this.model.id;
		model.merchantName = controls['merchantName'].value;
		// model.representive = controls['representive'].value;
		model.aliasName = controls['aliasName'].value;
		model.phone = controls['phone'].value;
		model.logoCode = controls['logoCode'].value;
		model.depo1Id = this.warehouseSubject.value;
		model.depo2Id = this.warehouseSubject2.value;
		model.city = this.citySubject.value;

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

	updateModel(model: MerchantModel) {
		debugger;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: MerchantModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.create(model).subscribe(res => {
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
