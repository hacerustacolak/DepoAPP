import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { MenuConfigService } from "../../../../../../core/services/menu-config.service";
import { TodoItemNode } from "./hierarchy-node.model";
import { HierarchyDataSource } from "../hierarchy.datasource";
import { QueryParamsModel } from "../../../../../../core/models/query-params.model";
import { HierarchyService } from "../hierarchy.service";

@Injectable()
export class HierarchyNodeDatabase {
	dataChange = new BehaviorSubject<TodoItemNode[]>([]);

	queryParams: QueryParamsModel = new QueryParamsModel(null, 'asc', '', 0, 10000);
	dataSource: HierarchyDataSource;

	get data(): TodoItemNode[] { return this.dataChange.value; }

	constructor(private hierarchyService: HierarchyService) {
		this.initialize();
	}

	initialize() {
		this.dataSource = new HierarchyDataSource(this.hierarchyService);
		this.dataSource.load(this.queryParams);
		this.dataSource.entitySubject.subscribe((res) => {

			// Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
			//     file node as children.
			const data = this.buildFileTree(res, 0);

			// Notify the change.
			this.dataChange.next(data);
		});

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
				if (value.xlHierarchiesModel) {
					node.children = this.buildFileTree(value.xlHierarchiesModel, level + 1);
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
