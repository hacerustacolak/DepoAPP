import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Output, ViewChild, ViewRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject,Subscription,timer } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { SpinnerButtonOptions } from '../../../partials/modules/spinner-button/button-options.interface';
// import { UserService } from '../../components/identity/users/user.service';

@Component({
  selector: 'm-confirm-code',
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss']
})
export class ConfirmCodeComponent implements OnInit {
	sub: Subscription;
	public model: any = { OtpCode: '' , Email: ''};
	@Input() action: string;
	@Output() actionChange = new Subject<string>();
	public loading = false;
	time: number = 180;
	min: number = 1;
	sec: number = 1;
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
		// private userService: UserService,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private authService: AuthenticationService,
		private cdr: ChangeDetectorRef
	) { }

  ngOnInit() {
	this.sub = timer(0, 1000).subscribe(x => {
		  this.time--;
		  this.min = Math.floor(this.time / 60);
		  this.sec = Math.floor(this.time % 60);
		  this.cdr.detectChanges();
		  if(this.time == 0){
			localStorage.removeItem("email");
			this.action = 'forgot-password'; 
			this.actionChange.next(this.action);
			this.authNoticeService.setNotice("your time is over.please submit a new code.", 'error');
			this.sub.unsubscribe();
		  }
	  });
  }

  loginPage(event: Event) {
		this.time = 0;
		event.preventDefault();
		this.action = 'login';
		this.actionChange.next(this.action);
		this.sub.unsubscribe();
  }
  
  submit() {
		this.spinner.active = true;
		this.model.Email = localStorage.getItem("email");
		localStorage.setItem("code",this.model.OtpCode);
		this.authService.confirmCode(this.model).subscribe(response => {
			if (!response.isSuccess) {
				this.action = 'confirm-code'; 
				this.actionChange.next(this.action);
				this.authNoticeService.setNotice(response.message, 'error');
			} else {
				this.action = 'new-password';
				this.actionChange.next(this.action);
				this.authNoticeService.setNotice(response.message, 'info');
				this.sub.unsubscribe();
			}
			this.spinner.active = false;
		});
	}
}
