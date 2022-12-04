import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HttpUtilsService } from '../../../../../core/services/http-utils.service';
import { HierarchyModel } from './hierarchy.model';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';

@Injectable()
export class HierarchyService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

    API_URL = this.httpUtils.baseApiUrl + '/api/Hierarchies';
	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<HierarchyModel[]> {
		return this.http.get<HierarchyModel[]>(this.API_URL);
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_URL + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: HierarchyModel): Observable<any> {
		return this.http.post(this.API_URL, model, { headers: this.httpHeaders });
	}

	update(model: HierarchyModel): Observable<any> {
		const url = `${this.API_URL}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_URL}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	bulkDelete(ids: number[] = []): Observable<any> {
		const body = { ids: ids };
		return this.http.put(this.API_URL, body, { headers: this.httpHeaders });
	}
}
