// import { Company } from "../../merchant/companies/company.model";

export class UserModel {
	id: number;
	email: string;
	password: string;
	name: string;
	surname: string;
	phoneNumber: string;
	passwordHash: string;
	regionName: string;
	regionId: number;

	clear() {
		this.id = 0;
		this.name = '';
		this.surname = '';
		this.email = '';
		this.password = '';
		this.phoneNumber = '';
		this.passwordHash = '';
		this.regionName = '';
		this.regionId = 0;
	}
}

export interface UserRoleUpdateModel {
	userId: number;
	roles: number[];
}

export interface UserHierarchyUpdateModel {
	userId: number;
	hierarchies: number[];
}

