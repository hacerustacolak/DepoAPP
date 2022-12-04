import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'definitions',
	templateUrl: './definitions.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefinitionsComponent implements OnInit {
	constructor() { }

	ngOnInit() { }
}
