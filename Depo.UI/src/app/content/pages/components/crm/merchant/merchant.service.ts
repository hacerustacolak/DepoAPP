import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HttpUtilsService } from '../../../../../core/services/http-utils.service';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';
import { MerchantContract, MerchantDetailModel, MerchantInterview, MerchantModel, MerchantOffer, MerchantOfferFile, MerchantPerson } from './merchant.model';

@Injectable()
export class MerchantService {
	constructor(
		public http: HttpClient,
		private httpUtils: HttpUtilsService
	) { }

	API_URL = this.httpUtils.baseApiUrl;
	API_MERCHANT_ENDPOINT = this.API_URL + '/api/merchant';

	httpHeaders = this.httpUtils.getHTTPHeaders();

	getAll(): Observable<MerchantModel[]> {
		return this.http.get<MerchantModel[]>(this.API_MERCHANT_ENDPOINT, { headers: this.httpHeaders });
	}

	find(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_MERCHANT_ENDPOINT + '/find', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	findContact(queryParams: QueryParamsModel, id: number): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_MERCHANT_ENDPOINT + '/find/' + id, {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	findInterview(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_MERCHANT_ENDPOINT + '/find-interview', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	findContract(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_MERCHANT_ENDPOINT + '/find-contract', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	findOffer(queryParams: QueryParamsModel): Observable<any> {
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<ApiResponseModel<QueryResultsModel>>(this.API_MERCHANT_ENDPOINT + '/find-offer', {
			headers: this.httpHeaders,
			params: httpParams
		});
	}

	getAllContact(id: number): Observable<any> {
		return this.http.get<any>(this.API_MERCHANT_ENDPOINT + '/contact/' + id, { headers: this.httpHeaders });
	}

	createInterview(model: MerchantInterview): Observable<any> {
		return this.http.post(this.API_MERCHANT_ENDPOINT + '/interview/' + model.merchantId, model, { headers: this.httpHeaders });
	}

	updateInterview(model: MerchantInterview): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/interview/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	deleteInterview(id: number): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/interview/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	create(model: MerchantModel): Observable<any> {
		return this.http.post(this.API_MERCHANT_ENDPOINT, model, { headers: this.httpHeaders });
	}

	update(model: MerchantModel): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	delete(id: number): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	getInterviewTypesAll(): Observable<any> {
		return this.http.get<any>(this.API_MERCHANT_ENDPOINT + '/interviewtypes', { headers: this.httpHeaders });
	}

	getDetailById(id: number): Observable<ApiResponseModel<MerchantDetailModel>> {
		return this.http.get<ApiResponseModel<MerchantDetailModel>>(this.API_MERCHANT_ENDPOINT + '/detail/' + id, {
			headers: this.httpHeaders,
		});
	}
	updateDetail(model: MerchantDetailModel): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/detail/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}
	createPerson(model: any): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/contact/${model.merchantId}`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}
	updatePerson(model: any): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/contact/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}
	deletePerson(id: number): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/contact/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}
	updateContract(model: MerchantContract): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/contract/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}
	createContract(model: MerchantContract): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/contract/${model.merchantId}`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}
	deleteContract(id: number): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/contract/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}
	createOffer(model: MerchantOffer): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/offer/${model.merchantId}`;
		return this.http.post(url, model, { headers: this.httpHeaders });
	}
	updateOffer(model: MerchantOffer): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/offer/${model.id}`;
		return this.http.put(url, model, { headers: this.httpHeaders });
	}

	deleteOffer(id: number): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/offer/${id}`;
		return this.http.delete(url, { headers: this.httpHeaders });
	}

	getDocumentByFilepath(model: MerchantOfferFile): Observable<any> {
		const url = `${this.API_MERCHANT_ENDPOINT}/getDocumentByFilepath`;
		return this.http.post(url, model, { headers: this.httpHeaders, responseType: 'blob' });
	}
}
