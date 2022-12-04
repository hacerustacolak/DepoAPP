import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
	MatButtonModule,
	MatFormFieldModule,
	MatInputModule,
	MatCheckboxModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { AuthNoticeComponent } from './auth-notice/auth-notice.component';
import { SpinnerButtonModule } from '../../partials/modules/spinner-button/spinner-button.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { ConfirmCodeComponent } from './confirm-code/confirm-code.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		TranslateModule.forChild(),
		SpinnerButtonModule,
		RouterModule.forChild([
			{
				path: '',
				component: AuthComponent
			}
		])
	],
	declarations: [
		AuthComponent,
		LoginComponent,
		AuthNoticeComponent,
		ForgotPasswordComponent,
		NewPasswordComponent,
		ConfirmCodeComponent,
		ChangePasswordComponent
	]
})
export class AuthModule {}
