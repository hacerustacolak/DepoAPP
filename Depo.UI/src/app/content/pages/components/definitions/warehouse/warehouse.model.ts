// import { Company } from "../../merchant/companies/company.model";

export class WarehouseModel {
	id: number;
	warehouseName: string;
	logoCode: string;
	city: string;
	address: string;
	phone: string;
	representative: string; 
	clear() {
		this.id = 0;
		this.warehouseName = '';
		this.logoCode = '';
		this.city = '';
		this.address = '';
		this.phone = '';
		this.representative = ''; 
	}
}

