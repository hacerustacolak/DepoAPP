import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';
import { CompetitorService } from '../../../../pages/components/definitions/competitor/competitor.service';


/**
 * @title Highlight the first autocomplete option
 */
@Component({
	selector: 'competitor-autocomplete',
	templateUrl: './competitor-autocomplete.component.html',
	providers: [CompetitorService]
})
export class CompetitorAutocompleteComponent implements OnInit {
	isLoading = false;
	isErasable = true;

	selectFilterControl = new FormControl();

	options: any[] = [];
	filtredOptions = new ReplaySubject<any[]>(1);

	/** Subject that emits when the component has been destroyed. */
	private _onDestroy = new Subject<void>();

	@Input() placeholder: string;
	@Input() type: string;
	@Input() isDisable: boolean;

	@Input() modelSubject: BehaviorSubject<number>;

	model: number;

	onChangeModel(model: number) {
		this.modelSubject.next(model);
	}

	constructor(private competitorService: CompetitorService,
		private translateService: TranslateService,
		private cdr: ChangeDetectorRef) {
		this.placeholder = this.translateService.instant('DEFINITION.COMPETITOR.NAME');
	}

	ngOnInit() {
		this.loadOptions();
		this.selectFilterControl.valueChanges
			.pipe(takeUntil(this._onDestroy))
			.subscribe(res => {
				this.filtredOptions.next(this.filterOptions(res).slice());
			});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['modelSubject']) {
			if (this.modelSubject != null) {
				this.modelSubject.subscribe((val) => {
					this.model = val;
				});
			}
		}
	}

	ngOnDestroy() {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	loadOptions(): any {
		this.competitorService.getAll().subscribe((res: ApiResponseModel<any[]>) => {
			this.options = res.data;
			this.filtredOptions.next(this.options.slice());
			if(this.type != 'ALL' && this.options.length === 1){
				this.modelSubject.next(this.options[0].id);
			}
			if(this.type === 'ALL'){
				this.modelSubject.next(0);
			}
		});
	}

	filterOptions(value: string): any[] {
		if (!this.options) {
			return;
		}

		if (!value) {
			return this.options.slice();
		}

		value = value.toLowerCase();

		return this.options.filter(option => option.competitorName.toLowerCase().includes(value));
	}
}
