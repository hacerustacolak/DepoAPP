import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentityComponent } from './identity.component';
import { RoleService } from './roles/role.service';
import { RoleListComponent } from './roles/role-list/role-list.component';
import { RoleEditComponent } from './roles/role-edit/role-edit.component';
import { RolePermissionComponent } from './roles/role-permission/role-permission.component';
import { PartialsModule } from '../../../partials/partials.module';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { UserRoleComponent } from './users/user-role/user-role.component';
import { UserHierarchyComponent } from './users/user-hierarchy/user-hierarchy.component';
import { UserHierarchyNodeComponent } from './users/user-hierarchy/user-hierarchy-node/user-hierarchy-node.component';
import { UserService } from './users/user.service';
import { HierarchyNodeComponent } from './hierarchy/hierarchy-node/hierarchy-node.component';
import { HierarchyEditComponent } from './hierarchy/hierarchy-edit/hierarchy-edit.component';
import { HierarchyService } from './hierarchy/hierarchy.service';
import { HierarchyListComponent } from './hierarchy/hierarchy-list/hierarchy-list.component';


const routes: Routes = [
	{
		path: '',
		component: IdentityComponent, 
		children: [
			{
				path: 'roles',
				component: RoleListComponent
			},
			{
				path: 'users',
				component: UserListComponent
			},
			{
				path: 'hierarchy',
				component: HierarchyListComponent
			},
		]
	}
];

@NgModule({
	imports: [
		PartialsModule,
		RouterModule.forChild(routes)
	],
	entryComponents: [
		RoleEditComponent,
		UserEditComponent,
		UserRoleComponent,
		UserHierarchyComponent,
		UserHierarchyNodeComponent,
		HierarchyNodeComponent,
		HierarchyEditComponent,
	],
	providers: [
		RoleService,
		UserService,
		HierarchyService,
	],
	declarations: [
		IdentityComponent,
		RoleListComponent,
		RoleEditComponent,
		RolePermissionComponent,
		UserListComponent,
		UserEditComponent,
		UserRoleComponent,
		UserHierarchyComponent,
		UserHierarchyNodeComponent,
		HierarchyListComponent,
		HierarchyNodeComponent,
		HierarchyEditComponent,
	]
})
export class IdentityModule { }
