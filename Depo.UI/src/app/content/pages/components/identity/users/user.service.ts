import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HttpUtilsService } from '../../../../../core/services/http-utils.service';
import { UserHierarchyUpdateModel, UserModel, UserRoleUpdateModel } from './user.model';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';

@Injectable()
export class UserService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_USER_ENDPOINT = this.API_URL + '/api/Users';
	API_USER__ROLE_ENDPOINT = this.API_URL + '/api/UserRoles';
	API_USER__HIERARCHY_ENDPOINT = this.API_URL + '/api/UserHierarchies';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<ApiResponseModel<UserModel[]>> {
		return this.http.get<ApiResponseModel<UserModel[]>>(this.API_USER_ENDPOINT, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_USER_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: UserModel): Observable<any> {
		return this.http.post(this.API_USER_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: UserModel): Observable<any> {
		const url = `${this.API_USER_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_USER_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	getUserRoles(id: number): Observable<ApiResponseModel<any>> {
		const url = `${this.API_USER__ROLE_ENDPOINT}/${id}`;
		return this.http.get<ApiResponseModel<any>>(url, { headers: this.httpHeaders });
	}

	updateUserRoles(model: UserRoleUpdateModel) {
		return this.http.post(this.API_USER__ROLE_ENDPOINT, model, { headers: this.httpHeaders });
	}

	changeStatus(id: number): Observable<any> {
		const url = `${this.API_USER_ENDPOINT}/changestatus/${id}`;
		return this.http.put(url, null, { headers: this.httpHeaders });
	}

	changePassword(model){
		const url = `${this.API_USER_ENDPOINT}/change-password`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}

	getHierarchies(id: number): Observable<any> {
		const url = `${this.API_USER__HIERARCHY_ENDPOINT}/${id}`;
		return this.http.get(url, { headers: this.httpHeaders });
	}

	updateUserHierarchies(model: UserHierarchyUpdateModel) {
		return this.http.post(this.API_USER__HIERARCHY_ENDPOINT, model, { headers: this.httpHeaders });
	}

	getUserRolesOfFinance(): Observable<ApiResponseModel<any>> {
		const url = `${this.API_USER__ROLE_ENDPOINT}/finance`;
		return this.http.get<ApiResponseModel<any>>(url, { headers: this.httpHeaders });
	}
}
