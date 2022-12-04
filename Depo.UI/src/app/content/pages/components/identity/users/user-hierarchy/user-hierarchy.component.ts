import { ChangeDetectionStrategy, Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ReplaySubject } from "rxjs";
import { LayoutUtilsService } from "../../../../../../core/services/layout-utils.service";
import { UserService } from "../user.service";
import { FlatTreeControl } from "@angular/cdk/tree";
import { UserModel } from "../user.model";
import { SelectionModel } from "@angular/cdk/collections";
import { TodoItemFlatNode } from "../../hierarchy/hierarchy-node/hierarchy-node.model";

@Component({
    selector: 'user-hierarchy',
    templateUrl: './user-hierarchy.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHierarchyComponent {

    constructor(public dialogRef: MatDialogRef<UserHierarchyComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private userService: UserService,
        private layoutUtilsService: LayoutUtilsService) {
        dialogRef.disableClose = true;
    }

    user: UserModel;

    viewLoading: boolean = false;
    formErrorMsg: string = '';

	ngOnInit() {
        this.user = this.dialogData.model;		
    }
}

