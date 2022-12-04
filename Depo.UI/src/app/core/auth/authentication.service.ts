import { Observable, Subject, from, throwError, Observer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { AuthService } from 'ngx-auth';
import { TokenStorage } from './token-storage.service';
import { UtilsService } from '../services/utils.service';
import { AccessData, Credential, BmsUser, ClaimTypes } from './authentication.model';
import decode from 'jwt-decode';
import { HttpUtilsService } from '../services/http-utils.service';
import { Router } from '@angular/router';
import { sha256 } from 'js-sha256';

@Injectable()
export class AuthenticationService implements AuthService {
	constructor(
		private http: HttpClient,
		private tokenStorage: TokenStorage,
		private util: UtilsService,
		private httpUtils: HttpUtilsService,
		private router: Router
	) {
		this.onCredentialUpdated$ = new Subject();
		this.onCredentialUpdated$.subscribe(accessData => {
			this.getCurrentUser();
		});
	}

	API_URL = this.httpUtils.baseApiUrl;

	API_ENDPOINT_TOKEN = '/api/Authentication/authenticate';
	API_ENDPOINT_REFRESH = '/api/Authentication/refresh';
	API_ENDPOINT_REGISTER = '/api/Authentication/register';
	API_ENDPOINT_FORGOTPASSWORD = '/api/Authentication/forgotpwd';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	public onCredentialUpdated$: Subject<AccessData>;

	/**
	 * Check, if user already authorized.
	 * @description Should return Observable with true or false values
	 * @returns {Observable<boolean>}
	 * @memberOf AuthService
	 */
	public isAuthorized(): Observable<boolean> {
		let currentDate = new Date();
		currentDate.setUTCMinutes(currentDate.getUTCMinutes() - this.httpUtils.keepAliveTimeout);

		if (this.httpUtils.keepAliveDate < currentDate) {
			this.logout(true);
		}
		else {
			this.httpUtils.keepAliveDate = new Date();
		}

		return this.tokenStorage.getAccessToken().pipe(map(token => !!token));
	}

	/**
	 * Get access token
	 * @description Should return access token in Observable from e.g. localStorage
	 * @returns {Observable<string>}
	 */
	public getAccessToken(): Observable<string> {
		return this.tokenStorage.getAccessToken();
	}

	/**
	 * Function, that should perform refresh token verifyTokenRequest
	 * @description Should be successfully completed so interceptor
	 * can execute pending requests or retry original one
	 * @returns {Observable<any>}
	 */
	public refreshToken(): Observable<AccessData> {
		return this.tokenStorage.getRefreshToken().pipe(
			switchMap((refreshToken: string) => {
				return this.http.get<AccessData>(this.API_URL + this.API_ENDPOINT_REFRESH + '?' + this.util.urlParam(refreshToken));
			}),
			tap(this.saveAccessData.bind(this)),
			catchError(err => {
				this.logout();
				return throwError(err);
			})
		);
	}

	/**
	 * Function, checks response of failed request to determine,
	 * whether token be refreshed or not.
	 * @description Essentialy checks status
	 * @param {Response} response
	 * @returns {boolean}
	 */
	public refreshShouldHappen(response: HttpErrorResponse): boolean {
		return response.status === 401;
	}

	/**
	 * Verify that outgoing request is refresh-token,
	 * so interceptor won't intercept this request
	 * @param {string} url
	 * @returns {boolean}
	 */
	public verifyTokenRequest(url: string): boolean {
		return url.endsWith(this.API_ENDPOINT_REFRESH);
	}

	/**
	 * Get current user
	 * @param
	 * @returns {Observable<any>}
	 */
	public getCurrentUser(): Observable<any> {
		return Observable.create((observer: Observer<any>) => {
			this.isAuthorized().subscribe(auth => {
				if (auth) {
					this.getAccessToken().subscribe(token => {
						if (token) {
							let data = decode(token);

							let roles = data[ClaimTypes.Role];

							let permissions = data[ClaimTypes.Permission];

							observer.next({
								id: data[ClaimTypes.Id],
								roles: roles instanceof Array ? roles : [roles],
								permissions: permissions instanceof Array ? permissions : [permissions],
								name: data[ClaimTypes.Name],
								email: data[ClaimTypes.Email],
								version: data[ClaimTypes.Version],
								data: data
							});
						}
					});
				}
			});

			observer.complete();
		});
	}

	/**
	 * create jwt token
	 * @param {Credential} credential
	 * @returns {String}
	 */
	public login(credential: Credential): Observable<any> {
		// Expecting response from API
		// tslint:disable-next-line:max-line-length
		//

		credential.Password = sha256(credential.Password);
		return this.http.post<BmsUser>(this.API_URL + this.API_ENDPOINT_TOKEN, credential, {
			headers: {
				'Content-Type': 'application/json'
			}
		}).pipe(
			tap(this.saveAccessData.bind(this)),
			catchError(this.handleError('login', []))
		);
	}

	/**
	 * Handle Http operation that failed.
	 * Let the app continue.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			console.log('operation:', operation);
			// Let the app keep running by returning an empty result.
			return from(result);
		};
	}

	/**
	 * Logout
	 */
	public logout(refresh?: boolean): void {
		this.tokenStorage.clear();
		if (refresh) {
			location.reload(true);
		}
	}

	/**
	 * Save access data in the storage
	 * @private
	 * @param {AccessData} data
	 */
	private saveAccessData(res: any) {
		if (res.isSuccess) {

			this.httpUtils.setKeepAliveDate();

			let data = <AccessData>res.data;
			this.tokenStorage
				.setAccessToken(data.accessToken)
				.setRefreshToken(data.refreshToken);

			this.onCredentialUpdated$.next(data);
		}
	}

	/**
	 * Submit registration request
	 * @param {Credential} credential
	 * @returns {Observable<any>}
	 */
	public register(credential: Credential): Observable<any> {
		// dummy token creation
		credential = Object.assign({}, credential, {
			accessToken: 'access-token-' + Math.random(),
			refreshToken: 'access-token-' + Math.random(),
			roles: ['USER'],
		});
		return this.http.post(this.API_URL + this.API_ENDPOINT_REGISTER, credential)
			.pipe(catchError(this.handleError('register', []))
			);
	}

	/**
	 * Submit forgot password request
	 * @param {Credential} credential
	 * @returns {Observable<any>}
	 */

	 public requestPassword(model: any): Observable<any> {
		const url = `${this.API_URL}/api/Users/forgot-password`;
		return this.http.post(url,model,{ headers: this.httpHeaders });
	} 

	public changePassword(model) {
		const url = `${this.API_URL}/api/Users/change-password`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}
	public changePasswordInPanel(model) {
		let httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${this.API_URL}/api/Users/change-password-in-panel`;
		return this.http.post(url, model, { headers: httpHeaders });
	}
	public newPassword(model){
		const url = `${this.API_URL}/api/Users/new-password`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}

	public confirmCode(model: any): Observable<any> {
		const url = `${this.API_URL}/api/Users/forgot-password-confirm-code`;
		return this.http.post(url,model,{ headers: this.httpHeaders });
	} 

	public version() {
		return this.getCurrentUser();
	}
}
