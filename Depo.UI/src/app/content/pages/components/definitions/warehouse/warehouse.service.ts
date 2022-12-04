import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HttpUtilsService } from '../../../../../core/services/http-utils.service';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';
import { WarehouseModel } from './warehouse.model';

@Injectable()
export class WarehouseService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_COMPETITOR_ENDPOINT = this.API_URL + '/api/warehouse';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<ApiResponseModel<WarehouseModel[]>> {
		return this.http.get<ApiResponseModel<WarehouseModel[]>>(this.API_COMPETITOR_ENDPOINT, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_COMPETITOR_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: WarehouseModel): Observable<any> {
		return this.http.post(this.API_COMPETITOR_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: WarehouseModel): Observable<any> {
		const url = `${this.API_COMPETITOR_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_COMPETITOR_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}
}
