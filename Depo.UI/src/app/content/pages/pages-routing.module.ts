import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ProfileComponent } from './header/profile/profile.component';
import { ErrorPageComponent } from './snippets/error-page/error-page.component';

const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		canActivate: [NgxPermissionsGuard],
		data: {
			permissions: {
				only: ['LogIn'],
				except: [],
				redirectTo: '/login'
			}
		},
		children: [
			{
				path: 'profile',
				component: ProfileComponent,
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [],
						except: [],
						redirectTo: '/error/403'
					}
				}
			},
			{
				path: '',
				loadChildren: './components/identity/identity.module#IdentityModule',
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [],
						except: [],
						redirectTo: '/error/403'
					}
				}
			},
			{
				path: '',
				loadChildren: './components/definitions/definitions.module#DefinitionsModule',
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [],
						except: [],
						redirectTo: '/error/403'
					}
				}
			},
			{
				path: '',
				loadChildren: './components/crm/crm.module#CrmModule',
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [],
						except: [],
						redirectTo: '/error/403'
					}
				}
			},
			// {
			// 	path: '',
			// 	loadChildren: './components/dashboard/dashboard.module#DashboardModule'
			// },
			{
				path: 'profile',
				component: ProfileComponent,
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [],
						except: [],
						redirectTo: '/error/403'
					}
				}
			}
		]
	},
	{
		path: 'login',
		loadChildren: './auth/auth.module#AuthModule'
	},
	{
		path: '404',
		component: ErrorPageComponent
	},
	{
		path: 'error/:type',
		component: ErrorPageComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PagesRoutingModule { }
