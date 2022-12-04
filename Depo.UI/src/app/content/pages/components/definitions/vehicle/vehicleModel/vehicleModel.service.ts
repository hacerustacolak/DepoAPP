import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { HttpUtilsService } from '../../../../../../core/services/http-utils.service';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { VehicleModelModel } from './vehicleModel.model';

@Injectable()
export class VehicleModelService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_ENDPOINT = this.API_URL + '/api/vehicleModel';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(brandId:number): Observable<ApiResponseModel<VehicleModelModel[]>> {
		return this.http.get<any>(this.API_ENDPOINT+'/'+brandId, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: VehicleModelModel): Observable<any> {
		return this.http.post(this.API_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: VehicleModelModel): Observable<any> {
		const url = `${this.API_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}
}
