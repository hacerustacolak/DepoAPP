import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AuthGuardService } from './core/auth/auth-guard.service';

const routes: Routes = [
	{
		path: '',
		loadChildren: 'app/content/pages/pages.module#PagesModule',
		// canActivate: [AuthGuardService]
	},
	{
		path: '**',
		redirectTo: '404',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}
