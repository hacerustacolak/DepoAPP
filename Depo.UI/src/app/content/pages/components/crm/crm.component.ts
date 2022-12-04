import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'crm',
	templateUrl: './crm.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrmComponent implements OnInit {
	constructor() { }

	ngOnInit() { }
}
