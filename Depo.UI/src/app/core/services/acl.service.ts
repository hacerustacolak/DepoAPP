import { AclModel } from '../models/acl';
import { Injectable } from '@angular/core';
import { ConfigData } from '../interfaces/config-data';
import { NgxRolesService, NgxPermissionsService } from 'ngx-permissions';
import { from, BehaviorSubject, Subject } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import { AuthenticationService } from '../auth/authentication.service';
import { MenuConfigService } from './menu-config.service';
import { Router, NavigationStart } from '@angular/router';
import { TokenStorage } from '../auth/token-storage.service';

@Injectable()
export class AclService implements ConfigData {
	public aclModel: AclModel;
	public onAclUpdated$ = new BehaviorSubject<AclModel>(new AclModel());

	constructor(
		private roleService: NgxRolesService,
		private permissionService: NgxPermissionsService,
		private authService: AuthenticationService,
		private tokenStorage: TokenStorage,
		private menuConfigService: MenuConfigService) {

		this.authService.getCurrentUser().subscribe(user => {
			this.setRolesWithPermissions(user);
			console.log('current-user:', user);
		});

		// subscribe to credential changed, eg. after login response
		this.authService.onCredentialUpdated$
			.pipe(mergeMap(accessData => this.authService.getCurrentUser()))
			.subscribe(user => this.setRolesWithPermissions(user));

		// subscribe to acl data observable
		this.onAclUpdated$.subscribe(acl => {
			const permissions = Object.assign([], acl.permissions, []);
			const roles = Object.assign({}, acl.roles, {
				LogIn: () => {
					return this.authService.isAuthorized().toPromise();
				}
			});

			this.roleService.addRoles(roles);
			this.permissionService.loadPermissions(permissions);

			this.menuConfigService.resetModel();
		});
	}

	/**
	 * Set AclModel and fire off event that all subscribers will listen to
	 * @param aclModel
	 */
	setModel(aclModel: AclModel): any {
		this.onAclUpdated$.next(aclModel);
	}

	setRolesWithPermissions(data: any): any {
		if (data != null) {
			let aclModel = new AclModel();

			if (data.roles != null) {
				let roles = {};
				data.roles.forEach(element => {
					roles[element] = []
				});
				aclModel.roles = roles;
			}

			if (data.permissions != null) {
				aclModel.permissions = data.permissions;
			}

			this.setModel(aclModel);
		}
	}
}
