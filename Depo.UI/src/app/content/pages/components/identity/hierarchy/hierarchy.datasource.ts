import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource } from '../../../../../core/data-sources/_base.datasource';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { HierarchyService } from './hierarchy.service';


export class HierarchyDataSource extends BaseDataSource {
	constructor(private hierarchyService: HierarchyService) {
		super();
	}

	load(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.hierarchyService.find(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.data.items);
				this.allIdsSubject.next(res.data.allIds);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}
}
