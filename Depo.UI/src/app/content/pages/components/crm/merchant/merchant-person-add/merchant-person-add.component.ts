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
import { MerchantPerson } from "../merchant.model";
import { MerchantService } from "../merchant.service";

@Component({
	selector: "merchant-person-add",
	templateUrl: "./merchant-person-add.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantPersonAddComponent implements OnInit {
	form: FormGroup;
	formErrorMsg: string;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	userSubject: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
	constructor(
		public dialogRef: MatDialogRef<MerchantPersonAddComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private merchantService: MerchantService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef
	) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.createForm();
		if(this.data.data.id > 0)
		this.userSubject = new BehaviorSubject<number[]>(this.data.data.userId);
	}

	createForm() {
		
		this.form = this.fb.group({
			userSubject: [this.data.data.userId],
			contactPerson: [this.data.data.contactPerson],
			contactEmail: [this.data.data.contactEmail],
			contactPhone: [this.data.data.contactPhone],
			contactTitle: [this.data.data.contactTitle],
		});
	}

	getTitle(): string {
		return this.translate.instant("CRM.MERCHANT.DETAIL.USERS");
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.form.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	prepareModel(): MerchantPerson {
		const controls = this.form.controls;
		const model = new MerchantPerson();
		model.merchantId = this.data.data.merchantId;
		model.userId = this.userSubject.value;
		model.contactTitle = controls['contactTitle'].value;
		model.contactEmail = controls['contactEmail'].value;
		model.contactPhone = controls['contactPhone'].value;
		model.contactPerson = controls['contactPerson'].value;
		if(this.data.data.id > 0)
		model.id = this.data.data.id;
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
		
		const createdModel = this.prepareModel();
		if(this.data.data.id > 0)
			this.updateModel(createdModel);
		else
			this.crateModel(createdModel);
	}

	crateModel(model: MerchantPerson) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.createPerson(model).subscribe((res) => {
			this.handleResponse(res);
		});
	}

	updateModel(model :any){
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.merchantService.updatePerson(model).subscribe((res) => {
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

	onAlertClose($event) {
		this.formErrorMsg = null;
	}
}
