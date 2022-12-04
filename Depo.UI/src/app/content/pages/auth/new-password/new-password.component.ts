import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { SpinnerButtonOptions } from '../../../partials/modules/spinner-button/button-options.interface';
// import { UserService } from '../../components/identity/users/user.service';

@Component({
  selector: 'm-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewPasswordComponent implements OnInit {
	public model: any = { email: '', newPassword: '', otpCode: '' };
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
    private authService: AuthenticationService
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
		this.model.otpCode = localStorage.getItem('code');
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
