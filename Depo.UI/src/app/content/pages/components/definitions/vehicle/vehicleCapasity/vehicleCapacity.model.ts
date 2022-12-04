// import { Company } from "../../merchant/companies/company.model";

export class VehicleCapacityModel {
	id: number;
	capacityName: string;
	modifiedDate: Date;
	description: string;
	vehicleTypeId:number;
	vehicleTypeName:string;

	clear() {
		this.id = 0;
		this.vehicleTypeName = '';
		this.modifiedDate = new Date();
		this.description = '';
		this.capacityName = '';
		this.vehicleTypeId = 0;
	}
}

