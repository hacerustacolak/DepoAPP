// import { Company } from "../../merchant/companies/company.model";

export class VehicleBrandModel {
	id: number;
	brandName: string;
	modifiedDate: Date;
	description: string;
	fileName:string;
	filePath:string;
	fileSize:number;
	clear() {
		this.id = 0;
		this.brandName = '';
		this.modifiedDate = new Date();
		this.description = '';
		this.fileName = '';
		this.fileSize = 0;
		this.filePath = '';
	}
}

