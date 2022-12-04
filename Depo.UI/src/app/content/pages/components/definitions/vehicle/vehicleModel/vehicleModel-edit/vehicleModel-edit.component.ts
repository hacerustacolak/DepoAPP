import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VehicleModelModel } from '../vehicleModel.model';
import { VehicleModelService } from '../vehicleModel.service';

@Component({
	selector: 'vehicleModel-edit',
	templateUrl: './vehicleModel-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleModelEditComponent implements OnInit {
	model: VehicleModelModel;
	vehicleBrandSubject: BehaviorSubject<number>;
	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	maintenancePeriodYear: number;
	constructor(public dialogRef: MatDialogRef<VehicleModelEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private vehicleModelService: VehicleModelService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.maintenancePeriodYear = this.data.model.maintenancePeriodYear;
		this.vehicleBrandSubject = new BehaviorSubject<number>(this.model.vehicleBrandId);		
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			modelName: [this.model.modelName],
			description: [this.model.description],
			maintenancePeriodKM:[this.model.maintenancePeriodKM],
			vehicleBrandSubject: [this.model.vehicleBrandId],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.VEHICLE.MODEL.EDIT') + ` '${this.model.modelName}'`
			return title;
		}

		return this.translate.instant('DEFINITION.VEHICLE.MODEL.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): VehicleModelModel {
		const controls = this.form.controls;
		const model = new VehicleModelModel();
		model.id = this.model.id;
		model.modelName = controls['modelName'].value;
		model.description = controls['description'].value;
		model.vehicleBrandId = this.vehicleBrandSubject.value;
		model.maintenancePeriodKM = controls['maintenancePeriodKM'].value;
		model.maintenancePeriodYear = this.maintenancePeriodYear;
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

	updateModel(model: VehicleModelModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleModelService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: VehicleModelModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleModelService.create(model).subscribe(res => {
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
