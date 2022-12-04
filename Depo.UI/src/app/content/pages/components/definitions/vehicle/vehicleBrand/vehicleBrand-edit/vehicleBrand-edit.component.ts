import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VehicleBrandModel } from '../vehicleBrand.model';
import { VehicleBrandService } from '../vehicleBrand.service';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { HttpUtilsService } from '../../../../../../../core/services/http-utils.service';
import { AuthenticationService } from '../../../../../../../core/auth/authentication.service';

@Component({
	selector: 'vehicleBrand-edit',
	templateUrl: './vehicleBrand-edit.component.html',
	styleUrls: ['./vehicleBrand-edit.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleBrandEditComponent implements OnInit {
	model: VehicleBrandModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	fileUploadDisabled: boolean = false;
	uploader: FileUploader;
	uploaderOptions: any;
	hasBaseDropZoneOver: boolean = false;

	constructor(public dialogRef: MatDialogRef<VehicleBrandEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private vehicleBrandService: VehicleBrandService,
		private translate: TranslateService,
		private httpUtils: HttpUtilsService,
		private authService: AuthenticationService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.logoUploaderinit();
		this.createForm();
	}

	public fileOverBase(e: any): void {
		this.hasBaseDropZoneOver = e;
	}

	logoUploaderinit() {

		this.uploaderOptions = {
			url: this.httpUtils.baseApiUrl + '/api/vehiclebrand/upload',
			isHTML5: true,
			autoUpload: true,
			queueLimit: 1
		};

		this.uploader = new FileUploader(this.uploaderOptions);

		this.uploader.onBeforeUploadItem = (item) => {
			this.viewLoading = true;
		}

		this.authService.getAccessToken().subscribe(res => {
			this.uploader.authToken = 'Bearer ' + res;
		});

		this.uploader.onAfterAddingFile = (item => {
			item.withCredentials = false;
		});

		this.uploader.onCompleteItem = (item, response, status, headers) => this.onCompleteItem(item, response, status, headers);
	}

	onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);
				this.model.filePath = data.filePath;
				this.model.fileName = data.fileName;
				this.model.fileSize = data.fileSize;
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	createForm() {
		this.form = this.fb.group({
			brandName: [this.model.brandName],
			description:[this.model.description]
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.VEHICLE.BRAND.EDIT') + ` '${this.model.brandName}'`
			return title;
		}

		return this.translate.instant('DEFINITION.VEHICLE.BRAND.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): VehicleBrandModel {
		const controls = this.form.controls;
		const model = new VehicleBrandModel();
		model.id = this.model.id;
		model.brandName = controls['brandName'].value;
		model.description = controls['description'].value;
		model.fileName = this.model.fileName;
		model.filePath = this.model.filePath;
		model.fileSize = this.model.fileSize;
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

	updateModel(model: VehicleBrandModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleBrandService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: VehicleBrandModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleBrandService.create(model).subscribe(res => {
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
