import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource } from '../../../../../core/data-sources/_base.datasource';
import { QueryParamsModel } from '../../../../../core/models/query-params.model';
import { QueryResultsModel } from '../../../../../core/models/query-results.model';
import { CompanyService } from './company.service';


export class CompanyDataSource extends BaseDataSource {
	constructor(private companyService: CompanyService) {
		super();
	}

	load(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.companyService.find(queryParams).pipe(
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
