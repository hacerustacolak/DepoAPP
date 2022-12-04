import { Injectable } from '@angular/core';
import { ConfigData } from '../interfaces/config-data';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as objectPath from 'object-path';
import { Router, NavigationStart } from '@angular/router';
import { MenuConfig } from '../../config/menu';
import { NgxRolesService, NgxPermissionsService } from 'ngx-permissions';

@Injectable()
export class MenuConfigService {
	public configModel: MenuConfig = new MenuConfig();
	public onMenuUpdated$: BehaviorSubject<MenuConfig> = new BehaviorSubject(
		this.configModel
	);
	menuHasChanged: any = false;

	constructor(
		private router: Router,
		private roleService: NgxRolesService,
		private permissionService: NgxPermissionsService) {	

		this.router.events
			.pipe(filter(event => event instanceof NavigationStart))
			.subscribe(event => {
				if (this.menuHasChanged) {
					this.resetModel();
				}
			});
	}

	setModel(menuModel: MenuConfig) {
		this.configModel = Object.assign(this.configModel, menuModel);
		this.onMenuUpdated$.next(this.configModel);
		this.menuHasChanged = true;
	}

	resetModel() {
		this.configModel = new MenuConfig();
		this.filterMenu(this.configModel.config.aside.items);
		this.onMenuUpdated$.next(this.configModel);
		this.menuHasChanged = false;
	}	

	private filterMenu(menuArr: any[]) {
		for (let i = 0; i < menuArr.length; i++) {

			if (menuArr[i].submenu) {
				this.filterMenu(menuArr[i].submenu);
			}

			if (menuArr[i].only) {
				let onlyArr: string[] = menuArr[i].only;
				let isfound: boolean = false;

				for (let j = 0; j < onlyArr.length; j++) {
					if (this.roleService.getRole(onlyArr[j]) || this.permissionService.getPermission(onlyArr[j])) {
						isfound = true;
						break;
					}
				}

				if (!isfound) {
					menuArr.splice(i, 1);
					i--;
				}
			};
		}
	}
}
