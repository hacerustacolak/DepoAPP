import {
	Component,
	OnInit,
	Input,
	Output,
	ViewChild,
	ElementRef,
	ChangeDetectionStrategy,
	ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerButtonOptions } from '../../../partials/modules/spinner-button/button-options.interface';
// import { UserService } from '../../components/identity/users/user.service';
import { LayoutUtilsService } from '../../../../core/services/layout-utils.service';

@Component({
	selector: 'm-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements OnInit {
	public model: any = { email: '', oldPassword: '', newPassword: '',OtpCode: ''};
	@Input() action: string;
	@Output() actionChange = new Subject<string>();
	public loading = false;

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

	newPasswordAgain: string = '';

	constructor(
		// private userService: UserService,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private authService: AuthenticationService,
		private layoutUtilsService: LayoutUtilsService
	) { }

	ngOnInit() {
		
	 }

	loginPage(event: Event) {
		event.preventDefault();
		this.action = 'login';
		this.actionChange.next(this.action);
		this.authNoticeService.setNotice('');
		this.cdr.detectChanges();
	}

	submit() {
		if (this.newPasswordAgain != this.model.newPassword) {
			this.authNoticeService.setNotice(this.translate.instant('Passwords do not match'), 'error');
			return;
		}

		this.model.email = localStorage.getItem('email');
		this.model.OtpCode = localStorage.getItem('code');
		this.spinner.active = true;
		this.authService.changePassword(this.model).subscribe((res:any) => {
			if (res.isSuccess) {
				this.action = 'login';
				this.actionChange.next(this.action);
				localStorage.removeItem('email');
				localStorage.removeItem('code');
				this.authNoticeService.setNotice(res.message, 'success');
			} else {
				this.authNoticeService.setNotice(this.translate.instant(res.message), 'error');
			}
			this.spinner.active = false;
			this.cdr.detectChanges();
		});
	}
}
