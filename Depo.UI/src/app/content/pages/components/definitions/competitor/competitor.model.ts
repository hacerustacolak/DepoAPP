// import { Company } from "../../merchant/companies/company.model";

export class CompetitorModel {
	id: number;
	competitorName: string;
	modifiedDate: Date;
	createDate: Date;
	clear() {
		this.id = 0;
		this.competitorName = '';
		this.modifiedDate = new Date();
		this.createDate = new Date();
	}
}

