export class HierarchyModel {
    id: number;
	title: string;
	titleDescription: string;
	parentId: number;
	isDefault: boolean;
	xlHierarchiesModel: HierarchyModel;

  clear() {
	  this.id = 0;
	  this.title = ''
	  this.titleDescription = ''
	  this.parentId = 0;
	  this.isDefault = false;
	  this.xlHierarchiesModel = null;
  }
}
