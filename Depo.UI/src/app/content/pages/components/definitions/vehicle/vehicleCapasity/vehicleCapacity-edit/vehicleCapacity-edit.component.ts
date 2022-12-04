import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VehicleCapacityModel } from '../vehicleCapacity.model';
import { VehicleCapacityService } from '../vehicleCapacity.service';

@Component({
	selector: 'vehicleCapacity-edit',
	templateUrl: './vehicleCapacity-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleCapacityEditComponent implements OnInit {
	model: VehicleCapacityModel;
	vehicleTypeSubject: BehaviorSubject<number>;
	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<VehicleCapacityEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private vehicleCapacityService: VehicleCapacityService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.vehicleTypeSubject = new BehaviorSubject<number>(this.model.vehicleTypeId);		
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			capacityName: [this.model.capacityName],
			description: [this.model.description],
			vehicleTypeSubject: [this.model.vehicleTypeId],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.VEHICLE.CAPACITY.EDIT') + ` '${this.model.capacityName}'`
			return title;
		}

		return this.translate.instant('DEFINITION.VEHICLE.CAPACITY.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): VehicleCapacityModel {
		const controls = this.form.controls;
		const model = new VehicleCapacityModel();
		model.id = this.model.id;
		model.capacityName = controls['capacityName'].value;
		model.description = controls['description'].value;
		model.vehicleTypeId = this.vehicleTypeSubject.value;
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

	updateModel(model: VehicleCapacityModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleCapacityService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: VehicleCapacityModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleCapacityService.create(model).subscribe(res => {
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
