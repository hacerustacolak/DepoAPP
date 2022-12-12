// tslint:disable-next-line:no-shadowed-variable
import { ConfigModel } from "../core/interfaces/config";

// tslint:disable-next-line:no-shadowed-variable
export class MenuConfig implements ConfigModel {
	public config: any = {};

	constructor() {
		this.config = {
			header: {
				self: {},
				items: [],
			},
			aside: {
				self: {},
				items: [
					{
						title: 'Dashboard',
						desc: 'Some description goes here',
						root: true,
						icon: 'flaticon-dashboard',
						page: '/',
						translate: 'MENU.DASHBOARD',
						only: ['canReadDashboard'],
						permissions: [
							{
								title: 'Read',
								code: 'canReadDashboard'
							}
						]
					},
					{
						title: 'Definitions',
						bullet: 'dot',
						icon: 'flaticon-map',
						root: true, 
						submenu: [
							{
								title: 'Hierarchies',
								page: '/hierarchy',
								translate: 'MENU.IDENTITY.HIERARCHY',
								only: ['canReadHierarchy'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateHierarchy'
									},
									{
										title: 'Read',
										code: 'canReadHierarchy'
									},
									{
										title: 'Update',
										code: 'canUpdateHierarchy'
									},
									{
										title: 'Delete',
										code: 'canDeleteHierarchy'
									}
								]
							},
							{
								title: 'Roles',
								page: '/roles',
								translate: 'MENU.IDENTITY.ROLES',
								only: ['canReadRole'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateRole'
									},
									{
										title: 'Read',
										code: 'canReadRole'
									},
									{
										title: 'Update',
										code: 'canUpdateRole'
									},
									{
										title: 'Delete',
										code: 'canDeleteRole'
									}
								]
							},
							{
								title: 'Users',
								page: '/users',
								translate: 'MENU.IDENTITY.USERS',
								only: ['canReadUser'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateUser'
									}, {
										title: 'Read',
										code: 'canReadUser'
									},
									{
										title: 'Update',
										code: 'canUpdateUser'
									},
									{
										title: 'Delete',
										code: 'canDeleteUser'
									}
								]
							},
							{

								title: 'Regions',
								page: '/regions',
								translate: 'MENU.DEFINITIONS.REGION',
								only: ['canReadRegion'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateRegion'
									},
									{
										title: 'Read',
										code: 'canReadRegion'
									},
									{
										title: 'Update',
										code: 'canUpdateRegion'
									},
									{
										title: 'Delete',
										code: 'canDeleteRegion'
									}
								]
							},
							{
								title: 'Competitors',
								page: '/competitors',
								translate: 'MENU.DEFINITIONS.COMPETITOR',
								only: ['canReadCompetitor'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateCompetitor'
									},
									{
										title: 'Read',
										code: 'canReadCompetitor'
									},
									{
										title: 'Update',
										code: 'canUpdateCompetitor'
									},
									{
										title: 'Delete',
										code: 'canDeleteCompetitor'
									}
								]
							},
							{
								title: 'Group',
								page: '/group',
								translate: 'MENU.CRM.GROUP',
								only: ['canReadGroup'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateGroup'
									},
									{
										title: 'Read',
										code: 'canReadGroup'
									},
									{
										title: 'Update',
										code: 'canUpdateGroup'
									},
									{
										title: 'Delete',
										code: 'canDeleteGroup'
									}
								]
							},
							{
								title: 'Company',
								page: '/company',
								translate: 'MENU.CRM.COMPANY',
								only: ['canReadCompany'],
								permissions: [
									{
										title: 'Create',
										code: 'canCreateCompany'
									},
									{
										title: 'Read',
										code: 'canReadCompany'
									},
									{
										title: 'Update',
										code: 'canUpdateCompany'
									},
									{
										title: 'Delete',
										code: 'canDeleteCompany'
									}
								]
							},
							{
								title: 'Vehicles',
								bullet: 'dot',
								root: true,
								submenu: [
									{
										title: 'VehicleBrand',
										page: '/vehicles/brand',
										translate: 'MENU.DEFINITIONS.VEHICLES.BRAND',
										only: ['canReadVehicleBrand'],
										permissions: [
											{
												title: 'Create',
												code: 'canCreateVehicleBrand'
											},
											{
												title: 'Read',
												code: 'canReadVehicleBrand'
											},
											{
												title: 'Update',
												code: 'canUpdateVehicleBrand'
											},
											{
												title: 'Delete',
												code: 'canDeleteVehicleBrand'
											}
										]
									},
									{
										title: 'VehicleModel',
										page: '/vehicles/model',
										translate: 'MENU.DEFINITIONS.VEHICLES.MODEL',
										only: ['canReadVehicleModel'],
										permissions: [
											{
												title: 'Create',
												code: 'canCreateVehicleModel'
											},
											{
												title: 'Read',
												code: 'canReadVehicleModel'
											},
											{
												title: 'Update',
												code: 'canUpdateVehicleModel'
											},
											{
												title: 'Delete',
												code: 'canDeleteVehicleModel'
											}
										]
									},
									{
										title: 'VehicleCapacity',
										page: '/vehicles/capacity',
										translate: 'MENU.DEFINITIONS.VEHICLES.CAPACITY',
										only: ['canReadVehicleCapacity'],
										permissions: [
											{
												title: 'Create',
												code: 'canCreateVehicleCapacity'
											},
											{
												title: 'Read',
												code: 'canReadVehicleCapacity'
											},
											{
												title: 'Update',
												code: 'canUpdateVehicleCapacity'
											},
											{
												title: 'Delete',
												code: 'canDeleteVehicleCapacity'
											}
										]
									},
									{
										title: 'Vehicle',
										page: '/vehicles/vehicle',
										translate: 'MENU.DEFINITIONS.VEHICLES.VEHICLE',
										only: ['canReadVehicle'],
										permissions: [
											{
												title: 'Create',
												code: 'canCreateVehicle'
											},
											{
												title: 'Read',
												code: 'canReadVehicle'
											},
											{
												title: 'Update',
												code: 'canUpdateVehicle'
											},
											{
												title: 'Delete',
												code: 'canDeleteVehicle'
											}
										]
									},
								],
								translate: 'MENU.DEFINITIONS.VEHICLES.SELF',
								only: ['canReadRegion'
									, 'canReadVehicleCapacity'
									, 'canReadVehicleModel'
									, 'canReadVehicleBrand'
									, 'canReadCompany'
									, 'canReadGroup'
									, 'canReadCompetitor'
									, 'canReadUser'
									, 'canReadRole'
									, 'canReadHierarchy'
									, 'canReadVehicle'
								]
							},
						],
						translate: 'MENU.DEFINITIONS.SELF',
						only: ['canReadRegion'
							, 'canReadVehicleCapacity'
							, 'canReadVehicleModel'
							, 'canReadVehicleBrand'
							, 'canReadCompany'
							, 'canReadGroup'
							, 'canReadCompetitor'
							, 'canReadUser'
							, 'canReadRole'
							, 'canReadHierarchy'
							, 'canReadVehicle'
						]
					},
					{
						bullet: 'dot',
						icon: 'far fa-user',
						root: true,
						title: 'Merchant',
						page: '/merchant',
						translate: 'MENU.CRM.MERCHANT',
						only: ['canReadMerchant'],
						permissions: [
							{
								title: 'Create',
								code: 'canCreateMerchant'
							},
							{
								title: 'Read',
								code: 'canReadMerchant'
							},
							{
								title: 'Update',
								code: 'canUpdateMerchant'
							},
							{
								title: 'Delete',
								code: 'canDeleteMerchant'
							}
						]
					},
					{
						bullet: 'dot',
						icon: 'fab fa-dochub',
						root: true,
						title: 'Warehouse',
						page: '/warehouse',
						translate: 'MENU.DEFINITIONS.WAREHOUSE',
						only: ['canReadWarehouse'],
						permissions: [
							{
								title: 'Create',
								code: 'canCreateWarehouse'
							},
							{
								title: 'Read',
								code: 'canReadWarehouse'
							},
							{
								title: 'Update',
								code: 'canUpdateWarehouse'
							},
							{
								title: 'Delete',
								code: 'canDeleteWarehouse'
							}
						]
					},
				],
			},
		};
	}
}
