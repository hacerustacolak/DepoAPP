import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { SubheaderService } from '../../../core/services/layout/subheader.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-subheader',
	templateUrl: './subheader.component.html',
	styleUrls: ['./subheader.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubheaderComponent implements OnInit {
	constructor(public subheaderService: SubheaderService, public translate: TranslateService) { }

	ngOnInit(): void {
		
	}
}
