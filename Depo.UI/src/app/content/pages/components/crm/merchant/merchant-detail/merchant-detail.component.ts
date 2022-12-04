import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Inject,
	ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormBuilder, FormArray } from "@angular/forms";
import {
	MatDialogRef,
	MatSelectChange,
	MAT_DIALOG_DATA,
} from "@angular/material";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ApiResponseModel } from "../../../../../../core/models/api-response.model";
import { MerchantDetailModel, VehicleDetail } from "../merchant.model";
import { MerchantService } from "../merchant.service";

@Component({
	selector: "merchant-detail",
	templateUrl: "./merchant-detail.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantDetailComponent implements OnInit {
	model: any;
	id: number;
	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	competitorSubject: BehaviorSubject<number>;
	customerRepresentativeSubject: BehaviorSubject<number>;
	contractPeriodSubject: BehaviorSubject<number>;
	nameOfContractPeriodSubject: BehaviorSubject<string>;
	hasService: boolean;
	vehicleDetail: boolean;
	vehicleDetails: VehicleDetail[];
	isSpecialTransfer: boolean;
	constructor(
		public dialogRef: MatDialogRef<MerchantDetailComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private merchantService: MerchantService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef
	) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.model = this.data.merchantDetailComponent;
		this.id = this.model.id;

		if(this.model.contractEndDate == undefined || this.model.contractEndDate == null || new Date(this.model.contractEndDate).getFullYear() == 1)
			this.model.contractEndDate = new Date();
		if(this.model.tenderDate == undefined || this.model.tenderDate == null || new Date(this.model.tenderDate).getFullYear() == 1)
			this.model.tenderDate = new Date();

		this.competitorSubject = new BehaviorSubject<number>(
			this.model.competitorsId
		);
		this.customerRepresentativeSubject = new BehaviorSubject<number>(
			this.model.customerRepresentativeId
		);
		
		this.contractPeriodSubject = new BehaviorSubject<number>(this.model.contractPeriod);
		this.nameOfContractPeriodSubject = this.translate.instant('CRM.MERCHANT.DETAIL.CONTRACT_PERIOD');

		this.createForm();
	}

	createForm() {
		
		this.hasService = this.model.hasService;
		this.vehicleDetails = this.model.vehicleDetail;
		if (
			this.vehicleDetails != undefined &&
			this.vehicleDetails.length > 0
		) {
			this.vehicleDetail = true;
		} else {
			this.vehicleDetails = [];
		}

		if (this.model.isSpecialTransfer == undefined)
			this.model.isSpecialTransfer = false;
		this.isSpecialTransfer = this.model.isSpecialTransfer;

		this.form = this.fb.group({
			competitorSubject: [this.model.competitorsId],
			customerRepresentativeSubject: [this.model.customerRepresentativeId],
			vehicleCount: [this.model.vehicleCount],
			shiftCount: [this.model.shiftCount],
			personalCount: [this.model.personalCount],
			contractPeriodSubject: [this.model.contractPeriod],
		});
	}

	getTitle(): string {
		return this.translate.instant("CRM.MERCHANT.DETAIL.SELF");
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	selected(change: MatSelectChange) {
		this.isSpecialTransfer = change.value;
	}
	prepareModel(): MerchantDetailModel {
		const controls = this.form.controls;
		const model = new MerchantDetailModel();
		model.id = this.model.id;
		model.competitorsId = this.competitorSubject.value;
		model.hasService = this.hasService;
		model.customerRepresentativeId = this.customerRepresentativeSubject.value;
		model.isSpecialTransfer = this.isSpecialTransfer;
		model.contractPeriod = this.contractPeriodSubject.value;
		model.personalCount = controls["personalCount"].value;
		model.vehicleCount = controls["vehicleCount"].value;
		model.shiftCount = controls["shiftCount"].value;
		model.vehicleDetail = this.vehicleDetails;
		model.tenderDate =this.model.tenderDate;
		model.contractEndDate = this.model.contractEndDate;
		model.tenderDate.setHours(this.model.tenderDate.getHours() - this.model.tenderDate.getTimezoneOffset() / 60);
		model.contractEndDate.setHours(this.model.contractEndDate.getHours() - this.model.contractEndDate.getTimezoneOffset() / 60);

		if(!this.vehicleDetail)
			model.vehicleDetail = null;
		
		return model;
	}

	onSubmit() {
		this.formErrorMsg = null;
		this.loadingAfterSubmit = false;
		const controls = this.form.controls;

		if (this.form.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.formErrorMsg = this.translate.instant("COMMON.FORM_ERROR_MSG");
			return;
		}

		const editedModel = this.prepareModel();
		this.updateModel(editedModel);
	}

	updateModel(model: MerchantDetailModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		model.id = this.id;
		this.merchantService.updateDetail(model).subscribe((res) => {
			this.handleResponse(res);
		});
	}

	private handleResponse(res: any) {
		this.viewLoading = false;
		if (!res.isSuccess && res.type === "FORM") {
			this.formErrorMsg = res.message;
		} else {
			this.dialogRef.close(res);
		}
		this.cdr.detectChanges();
	}

	hasServiceClick(res: any) {
		res.preventDefault();
		this.hasService = !this.hasService;
	}
	vehicleDetailClick(res: any) {
		res.preventDefault();
		this.vehicleDetail = !this.vehicleDetail;
		if (this.vehicleDetail && this.vehicleDetails.length == 0) {
			this.onAddDetail();
		}
		this.cdr.detectChanges();
	}
	onAddDetail() {
		let vehicle = new VehicleDetail();
		vehicle.vehicleCapacityId = 0;
		vehicle.vehicleCount = 0;
		this.vehicleDetails.push(vehicle);
		this.cdr.detectChanges();
	}
	onRemoveDetail() {
		this.vehicleDetails.pop();
		if (this.vehicleDetail && this.vehicleDetails.length == 0) {
			this.vehicleDetail = false;
		}
		this.cdr.detectChanges();
	}
	onChangeContractEndDateTime() {
		this.model.contractEndDate;
	}
	onChangeTenderDateTime() {}
	onAlertClose($event) {
		this.formErrorMsg = null;
	}
}
