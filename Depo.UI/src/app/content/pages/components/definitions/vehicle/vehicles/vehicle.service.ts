import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { HttpUtilsService } from '../../../../../../core/services/http-utils.service';
import { QueryParamsModel } from '../../../../../../core/models/query-params.model';
import { ApiResponseModel } from '../../../../../../core/models/api-response.model';
import { QueryResultsModel } from '../../../../../../core/models/query-results.model';
import { VehicleFileModel, VehicleModel } from './vehicle.model';

@Injectable()
export class VehicleService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_ENDPOINT = this.API_URL + '/api/vehicle';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<ApiResponseModel<VehicleModel[]>> {
		return this.http.get<ApiResponseModel<VehicleModel[]>>(this.API_ENDPOINT, { headers: this.httpHeaders });
	}

	getSCVehicleTypeAll(): Observable<ApiResponseModel<any>> {
		return this.http.get<ApiResponseModel<any>>(this.API_ENDPOINT+'/vehicle-types', { headers: this.httpHeaders });
		
	}

	getVehicleTrackingDeviceCompanyAll(): Observable<ApiResponseModel<any>> {
		return this.http.get<ApiResponseModel<any>>(this.API_ENDPOINT+'/vehicle-tracking-device-company', { headers: this.httpHeaders });
		
	}
	
	getImage(file : VehicleFileModel): Observable<ApiResponseModel<any>> {
		return this.http.post<ApiResponseModel<any>>(this.API_ENDPOINT+'/getimagebyfilepath',file, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	create(model: VehicleModel): Observable<any> {
		return this.http.post(this.API_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: VehicleModel): Observable<any> {
		const url = `${this.API_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	getImageByFilepath(model: VehicleModel): Observable<any> {
		const url = `${this.API_ENDPOINT}/getimagebyfilepath`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}

	getImagesById(id: number): Observable<ApiResponseModel<any>> {
		return this.http.get<ApiResponseModel<any>>(this.API_ENDPOINT + '/images-' + id.toString(), { headers: this.httpHeaders });
	}
	
	getDocumentByFilepath(model: VehicleFileModel): Observable<any> {
		const url = `${this.API_ENDPOINT}/getDocumentByFilepath`;
		return this.http.post(url, model, { headers: this.httpHeaders, responseType: 'blob' });
	}
}
