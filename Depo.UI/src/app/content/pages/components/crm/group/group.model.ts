// import { Company } from "../../merchant/companies/company.model";

export class GroupModel {
	id: number;
	name: string;
	modifiedDate: Date;
	createDate: Date;
	clear() {
		this.id = 0;
		this.name = '';
		this.modifiedDate = new Date();
		this.createDate = new Date();
	}
}

