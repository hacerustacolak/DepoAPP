export class QueryResultsModel {
	// fields
	items: any[];
	totalCount: number;
	errorMessage: string;
	allIds: number[];

	constructor(_items: any[] = [], _errorMessage: string = '', _allIds: number[]=[]) {
		this.items = _items;
		this.totalCount = _items.length;
		this.allIds = _allIds;
	}
}
