import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { HttpUtilsService } from '../../../../../../../core/services/http-utils.service';
import { AuthenticationService } from '../../../../../../../core/auth/authentication.service';
import { VehicleFileMaintenance, VehicleFileModel, VehicleFileModelWithDate, VehicleModel } from '../vehicle.model';
import { VehicleService } from '../vehicle.service';

@Component({
	selector: 'vehicleBrand-edit',
	templateUrl: './vehicle-edit.component.html',
	styleUrls: ['./vehicle-edit.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleEditComponent implements OnInit {
	model: VehicleModel;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	fileUploadDisabled: boolean = false;
	uploader: FileUploader;
	uploaderOptions: any;

	fileUploadDisabledLisence: boolean = false;
	uploaderLisence: FileUploader;
	uploaderOptionsLisence: any;

	fileUploadDisabledTrafficInsurance: boolean = false;
	uploaderTrafficInsurance: FileUploader;
	uploaderOptionsTrafficInsurance: any;

	fileUploadDisabledTrafficImms: boolean = false;
	uploaderTrafficImms: FileUploader;
	uploaderOptionsTrafficImms: any;

	fileUploadDisabledTrafficInspection: boolean = false;
	uploaderTrafficInspection: FileUploader;
	uploaderOptionsTrafficInspection: any;

	fileUploadDisabledMaintenance: boolean = false;
	uploaderMaintenance: FileUploader;
	uploaderOptionsMaintenance: any;

	hasBaseDropZoneOver: boolean = false;
	hasBaseDropZoneOverLisence: boolean = false;
	hasBaseDropZoneOverInsurance: boolean = false;
	hasBaseDropZoneOverImms: boolean = false;
	hasBaseDropZoneOverInspection: boolean = false;
	hasBaseDropZoneOverMaintenance: boolean = false;


	sCVehicleTypeIdSubject :BehaviorSubject<number>;
	vehicleTrackingDeviceCompanyIdSubject:BehaviorSubject<number>;
	vehicleBrandIdSubject:BehaviorSubject<number>;
	vehicleYearSubject:BehaviorSubject<number>;

	plateFirst:number = 0;
	plateSecond:string = '';
	plateThird:number = 0;

	lisenceStartDater:Date;
	lisenceEndDater:Date;
	trafficInsuranceStartDater:Date;
	trafficInsuranceEndDater: Date;
	iMMSStartDater:Date;
	iMMSEndDater: Date;
	trafficInspectionStartDater:Date;
	trafficInspectionEndDater: Date;
	maintenanceEndDater: Date;
	lastMaintenanceKM:number;

	constructor(public dialogRef: MatDialogRef<VehicleEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private vehicleService: VehicleService,
		private translate: TranslateService,
		private httpUtils: HttpUtilsService,
		private authService: AuthenticationService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.sCVehicleTypeIdSubject = new BehaviorSubject<number>(this.model.scVehicleTypeId);
		this.vehicleTrackingDeviceCompanyIdSubject = new BehaviorSubject<number>(this.model.vehicleTrackingDeviceCompanyId);
		this.vehicleBrandIdSubject = new BehaviorSubject<number>(this.model.vehicleBrandId);
		this.vehicleYearSubject= new BehaviorSubject<number>(this.model.vehicleModelYear);
		if(this.model.vehiclePlate != undefined && this.model.vehiclePlate.length > 0){
			let plateArray = this.model.vehiclePlate.split(/\s+/);
			if(plateArray.length > 0)
			{
				this.plateFirst = +plateArray[0];
				this.plateSecond = plateArray[1];
				this.plateThird = +plateArray[2];
			}
		}

		if(this.model.vehicleLisenceList != undefined){
			this.lisenceStartDater = new Date(this.model.vehicleLisenceList.startDate);
			this.lisenceEndDater = new Date(this.model.vehicleLisenceList.endDate);
		}

		if(this.model.vehicleTrafficInsuranceList != undefined){
			this.trafficInsuranceStartDater = new Date(this.model.vehicleTrafficInsuranceList.startDate);
			this.trafficInsuranceEndDater = new Date(this.model.vehicleTrafficInsuranceList.endDate);
		}

		if(this.model.vehicleTrafficIMMSList != undefined){
			this.iMMSStartDater = new Date(this.model.vehicleTrafficIMMSList.startDate);
			this.iMMSEndDater = new Date(this.model.vehicleTrafficIMMSList.endDate);
		}
		
		if(this.model.vehicleInspectionList != undefined){
			this.trafficInspectionStartDater = new Date(this.model.vehicleInspectionList.startDate);
			this.trafficInspectionEndDater = new Date(this.model.vehicleInspectionList.endDate);
		}

		if(this.model.vehicleMaintenanceList != undefined){
			this.maintenanceEndDater = new Date(this.model.vehicleMaintenanceList.endDate);
			this.lastMaintenanceKM = this.model.vehicleMaintenanceList.lastMaintenanceKM
		}
				
		this.imageUploaderinit();
		this.lisenceUploaderinit();
		this.trafficInsuranceUploaderinit();
		this.trafficIMMSUploaderinit();
		this.trafficInspectionUploaderinit();
		this.maintenanceUploaderinit();
		this.createForm();
	}

	public fileOverBase(e: any): void {
		this.hasBaseDropZoneOver = e;
	}

	public fileOverBaseLisence(e: any): void {
		this.hasBaseDropZoneOverLisence = e;
	}

	public fileOverBaseInsurance(e: any): void {
		this.hasBaseDropZoneOverInsurance = e;
	}

	public fileOverBaseImms(e: any): void {
		this.hasBaseDropZoneOverImms = e;
	}

	public fileOverBasehasBaseDropZoneOverInspection(e: any): void {
		this.hasBaseDropZoneOverInspection = e;
	}

	public fileOverBaseMaintenance(e: any): void {
		this.hasBaseDropZoneOverMaintenance = e;
	}

	imageUploaderinit() {

		this.uploaderOptions = {
			url: this.httpUtils.baseApiUrl + '/api/vehicle/upload-image',
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

	lisenceUploaderinit() {

		this.uploaderOptionsLisence = {
			url: this.httpUtils.baseApiUrl + '/api/vehicle/upload-image',
			isHTML5: true,
			autoUpload: true,
			queueLimit: 1
		};

		this.uploaderLisence = new FileUploader(this.uploaderOptionsLisence);

		this.uploaderLisence.onBeforeUploadItem = (item) => {
			this.viewLoading = true;
		}

		this.authService.getAccessToken().subscribe(res => {
			this.uploaderLisence.authToken = 'Bearer ' + res;
		});

		this.uploaderLisence.onAfterAddingFile = (item => {
			item.withCredentials = false;
		});

		this.uploaderLisence.onCompleteItem = (item, response, status, headers) => this.onCompleteLisenceItem(item, response, status, headers);
	}

	trafficInsuranceUploaderinit() {

		this.uploaderOptionsTrafficInsurance = {
			url: this.httpUtils.baseApiUrl + '/api/vehicle/upload-document',
			isHTML5: true,
			autoUpload: true,
			queueLimit: 1
		};

		this.uploaderTrafficInsurance = new FileUploader(this.uploaderOptionsTrafficInsurance);

		this.uploaderTrafficInsurance.onBeforeUploadItem = (item) => {
			this.viewLoading = true;
		}

		this.authService.getAccessToken().subscribe(res => {
			this.uploaderTrafficInsurance.authToken = 'Bearer ' + res;
		});

		this.uploaderTrafficInsurance.onAfterAddingFile = (item => {
			item.withCredentials = false;
		});

		this.uploaderTrafficInsurance.onCompleteItem = (item, response, status, headers) => this.onCompleteTrafficInsuranceItem(item, response, status, headers);
	}

	trafficIMMSUploaderinit() {

		this.uploaderOptionsTrafficImms = {
			url: this.httpUtils.baseApiUrl + '/api/vehicle/upload-document',
			isHTML5: true,
			autoUpload: true,
			queueLimit: 1
		};

		this.uploaderTrafficImms = new FileUploader(this.uploaderOptionsTrafficImms);

		this.uploaderTrafficImms.onBeforeUploadItem = (item) => {
			this.viewLoading = true;
		}

		this.authService.getAccessToken().subscribe(res => {
			this.uploaderTrafficImms.authToken = 'Bearer ' + res;
		});

		this.uploaderTrafficImms.onAfterAddingFile = (item => {
			item.withCredentials = false;
		});

		this.uploaderTrafficImms.onCompleteItem = (item, response, status, headers) => this.onCompleteTrafficIMMS(item, response, status, headers);
	}
	
	trafficInspectionUploaderinit() {

		this.uploaderOptionsTrafficInspection = {
			url: this.httpUtils.baseApiUrl + '/api/vehicle/upload-document',
			isHTML5: true,
			autoUpload: true,
			queueLimit: 1
		};

		this.uploaderTrafficInspection = new FileUploader(this.uploaderOptionsTrafficInspection);

		this.uploaderTrafficInspection.onBeforeUploadItem = (item) => {
			this.viewLoading = true;
		}

		this.authService.getAccessToken().subscribe(res => {
			this.uploaderTrafficInspection.authToken = 'Bearer ' + res;
		});

		this.uploaderTrafficInspection.onAfterAddingFile = (item => {
			item.withCredentials = false;
		});

		this.uploaderTrafficInspection.onCompleteItem = (item, response, status, headers) => this.onCompleteTrafficInspection(item, response, status, headers);
	}
	
	maintenanceUploaderinit() {

		this.uploaderOptionsMaintenance = {
			url: this.httpUtils.baseApiUrl + '/api/vehicle/upload-document',
			isHTML5: true,
			autoUpload: true,
			queueLimit: 1
		};

		this.uploaderMaintenance = new FileUploader(this.uploaderOptionsMaintenance);

		this.uploaderMaintenance.onBeforeUploadItem = (item) => {
			this.viewLoading = true;
		}

		this.authService.getAccessToken().subscribe(res => {
			this.uploaderMaintenance.authToken = 'Bearer ' + res;
		});

		this.uploaderMaintenance.onAfterAddingFile = (item => {
			item.withCredentials = false;
		});

		this.uploaderMaintenance.onCompleteItem = (item, response, status, headers) => this.onCompleteMaintenance(item, response, status, headers);
	}

	onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);

				let vehicleModel = new VehicleFileModel();
				vehicleModel.filePath = data.filePath;
				vehicleModel.fileName = data.fileName;
				vehicleModel.fileLength = data.fileSize;
				vehicleModel.fileBase64 = 'data:image/jpg;base64,' + data.fileBase64;

				this.model.vehiclePhotoList.push(vehicleModel);
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	onCompleteLisenceItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);
				this.model.vehicleLisenceList.fileLength = data.fileSize;
				this.model.vehicleLisenceList.fileName = data.fileName;
				this.model.vehicleLisenceList.filePath = data.filePath;
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	onCompleteTrafficInsuranceItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);
				this.model.vehicleTrafficInsuranceList.fileLength = data.fileSize;
				this.model.vehicleTrafficInsuranceList.fileName = data.fileName;
				this.model.vehicleTrafficInsuranceList.filePath = data.filePath;
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	onCompleteTrafficIMMS(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);
				this.model.vehicleTrafficIMMSList.fileLength = data.fileSize;
				this.model.vehicleTrafficIMMSList.fileName = data.fileName;
				this.model.vehicleTrafficIMMSList.filePath = data.filePath;
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	onCompleteTrafficInspection(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);
				this.model.vehicleInspectionList.fileLength = data.fileSize;
				this.model.vehicleInspectionList.fileName = data.fileName;
				this.model.vehicleInspectionList.filePath = data.filePath;
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	onCompleteMaintenance(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
		if (status == 200) {
			let res = JSON.parse(response); //success server response
			if (res.isSuccess) {
				let data = res.data;
				console.log('manifest:', data);
				this.model.vehicleMaintenanceList.fileLength = data.fileSize;
				this.model.vehicleMaintenanceList.fileName = data.fileName;
				this.model.vehicleMaintenanceList.filePath = data.filePath;
			}
			else if (res.type === 'FORM') {
				this.formErrorMsg = res.message;
			}
		}

		this.viewLoading = false;
		this.cdr.detectChanges();
	}

	onDownloadItem(item: VehicleFileModel) {
		this.vehicleService.getDocumentByFilepath(item).subscribe(result => {
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.hidden = true;
			a.href = window.URL.createObjectURL(result);
			a.download = item.fileName.replace(" ","");
			a.click();
		});
	}

	createForm() {
		this.form = this.fb.group({
			sCVehicleTypeIdSubject: [this.sCVehicleTypeIdSubject.value],
			vehicleTrackingDeviceCompanyIdSubject: [this.vehicleTrackingDeviceCompanyIdSubject.value],
			plateFirst: [this.plateFirst],
			plateSecond: [this.plateSecond],
			plateThird: [this.plateThird],
			vehicleRental:[this.model.vehicleRental],
			vehicleTrackingDeviceNo:[this.model.vehicleTrackingDeviceNo],
			description:[this.model.description],
			vehicleYearSubject:[this.vehicleYearSubject.value],
			lastMaintenanceKM:[this.lastMaintenanceKM]
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('DEFINITION.VEHICLE.VEHICLE.EDIT') + ` '${this.model.vehiclePlate}'`
			return title;
		}

		return this.translate.instant('DEFINITION.VEHICLE.VEHICLE.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): VehicleModel {
		const controls = this.form.controls;
		const model = new VehicleModel();
		model.id = this.model.id;
		model.scVehicleTypeId = this.sCVehicleTypeIdSubject.value;
		model.vehicleTrackingDeviceCompanyId = this.vehicleTrackingDeviceCompanyIdSubject.value;
		model.vehicleTrackingDeviceNo = controls['vehicleTrackingDeviceNo'].value;
		model.description = controls['description'].value;
		model.vehiclePlate = controls['plateFirst'].value+ " "+controls['plateSecond'].value+" "+controls['plateThird'].value;
		model.vehicleModelId = this.model.vehicleModelId;
		model.vehicleCapacityId = this.model.vehicleCapacityId;
		model.vehicleRental = controls['vehicleRental'].value;
		model.vehicleModelYear = this.vehicleYearSubject.value;
		
		if(this.model.vehiclePhotoList != undefined)
			model.vehiclePhotoList = this.model.vehiclePhotoList;
			
		model.vehicleLisenceList = new VehicleFileModelWithDate();
		model.vehicleTrafficInsuranceList = new VehicleFileModelWithDate();
		model.vehicleTrafficIMMSList = new VehicleFileModelWithDate();
		model.vehicleInspectionList = new VehicleFileModelWithDate();
		model.vehicleMaintenanceList = new VehicleFileMaintenance();

		if(this.model.vehicleLisenceList != undefined)
			model.vehicleLisenceList = this.model.vehicleLisenceList;

		if(this.model.vehicleTrafficInsuranceList != undefined)
			model.vehicleTrafficInsuranceList = this.model.vehicleTrafficInsuranceList;

		if(this.model.vehicleTrafficIMMSList != undefined)
			model.vehicleTrafficIMMSList = this.model.vehicleTrafficIMMSList;

		if(this.model.vehicleInspectionList != undefined)
			model.vehicleInspectionList = this.model.vehicleInspectionList;

		if(this.model.vehicleMaintenanceList != undefined)
			model.vehicleMaintenanceList = this.model.vehicleMaintenanceList;

			

		model.vehicleLisenceList.startDate = this.lisenceStartDater;
		model.vehicleLisenceList.startDate.setHours(this.lisenceStartDater.getHours() - this.lisenceStartDater.getTimezoneOffset() / 60);
		
		model.vehicleLisenceList.endDate = this.lisenceEndDater;
		model.vehicleLisenceList.endDate.setHours(this.lisenceEndDater.getHours() - this.lisenceEndDater.getTimezoneOffset() / 60);
		
		model.vehicleTrafficInsuranceList.startDate = this.trafficInsuranceStartDater;
		model.vehicleTrafficInsuranceList.startDate.setHours(this.trafficInsuranceStartDater.getHours() - this.trafficInsuranceStartDater.getTimezoneOffset() / 60);

		model.vehicleTrafficInsuranceList.endDate = this.trafficInsuranceEndDater;
		model.vehicleTrafficInsuranceList.endDate.setHours(this.trafficInsuranceEndDater.getHours() - this.trafficInsuranceEndDater.getTimezoneOffset() / 60);

		model.vehicleTrafficIMMSList.startDate = this.iMMSStartDater;
		model.vehicleTrafficIMMSList.startDate.setHours(this.iMMSStartDater.getHours() - this.iMMSStartDater.getTimezoneOffset() / 60);

		model.vehicleTrafficIMMSList.endDate = this.iMMSEndDater;
		model.vehicleTrafficIMMSList.endDate.setHours(this.iMMSEndDater.getHours() - this.iMMSEndDater.getTimezoneOffset() / 60);

		model.vehicleInspectionList.startDate = this.trafficInspectionStartDater;
		model.vehicleInspectionList.startDate.setHours(this.trafficInspectionStartDater.getHours() - this.trafficInspectionStartDater.getTimezoneOffset() / 60);

		model.vehicleInspectionList.endDate = this.trafficInspectionEndDater;
		model.vehicleInspectionList.endDate.setHours(this.trafficInspectionEndDater.getHours() - this.trafficInspectionEndDater.getTimezoneOffset() / 60);

		model.vehicleMaintenanceList.endDate = this.maintenanceEndDater;
		model.vehicleMaintenanceList.endDate.setHours(this.maintenanceEndDater.getHours() - this.maintenanceEndDater.getTimezoneOffset() / 60);

		model.vehicleMaintenanceList.lastMaintenanceKM = controls['lastMaintenanceKM'].value;

		if(model.scVehicleTypeId == 1)
			model.subcontractorId = 1;
		else
			model.subcontractorId = 2;
		
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

	updateModel(model: VehicleModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleService.update(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: VehicleModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.vehicleService.create(model).subscribe(res => {
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
