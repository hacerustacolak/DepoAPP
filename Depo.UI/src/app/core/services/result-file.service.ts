import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpUtilsService } from "./http-utils.service";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ResultFileService {
    constructor(
        public http: HttpClient,
        private httpUtils: HttpUtilsService
    ) {

    }

    API_URL = this.httpUtils.baseApiUrl + '/api/File';

    httpHeaders = this.httpUtils.getHTTPHeaders();

	getFile(filePath: string, bucketName: string = 'content'): Observable<Blob> {
		let url = `${this.API_URL}/resultfile/${filePath}/${bucketName}`;
        return this.http.get(url, { responseType: 'blob' });
    }
}
