import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CompetitorModel } from '../competitor.model';
import { CompetitorService } from '../competitor.service';

@Component({
	selector: 'competitor-edit',
	templateUrl: './competitor-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetitorEditComponent implements OnInit {
	model: CompetitorModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<CompetitorEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private competitorService: CompetitorService,
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
			competitorName: [this.model.competitorName],
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.COMPETITOR.EDIT') + ` '${this.model.competitorName}'`
			return title;
		}

		return this.translate.instant('DEFINITION.COMPETITOR.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): CompetitorModel {
		const controls = this.form.controls;
		const model = new CompetitorModel();
		model.id = this.model.id;
		model.competitorName = controls['competitorName'].value;
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

	updateModel(model: CompetitorModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.competitorService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: CompetitorModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.competitorService.create(model).subscribe(res => {
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
