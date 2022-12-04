import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource } from '../../../../../core/data-sources/_base.datasource';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { GroupService } from './group.service';


export class GroupDataSource extends BaseDataSource {
	constructor(private groupService: GroupService) {
		super();
	}

	load(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.groupService.find(queryParams).pipe(
			tap(res => {
				if (res.isSuccess) {
					this.entitySubject.next(res.data.items);
					this.paginatorTotalSubject.next(res.data.totalCount);
					this.allIdsSubject.next(res.data.allIds);
				}
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}
}
