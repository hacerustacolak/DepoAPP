import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WarehouseModel } from '../warehouse.model';
import { WarehouseService } from '../warehouse.service';

@Component({
	selector: 'warehouse-edit',
	templateUrl: './warehouse-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseEditComponent implements OnInit {
	model: WarehouseModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<WarehouseEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private warehouseService: WarehouseService,
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
			warehouseName: [this.model.warehouseName],
			logoCode: [this.model.logoCode],
			city: [this.model.city],
			address: [this.model.address],
			phone: [this.model.phone],
			name: [this.model.warehouseName],
			representative: [this.model.representative] 
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.WAREHOUSE.EDIT') + ` '${this.model.warehouseName}'`
			return title;
		}

		return this.translate.instant('DEFINITION.WAREHOUSE.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}
	prepareModel(): WarehouseModel {
		const controls = this.form.controls;
		const model = new WarehouseModel();
		model.id = this.model.id;
		model.warehouseName = controls['warehouseName'].value;
		model.logoCode = controls['logoCode'].value;
		model.city = controls['city'].value;
		model.address = controls['address'].value;
		model.phone = controls['phone'].value;
		model.representative = controls['representative'].value; 
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

	updateModel(model: WarehouseModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.warehouseService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: WarehouseModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.warehouseService.create(model).subscribe(res => {
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
