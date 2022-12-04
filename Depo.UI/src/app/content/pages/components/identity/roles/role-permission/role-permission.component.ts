import { Component, Output, EventEmitter, Input, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlattener, MatTreeFlatDataSource } from "@angular/material";
import { RolePermissionDatabase } from "./role-permission.datasource";
import { TodoItemFlatNode, TodoItemNode } from "./role-permission.model";

@Component({
	selector: 'role-permission',
	templateUrl: 'role-permission.component.html',
	providers: [RolePermissionDatabase]
})
export class RolePermissionComponent {
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

	/** The selection for checklist */
	@Input() checklistSelection;

	@Input() selected;

	constructor(private database: RolePermissionDatabase, private cdr: ChangeDetectorRef) {
		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
			this.isExpandable, this.getChildren);
		this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

		database.dataChange.subscribe(data => {
			this.dataSource.data = data;
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['selected']) {
			this.dataSource._flattenedData.subscribe(flattenedData => {
				flattenedData.forEach(flatNode => {
					if (flatNode.data.code != null && this.selected.indexOf(flatNode.data.code) != -1) {
						this.selectNode(flatNode);
					}
				});
			});
		}
	}

	selectNode(flatNode: TodoItemFlatNode) {
		this.checklistSelection.select(flatNode);
		let parentNode = this.getParent(flatNode);
		if (parentNode) {
			this.selectNode(parentNode);
		}
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
		return flatNode;
	}

	/** Whether all the descendants of the node are selected */
	descendantsAllSelected(node: TodoItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		return descendants.every(child => this.checklistSelection.isSelected(child));
	}

	/** Whether part of the descendants are selected */
	descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		const result = descendants.some(child => this.checklistSelection.isSelected(child));
		return result && !this.descendantsAllSelected(node);
	}

	/** Toggle the to-do item selection. Select/deselect all the descendants node */
	todoItemSelectionToggle(node: TodoItemFlatNode): void {
		this.checklistSelection.toggle(node);
		const descendants = this.treeControl.getDescendants(node);
		this.checklistSelection.isSelected(node) ? this.checklistSelection.select(...descendants)
			: this.checklistSelection.deselect(...descendants);
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
}
