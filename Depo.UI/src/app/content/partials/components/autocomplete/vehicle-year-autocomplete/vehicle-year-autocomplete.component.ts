import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


/**
 * @title Highlight the first autocomplete option
 */
@Component({
	selector: 'vehicle-year-autocomplete',
	templateUrl: './vehicle-year-autocomplete.component.html'
})
export class VehicleYearAutocompleteComponent implements OnInit {
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
	@Input() name: BehaviorSubject<string>;
	model: number;

	onChangeModel(model: number) {
		this.modelSubject.next(model);
	}

	constructor(private translateService: TranslateService,
		private cdr: ChangeDetectorRef) {
			this.placeholder = this.translateService.instant('DEFINITION.VEHICLE.VEHICLE.YEAR');
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
		let data: number[] = [];
		for (var i = new Date().getFullYear(); i >= 2000 ; i--) {
			data.push(i);
		}

		this.options = data;
		this.filtredOptions.next(this.options.slice());
	}

	filterOptions(value: string): any[] {
		if (!this.options) {
			return;
		}

		if (!value) {
			return this.options.slice();
		}

		value = value.toLowerCase();

		return this.options.filter(option => option.toString().toLowerCase().includes(value));
	}
}
