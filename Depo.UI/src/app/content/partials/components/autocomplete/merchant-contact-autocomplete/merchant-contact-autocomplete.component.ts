import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';
import { MerchantService } from '../../../../pages/components/crm/merchant/merchant.service';


/**
 * @title Highlight the first autocomplete option
 */
@Component({
	selector: 'merchant-contact-autocomplete',
	templateUrl: './merchant-contact-autocomplete.component.html',
	providers: [MerchantService]
})
export class MerchantContactAutocompleteComponent implements OnInit {
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
	@Input() merchantId: BehaviorSubject<number>;

	model: number;

	onChangeModel(model: number) {
		this.modelSubject.next(model);
	}

	constructor(private merchantService: MerchantService,
		private translateService: TranslateService,
		private cdr: ChangeDetectorRef) {
		this.placeholder = this.translateService.instant('CRM.MERCHANT.CONTACT.SELF');
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
		this.merchantService.getAllContact(this.merchantId.value).subscribe((res: ApiResponseModel<any[]>) => {
			this.options = res.data;
			this.filtredOptions.next(this.options.slice());
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

		return this.options.filter(option => option.name.toLowerCase().includes(value));
	}
}
