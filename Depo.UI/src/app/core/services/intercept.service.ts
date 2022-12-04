import { Injectable, ChangeDetectorRef } from '@angular/core';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpResponse,
	HttpErrorResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenStorage } from '../auth/token-storage.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../auth/authentication.service';
import { LayoutUtilsService } from './layout-utils.service';

@Injectable()
export class InterceptService implements HttpInterceptor {

	constructor(
		private authService: AuthenticationService,
		private layoutUtilsService: LayoutUtilsService,
		private router: Router,
		private tokenStorage: TokenStorage) { }

	// intercept request and add token
	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		// modify request
		request = request.clone({
			setHeaders: {
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
				'Accept-Language': localStorage.getItem('language') || 'en',
				'Content-Type': 'application/json'
			}
		});

		return next.handle(request).pipe(
			tap(this.handleResponse.bind(this)),
			catchError((error, caught) => {
				//intercept the respons error and displace it to the console

				if (error.status === 400) {
					let errors = error.error.errors;
					for (let field in errors) {
						this.layoutUtilsService.showActionNotification(errors[field][0]);
						break;
					}
				}
				else {
					this.layoutUtilsService.showActionNotification(error.message);
				}

				this.handleAuthError(error);

				return of(error);
			}) as any);
	}

	handleResponse(res) {
		let result = res.body;
		if (result) {
			switch (result.type) {
				case 'SNACK':
					this.layoutUtilsService.showActionNotification(result.message);
					break;
			}
		}
	}

	/**
  * manage errors
  * @param err
  * @returns {any}
  */
	public handleAuthError(err: HttpErrorResponse): Observable<any> {
		//handle your auth error or rethrow
		if (err.status === 401) {
			//navigate /delete cookies or whatever
			console.log('handled error ' + err.status);
			this.tokenStorage.clear();
			this.router.navigate(['login']);
			// if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
			return of(err.message);
		}
		else if (err.status === 403) {
			//navigate /delete cookies or whatever
			console.log('handled error ' + err.status);
			this.router.navigate(['error/403']);
			// if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
			return of(err.message);
		}
		throw err;
	}
}
