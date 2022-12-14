import { GetObjectPipe } from '../../../core/pipes/get-object.pipe';
import { Component, OnInit, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayoutConfigService } from '../../../core/services/layout-config.service';
import * as objectPath from 'object-path';
import { AuthenticationService } from '../../../core/auth/authentication.service';

declare var require: any;

@Component({
	selector: 'm-footer',
	templateUrl: './footer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})


export class FooterComponent implements OnInit {
	@HostBinding('class') classes = 'm-grid__item m-footer';

	footerContainerClass$: BehaviorSubject<string> = new BehaviorSubject('');

	versionSubject: BehaviorSubject<string> = new BehaviorSubject('');

	constructor(
		private configService: LayoutConfigService,
		private authService: AuthenticationService
	) {
		this.configService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;

			let pageBodyClass = '';
			const selfLayout = objectPath.get(config, 'self.layout');
			if (selfLayout === 'boxed' || selfLayout === 'wide') {
				pageBodyClass += 'm-container--responsive m-container--xxl';
			} else {
				pageBodyClass += 'm-container--fluid';
			}
			this.footerContainerClass$.next(pageBodyClass);
		});
	}

	ngOnInit() {

		this.authService.version().subscribe(p => {
			this.versionSubject.next(p.version);
		});
		
	}
}
