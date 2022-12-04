export class TodoItemNode {
    children: TodoItemNode[];
    name: string;
	data?: any;
  }
  
  /** Flat to-do item node with expandable and level information */
  export class TodoItemFlatNode {
    name: string;
    level: number;
    expandable: boolean;
    data?: any;
  }

