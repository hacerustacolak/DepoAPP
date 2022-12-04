import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ApiResponseModel } from '../../../../../core/models/api-response.model';
import { VehicleModelService } from '../../../../pages/components/definitions/vehicle/vehicleModel/vehicleModel.service';


/**
 * @title Highlight the first autocomplete option
 */
@Component({
	selector: 'vehicle-model-autocomplete',
	templateUrl: './vehicle-model-autocomplete.component.html',
	providers: [VehicleModelService]
})
export class VehicleModelAutocompleteComponent implements OnInit {
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
	@Output() modelChange = new EventEmitter<number>();
	@Input() modelSubject: BehaviorSubject<number>;
	@Input() model: number;

	onChangeModel(model: number) {
		this.model = model;
		this.modelChange.emit(model);
	}

	constructor(private vehicleModelService: VehicleModelService,
		private translateService: TranslateService,
		private cdr: ChangeDetectorRef) {
		this.placeholder = this.translateService.instant('DEFINITION.VEHICLE.MODEL.NAME');
	}

	ngOnInit() {
		this.selectFilterControl.valueChanges
			.pipe(takeUntil(this._onDestroy))
			.subscribe(res => {
				this.filtredOptions.next(this.filterOptions(res).slice());
			});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.modelSubject != null) {
			this.modelSubject.subscribe((brandId: number) => {
				this.loadOptions(brandId);
			});
		}
		else {
			this.loadOptions(0);
		}
	}

	ngOnDestroy() {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	loadOptions(brandId:number): any {
		this.vehicleModelService.getAll(brandId).subscribe((res: ApiResponseModel<any>) => {
			this.options = res.data;
			this.filtredOptions.next(this.options.slice());
			if (this.options.length === 1) {
				this.onChangeModel(this.options[0].id);
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

		return this.options.filter(option => option.modelName.toLowerCase().includes(value));
	}
}
