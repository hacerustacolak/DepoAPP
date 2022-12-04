import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild, } from '@angular/core';
import { LayoutConfigService } from './core/services/layout-config.service';
import { ClassInitService } from './core/services/class-init.service';
import { TranslationService } from './core/services/translation.service';
import * as objectPath from 'object-path';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { PageConfigService } from './core/services/page-config.service';
import { filter } from 'rxjs/operators';
import { SplashScreenService } from './core/services/splash-screen.service';
import { AclService } from './core/services/acl.service';
// language list
import { locale as trLang } from './config/i18n/tr';

import { AuthenticationService } from './core/auth/authentication.service';
import { ReplaySubject } from 'rxjs';

// LIST KNOWN ISSUES
// [Violation] Added non-passive event listener; https://github.com/angular/angular/issues/8866

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'body[m-root]',
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, OnInit {
	title = 'Viases';

	@HostBinding('style') style: any;
	@HostBinding('class') classes: any = '';

	@ViewChild('splashScreen', { read: ElementRef })
	splashScreen: ElementRef;
	splashScreenImage: string;

	constructor(
		private layoutConfigService: LayoutConfigService,
		private classInitService: ClassInitService,
		private sanitizer: DomSanitizer,
		private translationService: TranslationService,
		private router: Router,
		private pageConfigService: PageConfigService,
		private splashScreenService: SplashScreenService,
		private aclService: AclService,
		private authService: AuthenticationService
	) {
		// subscribe to class update event
		this.classInitService.onClassesUpdated$.subscribe(classes => {
			// get body class array, join as string classes and pass to host binding class
			setTimeout(() => this.classes = classes.body.join(' '));
		});

		this.layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			this.classInitService.setConfig(model);

			this.style = '';
			if (objectPath.get(model.config, 'self.layout') === 'boxed') {
				const backgroundImage = objectPath.get(model.config, 'self.background');
				if (backgroundImage) {
					this.style = this.sanitizer.bypassSecurityTrustStyle('background-image: url(' + objectPath.get(model.config, 'self.background') + ')');
				}
			}

			// splash screen image
			this.splashScreenImage = objectPath.get(model.config, 'loader.image');
		});

		// register translations
		this.translationService.loadTranslations(trLang);
		// override config by router change from pages config
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.layoutConfigService.setModel({ page: objectPath.get(this.pageConfigService.getCurrentPageConfig(), 'config') }, true);
			});
	}

	ngOnInit(): void {
		
	}

	ngAfterViewInit(): void {
		if (this.splashScreen) {
			this.splashScreenService.init(this.splashScreen.nativeElement);
		}
	}
}
