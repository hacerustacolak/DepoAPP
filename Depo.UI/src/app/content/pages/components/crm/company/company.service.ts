import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HttpUtilsService } from '../../../../../core/services/http-utils.service';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';
import { CompanyModel } from './company.model';

@Injectable()
export class CompanyService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_REGION_ENDPOINT = this.API_URL + '/api/company';
	API_CITY_ENDPOINT = this.API_URL + '/api/city';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<ApiResponseModel<CompanyModel[]>> {
		return this.http.get<ApiResponseModel<CompanyModel[]>>(this.API_REGION_ENDPOINT, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_REGION_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: CompanyModel): Observable<any> {
		return this.http.post(this.API_REGION_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: CompanyModel): Observable<any> {
		const url = `${this.API_REGION_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_REGION_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}
}
