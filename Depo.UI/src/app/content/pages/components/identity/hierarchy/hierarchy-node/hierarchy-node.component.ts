import { Component, Output, EventEmitter, Input, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlattener, MatTreeFlatDataSource, MatDialog } from "@angular/material";
import { HierarchyNodeDatabase } from "./hierarchy-node.datasource";
import { TodoItemFlatNode, TodoItemNode } from "./hierarchy-node.model";
import { TranslateService } from "@ngx-translate/core";
import { HierarchyEditComponent } from "../hierarchy-edit/hierarchy-edit.component";
import { HierarchyService } from "../hierarchy.service";
import { LayoutUtilsService } from "../../../../../../core/services/layout-utils.service";
import { Router } from "@angular/router";

@Component({
	selector: 'hierarchy-node',
	templateUrl: 'hierarchy-node.component.html',
	providers: [HierarchyNodeDatabase]
})
export class HierarchyNodeComponent {
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

	
	constructor(
		private database: HierarchyNodeDatabase,
		private translate: TranslateService,
		private hierarchyService: HierarchyService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef,
		private router: Router	) {
		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
		
		database.dataChange.subscribe(data => {
			this.dataSource.data = data;
		});
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
		return flatNode;
	}

	/** Select the category so we can insert the new item. */
	addNewItem(node: TodoItemFlatNode) {
		const parentNode = this.flatNodeMap.get(node);
		this.database.insertItem(parentNode!, '');
		this.treeControl.expand(node);
	}

	/** Save the node to database */
	saveNode(node: TodoItemFlatNode, itemValue: string) {
		const nestedNode = this.flatNodeMap.get(node);
		this.database.updateItem(nestedNode!, itemValue);
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

	onDelete(model: TodoItemNode) {
		const _title: string = this.translate.instant("COMMON.DELETE.TITLE") + " " + model.name;
		const _description: string = this.translate.instant(
			"COMMON.DELETE.DESC"
		);
		const _waitDescription: string = this.translate.instant(
			"COMMON.DELETE.WAIT_DESC"
		);

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDescription
		);

		dialogRef.componentInstance.yesClick.subscribe((res) => {
			this.hierarchyService.delete(model.data.id).subscribe(() => {
				dialogRef.close();
				this.reloadCurrentRoute();
			});
		});
	}

	onEdit(node: TodoItemNode) {
		let model: any = node.data;
		const dialogRef = this.dialog.open(HierarchyEditComponent, {
			width: "900px",
			data: { model },
		});
		dialogRef.afterClosed().subscribe((res) => {
			this.reloadCurrentRoute();
		});
	}

	onCreate(node: TodoItemNode) {
		let model: any = node.data;
		model.parentId = model.id;
		model.id = 0;
		model.title = '';
		const dialogRef = this.dialog.open(HierarchyEditComponent, {
			width: "900px",
			data: { model },
		});
		dialogRef.afterClosed().subscribe((res) => {
			this.reloadCurrentRoute();
		});
	}

	reloadCurrentRoute() {
		let currentUrl = this.router.url;
		this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
			this.router.navigate([currentUrl]);
		});
	}
}
