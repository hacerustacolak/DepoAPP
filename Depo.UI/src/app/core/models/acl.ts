import { ConfigModel } from '../interfaces/config';
import { AuthenticationService } from '../auth/authentication.service';

export interface AclInterface {
	permissions: string[];
	roles: any;
}

export class AclModel implements AclInterface, ConfigModel {
	public config: any;

	// store an object of current user roles
	public permissions: string[] = [];

	// store an object of current user roles
	public roles: any = {};

	constructor() {
		
	}
}
