import { ChangeDetectionStrategy, Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ReplaySubject } from "rxjs";
import { LayoutUtilsService } from "../../../../../../core/services/layout-utils.service";
import { UserService } from "../user.service";
import { UserModel } from "../user.model";
import { AuthenticationService } from "../../../../../../core/auth/authentication.service";

@Component({
    selector: 'user-role',
    templateUrl: './user-role.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRoleComponent {

    constructor(public dialogRef: MatDialogRef<UserRoleComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private userService: UserService,
        private layoutUtilsService: LayoutUtilsService,
        private authService: AuthenticationService) {
        dialogRef.disableClose = true;
    }

    user: UserModel;

    viewLoading: boolean = false;
    formErrorMsg: string = '';

    @ViewChild('rolesView') rolesView;
    roles = new ReplaySubject<any[]>(1);
    isAdmin: boolean = false;
    ngOnInit() {
        this.user = this.dialogData.model;
        this.authService.getCurrentUser().subscribe((user) => {
			this.isAdmin = (user.roles.indexOf('Admin') > -1);
            this.userService.getUserRoles(this.user.id).subscribe((roles) => {
                if(roles.isSuccess)
                {
                    if(!this.isAdmin && (roles.data.filter(x => x.name === "Admin").length > 0)){
                        roles = roles.data.filter(x => x.name !== "Admin");
                    }
                    this.roles.next(roles.data);
                }
            });
		});
    }
 
    onClick(role) {
        role.selected = !role.selected;
    }

    onSubmit() {

        let selectedRoles = this.rolesView.selectedOptions.selected.map(x => x.value.id);

        this.userService.updateUserRoles({
            userId: this.user.id,
            roles: selectedRoles
        }).subscribe((res: any) => {
            this.dialogRef.close();
        });
    }
}

