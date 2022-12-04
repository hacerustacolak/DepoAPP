import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpUtilsService } from './http-utils.service';

@Injectable()
export class AddressService {
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) {

	}

	httpHeaders = this.httpUtils.getHTTPHeaders();


	public getCountries(): Observable<any> {
		return this.http.get("./assets/address/countries.json", { headers: this.httpHeaders });
	}

	public getStates(): Observable<any> {
		return this.http.get("./assets/address/states.json", { headers: this.httpHeaders });
	}

	public getCities(): Observable<any> {
		return this.http.get("./assets/address/cities.json", { headers: this.httpHeaders });
	}
}
