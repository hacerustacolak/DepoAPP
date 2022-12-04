import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'identity',
	templateUrl: './identity.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent implements OnInit {
	constructor() { }

	ngOnInit() { }
}
