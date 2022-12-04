import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { Router } from '@angular/router';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { TranslateService } from '@ngx-translate/core';
// import { UserService } from '../../components/identity/users/user.service';

@Component({
  selector: 'm-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {

  constructor(
	private authService: AuthenticationService,
	// private userService: UserService,
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder,
    private layoutUtilsService: LayoutUtilsService,
	private router: Router,
	public authNoticeService: AuthNoticeService,
	private translate: TranslateService
  ) {

  }

  user: any;

  form: FormGroup;

  ngOnInit() {
    this.createForm();
    this.authService.getCurrentUser().subscribe(user => {

      this.user = {
        fullname: user.fullname,
        email: user.email,
        picture: user.picture || './assets/app/media/img/users/default-user.jpg'
	  }

	  this.authNoticeService.setNotice('');
      this.changeDetector.detectChanges();
    });
  }

  createForm() {
		this.form = this.fb.group({
			oldPassword: [''],
			newPassword: [''],
			newPasswordAgain: ['']
		});
	}

  onSubmit(){
    const controls = this.form.controls;

    const pwdAgain = controls['newPasswordAgain'].value

		const model = {
      oldPassword: controls['oldPassword'].value,
      newPassword: controls['newPassword'].value
    };

    if(pwdAgain != model.newPassword){
      this.layoutUtilsService.showActionNotification('Passwords do not match');
      return;
    }

    this.authService.changePasswordInPanel(model).subscribe((res:any) => {
      if(res.isSuccess){
        this.authService.logout();
		this.router.navigate(['/login']);
		this.authNoticeService.setNotice(res.message, 'success');
      } else {
		this.authNoticeService.setNotice(this.translate.instant(res.message), 'error');
		this.layoutUtilsService.showActionNotification(res.message);
	  }
	  this.changeDetector.detectChanges();
    });
  }
}
