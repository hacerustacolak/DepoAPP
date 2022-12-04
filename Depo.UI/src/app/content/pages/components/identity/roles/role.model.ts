export class RoleModel {
  id: number;
  roleName: string;
  rolePermissions: string;
  isDefault: boolean;

  clear() {
    this.id = 0;
    this.roleName = '';
    this.rolePermissions = null;
    this.isDefault = false;
  }
}