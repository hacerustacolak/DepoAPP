import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HttpUtilsService } from '../../../../../core/services/http-utils.service';
import { RegionModel } from './region.model';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';

@Injectable()
export class RegionService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_REGION_ENDPOINT = this.API_URL + '/api/region';
	API_CITY_ENDPOINT = this.API_URL + '/api/city';
	API_WAREHOUSE_ENDPOINT = this.API_URL + '/api/warehouse';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<any> {
		return this.http.get<ApiResponseModel<RegionModel[]>>(this.API_REGION_ENDPOINT, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_REGION_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: RegionModel): Observable<any> {
		return this.http.post(this.API_REGION_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: RegionModel): Observable<any> {
		const url = `${this.API_REGION_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_REGION_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	getAllCity(): Observable<any> {
		return this.http.get<any>(this.API_CITY_ENDPOINT, { headers: this.httpHeaders });
	}

	getAllWarehouse(): Observable<any> {
		return this.http.get<any>(this.API_WAREHOUSE_ENDPOINT, { headers: this.httpHeaders });
	}
}
