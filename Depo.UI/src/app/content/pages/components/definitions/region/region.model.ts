// import { Company } from "../../merchant/companies/company.model";

export class RegionModel {
	id: number;
	regionName: string;
	phoneNumber: string;
	address: string;
	cityId: number[];

	clear() {
		this.id = 0;
		this.regionName = '';
		this.phoneNumber = '';
		this.address = '';
		this.cityId = [];
	}
}

