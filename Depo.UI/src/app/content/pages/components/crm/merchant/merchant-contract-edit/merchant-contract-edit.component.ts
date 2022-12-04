import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MerchantContract } from '../merchant.model';
import { MerchantService } from '../merchant.service';

@Component({
	selector: 'merchant-contact-edit',
	templateUrl: './merchant-contract-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers:[DatePipe]
})
export class MerchantContractEditComponent implements OnInit {
	model: MerchantContract;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	inflationCheckPeriodSubject: BehaviorSubject<number>;
	fuelCheckPeriodSubject: BehaviorSubject<number>;
	nameOfInflationCheckPeriodSubject:BehaviorSubject<string>;
	nameOfFuelCheckPeriodSubject:BehaviorSubject<string>;
	date:Date;
	constructor(public dialogRef: MatDialogRef<MerchantContractEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private merchantService: MerchantService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private datepipe:DatePipe) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.inflationCheckPeriodSubject = new BehaviorSubject<number>(this.model.inflationCheckPeriod);
		this.fuelCheckPeriodSubject = new BehaviorSubject<number>(this.model.fuelCheckPeriod);
		this.nameOfInflationCheckPeriodSubject = this.translate.instant('CRM.MERCHANT.CONTRACT.INFLATIONCHECKPERIOD');
		this.nameOfFuelCheckPeriodSubject = this.translate.instant('CRM.MERCHANT.CONTRACT.FUELCHECKPERIOD');
		this.date = new Date(this.datepipe.transform(this.model.contractDate, 'yyyy-MM-dd'))
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			fuelCheckPeriodSubject: [this.model.fuelCheckPeriod],
			description: [this.model.description],
			inflationCheckPeriodSubject: [this.model.inflationCheckPeriod],
			inflationProcessingPercentage: [this.model.inflationProcessingPercentage],
			percentageOfInflationPriceWillBeProcessed: [this.model.percentageOfInflationPriceWillBeProcessed],
			fuelProcessingPercentage: [this.model.fuelProcessingPercentage],
			percentageOfFuelPriceWillBeProcessed: [this.model.percentageOfFuelPriceWillBeProcessed],
			contractDate: [this.model.contractDate],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('CRM.MERCHANT.CONTRACT.EDIT') + ` '${this.datepipe.transform(this.model.contractDate, 'yyyy-MM-dd')}'`
			return title;
		}

		return this.translate.instant('CRM.MERCHANT.CONTRACT.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): MerchantContract {
		const controls = this.form.controls;
		const model = new MerchantContract();
		model.id = this.model.id;
		model.fuelCheckPeriod = this.fuelCheckPeriodSubject.value;
		model.inflationCheckPeriod = this.inflationCheckPeriodSubject.value;
		model.description = controls['description'].value;
		model.merchantId = this.model.merchantId;
		model.fuelProcessingPercentage = controls['fuelProcessingPercentage'].value;
		model.percentageOfFuelPriceWillBeProcessed = controls['percentageOfFuelPriceWillBeProcessed'].value;
		model.inflationProcessingPercentage = controls['inflationProcessingPercentage'].value;
		model.percentageOfInflationPriceWillBeProcessed = controls['percentageOfInflationPriceWillBeProcessed'].value;
		model.contractDate = this.date;
		model.contractDate.setHours(this.date.getHours() - this.date.getTimezoneOffset() / 60);
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

	updateModel(model: MerchantContract) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.updateContract(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: MerchantContract) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.createContract(model).subscribe(res => {
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
