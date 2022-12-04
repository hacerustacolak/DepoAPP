import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { TodoItemNode } from "../../../hierarchy/hierarchy-node/hierarchy-node.model";
import { HierarchyDataSource } from "../../../hierarchy/hierarchy.datasource";
import { UserService } from "../../user.service";

@Injectable()
export class UserHierarchyNodeDatabase {
	dataChange = new BehaviorSubject<TodoItemNode[]>([]);

	get data(): TodoItemNode[] { return this.dataChange.value; }
	userId: number;

	constructor(private userService: UserService) {
		this.initialize();
	}

	initialize() {
		this.loadData();
	}

	loadData() {
		if (this.userId != undefined && this.userId != null && this.userId > 0) {
			this.userService.getHierarchies(this.userId).subscribe((res) => {

				// Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
				//     file node as children.
				const data = this.buildFileTree(res.data, 0);

				// Notify the change.
				this.dataChange.next(data);
			});
		}
	}

	/**
	* Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
	* The return value is the list of `TodoItemNode`.
	*/
	buildFileTree(obj: object, level: number): TodoItemNode[] {
		return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
			const value = obj[key];
			const node = new TodoItemNode();
			node.name = value.title;
			node.data = value;

			if (value != null) {
				if (value.childList) {
					node.children = this.buildFileTree(value.childList, level + 1);
				}
			}

			return accumulator.concat(node);
		}, []);
	}

	/** Add an item to to-do list */
	insertItem(parent: TodoItemNode, name: string) {
		if (parent.children) {
			parent.children.push({ name: name } as TodoItemNode);
			this.dataChange.next(this.data);
		}
	}

	updateItem(node: TodoItemNode, name: string) {
		node.name = name;
		this.dataChange.next(this.data);
	}
}
