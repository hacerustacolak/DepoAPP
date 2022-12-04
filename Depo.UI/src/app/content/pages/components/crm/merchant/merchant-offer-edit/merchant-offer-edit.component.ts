import { DatePipe, DecimalPipe, NumberFormatStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticationService } from '../../../../../../core/auth/authentication.service';
import { HttpUtilsService } from '../../../../../../core/services/http-utils.service';
import { MerchantOffer, MerchantOfferFile } from '../merchant.model';
import { MerchantService } from '../merchant.service';

@Component({
	selector: 'merchant-offer-edit',
	templateUrl: './merchant-offer-edit.component.html',
	styleUrls: ['./merchant-offer-edit.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class MerchantOfferEditComponent implements OnInit {
	model: MerchantOffer;

	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	statusSubject: BehaviorSubject<string>;
	fileTypeSubject: BehaviorSubject<string>;

	fileUploadDisabled: boolean = false;
	uploader: FileUploader;
	uploaderOptions: any;
	hasBaseDropZoneOver: boolean = false;

	constructor(public dialogRef: MatDialogRef<MerchantOfferEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private merchantService: MerchantService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private httpUtils: HttpUtilsService,
		private authService: AuthenticationService,
		private datepipe: DatePipe) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.model;
		this.statusSubject = new BehaviorSubject<string>(this.model.status);
		this.fileTypeSubject = new BehaviorSubject<string>(this.model.fileType);
		this.apkUploaderinit();
		this.createForm();
	}



	public fileOverBase(e: any): void {
		this.hasBaseDropZoneOver = e;
	}

	apkUploaderinit() {

		this.uploaderOptions = {
			url: this.httpUtils.baseApiUrl + '/api/Merchant/offer/upload',
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
			driverCost: [this.model.driverCost],
			description: [this.model.description],
			projectManagerCost: [this.model.projectManagerCost],
			controlToolCost: [this.model.controlToolCost],
			controlToolCount: [this.model.controlToolCount],
			fuelLiterFee: [this.model.fuelLiterFee],
			fuelCommissionRate: [this.model.fuelCommissionRate],
			letterOfGuaranteeFee: [this.model.letterOfGuaranteeFee],
			annualFinancingFee: [this.model.annualFinancingFee],
			profitMultiplier: [this.model.profitMultiplier],
			miniRentalFee: [this.model.miniRentalFee],
			midiRentalFee: [this.model.midiRentalFee],
			busRentalFee: [this.model.busRentalFee],
			carRentalFee: [this.model.carRentalFee],
			customerMaturity: [this.model.customerMaturity],
			subcontractorMaturity: [this.model.subcontractorMaturity],
			fuelMaturity: [this.model.fuelMaturity],
			statusSubject: [this.model.status],
			fileTypeSubject: [this.model.fileType]
		});
	}

	getTitle(): string {
		if (this.model.id) {
			var title: string = this.translate.instant('CRM.MERCHANT.OFFER.EDIT') + ` '${this.datepipe.transform(this.model.createDate, 'yyyy-MM-dd')}'`
			return title;
		}

		return this.translate.instant('CRM.MERCHANT.OFFER.CREATE');
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): MerchantOffer {
		const controls = this.form.controls;
		const model = new MerchantOffer();
		model.id = this.model.id;
		model.description = controls['description'].value;
		model.merchantId = this.model.merchantId;
		model.driverCost = controls['driverCost'].value;
		model.projectManagerCost = controls['projectManagerCost'].value;
		model.controlToolCost = controls['controlToolCost'].value;
		model.controlToolCount = controls['controlToolCount'].value;
		model.fuelLiterFee = controls['fuelLiterFee'].value;
		model.fuelCommissionRate = controls['fuelCommissionRate'].value;
		model.letterOfGuaranteeFee = controls['letterOfGuaranteeFee'].value;
		model.annualFinancingFee = controls['annualFinancingFee'].value;
		model.profitMultiplier = controls['profitMultiplier'].value;
		model.midiRentalFee = controls['midiRentalFee'].value;
		model.miniRentalFee = controls['miniRentalFee'].value;
		model.busRentalFee = controls['busRentalFee'].value;
		model.carRentalFee = controls['carRentalFee'].value;
		model.customerMaturity = controls['customerMaturity'].value;
		model.subcontractorMaturity = controls['subcontractorMaturity'].value;
		model.fuelMaturity = controls['fuelMaturity'].value;
		model.status = this.statusSubject.value;
		model.fileType = this.fileTypeSubject.value;
		if (this.model.fileName == null)
			this.model.fileName = "";
		if (this.model.fileSize == null)
			this.model.fileSize = 0;
		if (this.model.filePath == null)
			this.model.filePath = "";
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

	updateModel(model: MerchantOffer) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.updateOffer(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	createModel(model: MerchantOffer) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.createOffer(model).subscribe(res => {
			this.handleResponse(res);
		});
	}

	onDownloadItem(item: MerchantOfferFile) {
		this.merchantService.getDocumentByFilepath(item).subscribe(result => {
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.hidden = true;
			a.href = window.URL.createObjectURL(result);
			a.download = item.fileType.replace(" ", "") + "_" + item.fileName.replace(" ","");
			a.click();
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
