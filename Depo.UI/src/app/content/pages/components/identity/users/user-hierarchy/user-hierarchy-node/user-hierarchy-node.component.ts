import { Component, Output, EventEmitter, Input, SimpleChanges, ChangeDetectorRef, Inject } from "@angular/core";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlattener, MatTreeFlatDataSource, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { LayoutUtilsService } from "../../../../../../../core/services/layout-utils.service";
import { TodoItemFlatNode, TodoItemNode } from "../../../hierarchy/hierarchy-node/hierarchy-node.model";
import { UserService } from "../../user.service";
import { SelectionModel } from "@angular/cdk/collections";
import { UserModel } from "../../user.model";
import { UserHierarchyNodeDatabase } from "./user-hierarchy-node.datasource";
import { forEach } from "@angular/router/src/utils/collection";

@Component({
	selector: 'user-hierarchy-node',
	templateUrl: 'user-hierarchy-node.component.html',
	providers: [UserHierarchyNodeDatabase]
})
export class UserHierarchyNodeComponent {
	/** Map from flat node to nested node. This helps us finding the nested node to be modified */
	flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

	/** Map from nested node to flattened node. This helps us to keep the same object for selection */
	nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

	/** A selected parent node to be inserted */
	selectedParent: TodoItemFlatNode | null = null;

	/** The new item's name */
	newItemName = '';

	treeControl: FlatTreeControl<TodoItemFlatNode>;

	treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

	dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

	checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

	@Input() selectedUser: UserModel;

	firstChecked: boolean = true;
	viewLoading: boolean = false;

	constructor(
		private database: UserHierarchyNodeDatabase,
		public dialogRef: MatDialogRef<UserHierarchyNodeComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private translate: TranslateService,
		private dialog: MatDialog,
		private userService: UserService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef,
		private router: Router) {
		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

		database.dataChange.subscribe(data => {
			this.dataSource.data = data;
		});

		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.database.userId = this.selectedUser.id;
		this.database.loadData();
	}

	ngOnChanges(changes: SimpleChanges) {

	}

	selectNode(flatNode: TodoItemFlatNode) {
		this.checklistSelection.select(flatNode);
	}

	getLevel = (node: TodoItemFlatNode) => node.level;

	isExpandable = (node: TodoItemFlatNode) => node.expandable;

	getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

	hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

	hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.name === '';

	/**
	* Transformer to convert nested node to flat node. Record the nodes in maps for later use.
	*/
	transformer = (node: TodoItemNode, level: number) => {
		const existingNode = this.nestedNodeMap.get(node);
		const flatNode = existingNode && existingNode.name === node.name
			? existingNode
			: new TodoItemFlatNode();
		flatNode.name = node.name;
		flatNode.data = node.data;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.flatNodeMap.set(flatNode, node);
		this.nestedNodeMap.set(node, flatNode);
		this.treeControl.expand(flatNode);
		if (node.data.selected) {
			this.checklistSelection.select(flatNode);
		}
		else {
			this.checklistSelection.deselect(flatNode);
		}
		return flatNode;
	}

	todoItemSelectionToggle(node: TodoItemFlatNode): void {
		this.checklistSelection.toggle(node);
		this.firstChecked = false;
	}

	todoItemSelected(node: TodoItemFlatNode): void {
		if (this.firstChecked) {
			if (node.data.selected) {
				this.checklistSelection.select(node);
			}
			else {
				this.checklistSelection.deselect(node);
			}
		}
	}

	getParent(node: TodoItemFlatNode) {
		const { treeControl } = this;
		const currentLevel = treeControl.getLevel(node);

		if (currentLevel < 1) {
			return null;
		}

		const startIndex = treeControl.dataNodes.indexOf(node) - 1;

		for (let i = startIndex; i >= 0; i--) {
			const currentNode = treeControl.dataNodes[i];

			if (treeControl.getLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}
	}

	expandParents(node: TodoItemFlatNode) {
		const parent = this.getParent(node);
		this.treeControl.expand(parent);

		if (parent && parent.level > 0) {
			this.expandParents(parent);
		}
	}

	onSubmit() {
		this.viewLoading = true;
		let selectedHierarchies = this.checklistSelection.selected.map(x => x.data.id);

		this.userService.updateUserHierarchies({
			userId: this.selectedUser.id,
			hierarchies: selectedHierarchies
		}).subscribe((res: any) => {
			this.dialogRef.close();
			this.viewLoading = false;
		});
	}


}

