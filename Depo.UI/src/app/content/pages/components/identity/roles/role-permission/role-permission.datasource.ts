import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { TodoItemNode } from "./role-permission.model";
import { MenuConfigService } from "../../../../../../core/services/menu-config.service";

@Injectable()
export class RolePermissionDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor(private menuConfigService: MenuConfigService) {
    this.initialize();
  }

  initialize() {

    this.menuConfigService.onMenuUpdated$.subscribe((res) => {

      // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
      //     file node as children.
      const data = this.buildFileTree(res.config.aside.items, 0);

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
      node.data = {
        code: value.code || null
      };

      if (value != null) {
        if (value.submenu) {
          node.children = this.buildFileTree(value.submenu, level + 1);
        } 
        else if (value.permissions) {
          node.children = this.buildFileTree(value.permissions, level + 1);
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