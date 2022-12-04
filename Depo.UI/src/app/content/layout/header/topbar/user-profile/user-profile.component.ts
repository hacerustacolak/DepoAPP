import { AuthenticationService } from '../../../../../core/auth/authentication.service';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
	selector: 'm-user-profile',
	templateUrl: './user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classes = 'm-nav__item m-topbar__user-profile m-topbar__user-profile--img m-dropdown m-dropdown--medium m-dropdown--arrow m-dropdown--header-bg-fill m-dropdown--align-right m-dropdown--mobile-full-width m-dropdown--skin-light';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';

	@Input() avatar: string = './assets/app/media/img/users/default-user.jpg';
	@Input() avatarBg: SafeStyle = '';

	@ViewChild('mProfileDropdown') mProfileDropdown: ElementRef;

	user: any;

	constructor(
		private router: Router,
		private authService: AuthenticationService,
		private sanitizer: DomSanitizer,
		private changeDetector: ChangeDetectorRef) {

	}

	ngOnInit(): void {
		if (!this.avatarBg) {
			this.avatarBg = this.sanitizer.bypassSecurityTrustStyle('url(./assets/app/media/img/misc/user_profile_bg.jpg)');
		}

		this.authService.getCurrentUser().subscribe(user => {

			this.user = {
				fullname: user.fullname,
				email: user.email,
				companyName: user.companyName
			}

			if(user.picture){
				this.avatar = user.picture;
			}
			
			this.changeDetector.detectChanges();
		});
	}

	public logout() {
		this.authService.logout(true);
	}
}
