import {
	Component,
	OnInit,
	Output,
	Input,
	ViewChild,
	OnDestroy,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	HostBinding
} from '@angular/core';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerButtonOptions } from '../../../partials/modules/spinner-button/button-options.interface';
import { Credential, BmsSearchInput } from '../../../../core/auth/authentication.model';

@Component({
	selector: 'm-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
	public model: Credential = { Email: '', Password: '' };
	@HostBinding('class') classes: string = 'm-login__signin';
	@Output() actionChange = new Subject<string>();
	public loading = false;

	@Input() action: string;

	@ViewChild('f') f: NgForm;
	errors: any = [];

	spinner: SpinnerButtonOptions = {
		active: false,
		spinnerSize: 18,
		raised: true,
		buttonColor: 'primary',
		spinnerColor: 'accent',
		fullWidth: false
	};

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef
	) {
	}

	passwordExpired: boolean = false;

	public bmsSearchInputs: Array<BmsSearchInput> = [
		{ key: "roleSearchInput", value: ""},
		{ key: "userSearchInput", value: "" },
		{ key: "regionSearchInput", value: "" },
		{ key: "competitorSearchInput", value: "" },
		{ key: "companySearchInput", value: "" },
		{ key: "groupSearchInput", value: "" },
		{ key: "merchantSearchInput", value: "" },
		{ key: "vehicleBrandSearchInput", value: "" },
		{ key: "vehicleModelSearchInput", value: "" },
		{ key: "vehicleCapacitySearchInput", value: "" },
		{ key: "merchantPersonSearchInput", value: "" },
		{ key: "merchantInterviewSearchInput", value: "" },
		{ key: "merchantContractSearchInput", value: "" },
		{ key: "merchantOfferSearchInput", value: "" },
	];

	submit() {
		this.spinner.active = true;
		this.authService.login(this.model).subscribe(result => {
			if (result.isSuccess && this.authService.isAuthorized()) {
				this.router.navigate(['/']);
				localStorage.setItem("bmsSearchInputs",JSON.stringify(this.bmsSearchInputs));
				return;
			}
			else {
				this.spinner.active = false;
				this.passwordExpired = result.data ? result.data.passwordExpired : false;
				this.authNoticeService.setNotice(this.translate.instant(result.message), 'error');
				if (this.passwordExpired) {
					localStorage.setItem('email', this.model.Email);
					this.toforgotPasswordPage();
				}
				this.cdr.detectChanges();
			}
		});
	}

	ngOnInit(): void {
		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			const initialNotice = ``;
			this.authNoticeService.setNotice(initialNotice, 'success');
		}
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
	}

	validate(f: NgForm) {
		if (f.form.status === 'VALID') {
			return true;
		}

		this.errors = [];
		if (objectPath.get(f, 'form.controls.email.errors.email')) {
			this.errors.push(this.translate.instant('AUTH.VALIDATION.INVALID', { name: this.translate.instant('AUTH.INPUT.EMAIL') }));
		}
		if (objectPath.get(f, 'form.controls.email.errors.required')) {
			this.errors.push(this.translate.instant('AUTH.VALIDATION.REQUIRED', { name: this.translate.instant('AUTH.INPUT.EMAIL') }));
		}

		if (objectPath.get(f, 'form.controls.password.errors.required')) {
			this.errors.push(this.translate.instant('AUTH.VALIDATION.INVALID', { name: this.translate.instant('AUTH.INPUT.PASSWORD') }));
		}
		if (objectPath.get(f, 'form.controls.password.errors.minlength')) {
			this.errors.push(this.translate.instant('AUTH.VALIDATION.MIN_LENGTH', { name: this.translate.instant('AUTH.INPUT.PASSWORD') }));
		}

		if (this.errors.length > 0) {
			this.authNoticeService.setNotice(this.errors.join('<br/>'), 'error');
		}

		this.spinner.active = false;

		return false;
	}

	forgotPasswordPage(event: Event) {
		this.action = 'forgot-password';
		this.actionChange.next(this.action);
	}

	toforgotPasswordPage() {
		this.action = 'forgot-password';
		this.actionChange.next(this.action);
	}

	changePasswordPage(event: Event) {
		this.action = 'change-password';
		this.actionChange.next(this.action);
	}

	register(event: Event) {
		this.action = 'register';
		this.actionChange.next(this.action);
	}
}
