import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RegionModel } from '../region.model';
import { RegionService } from '../region.service';

@Component({
	selector: 'region-edit',
	templateUrl: './region-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegionEditComponent implements OnInit {
	model: RegionModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	citySubject: BehaviorSubject<number[]>;

	constructor(public dialogRef: MatDialogRef<RegionEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private regionService: RegionService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.citySubject = new BehaviorSubject<number[]>(this.model.cityId);		
		this.createForm();
	}

	createForm() {
		this.form = this.fb.group({
			regionName: [this.model.regionName],
			address: [this.model.address],
			phoneNumber: [this.model.phoneNumber],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.REGION.EDIT') + ` '${this.model.regionName}'`
			return title;
		}

		return this.translate.instant('DEFINITION.REGION.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): RegionModel {
		const controls = this.form.controls;
		const model = new RegionModel();
		model.id = this.model.id;
		model.regionName = controls['regionName'].value;
		model.phoneNumber = controls['phoneNumber'].value;
		model.address = controls['address'].value;
		model.cityId = this.citySubject.value;
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

	updateModel(model: RegionModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.regionService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: RegionModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.regionService.create(model).subscribe(res => {
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
