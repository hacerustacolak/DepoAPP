import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as XLSX from 'xlsx';

@Injectable({
    providedIn: "root"
})
export class XlsxService {
    constructor() {

    }

    downloadExcel(filename, data): Observable<any> {
        return Observable.create(observer => {

            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

            //XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            XLSX.writeFile(workbook, filename + '.xlsx');

            observer.next(true);
            observer.complete();
        });
    }

    convertToJson(file: File) {
        return Observable.create(observer => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => {
                let arrayBuffer = <ArrayBuffer>fileReader.result;
                var data = new Uint8Array(arrayBuffer);
                var arr = new Array();
                for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                var bstr = arr.join("");
                var workbook = XLSX.read(bstr, {type:"binary"});
                var first_sheet_name = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[first_sheet_name];
                let result = XLSX.utils.sheet_to_json(worksheet,{raw:true});

                observer.next(result);
                observer.complete();
            }
            fileReader.readAsArrayBuffer(file);
        });
       
    }
}
