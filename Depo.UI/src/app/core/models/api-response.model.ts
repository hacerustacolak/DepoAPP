export class ApiResponseModel<T> {
	// fields
	isSuccess: boolean;
	data: T;
	message: string;
	type: string;

	constructor(_isSuccess: boolean = false, _data: T = null, _message: string = '',_type: string = '') {
		this.isSuccess = _isSuccess;
		this.data = _data;
		this.message = _message;
		this.type = _type;
	}
}
