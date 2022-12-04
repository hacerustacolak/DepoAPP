// import { Company } from "../../merchant/companies/company.model";

export class CompanyModel {
	id: number;
	name: string;
	groupName: string;
	groupId: number;
	description:string;

	clear() {
		this.id = 0;
		this.name = '';
		this.groupName = '';
		this.groupId = 0;
		this.description = '';
	}
}

