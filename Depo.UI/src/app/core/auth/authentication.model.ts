export interface Credential {
	Email: string;
	Password: string;
}

export interface AccessData {
	accessToken: string;
	refreshToken: string;
}

export interface BmsSearchInput {
	key: string;
	value: string;
}

export interface BmsUser {
	email: string;
	name: string;
	surname: string;
	phoneNumber: string;
	registrationTime: Date;
	cityId: number;
	address: string;
	isActive: boolean;
	token: string;
	refreshToken: string;
	roles: string[];
}

export enum ClaimTypes {
	Id = 'id',
	Name = 'name',
	Email = 'email',
	Role = 'role',
	Permission = 'permission',
	Version = 'version'
}
