// import { Company } from "../../merchant/companies/company.model";

export class VehicleModelModel {
	id: number;
	modelName: string;
	modifiedDate: Date;
	description: string;
	vehicleBrandId:number;
	vehicleBrandName:string;
    maintenancePeriodKM:number;
	maintenancePeriodYear:number;
	clear() {
		this.id = 0;
		this.vehicleBrandName = '';
		this.modifiedDate = new Date();
		this.description = '';
		this.modelName = '';
		this.vehicleBrandId = 0;
		this.maintenancePeriodKM = 0;
		this.maintenancePeriodYear = 0;
	}
}

