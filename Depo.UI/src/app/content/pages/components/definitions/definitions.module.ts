import { WarehouseService } from './warehouse/warehouse.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';
import { PartialsModule } from '../../../partials/partials.module';
import { CompetitorEditComponent } from './competitor/competitor-edit/competitor-edit.component';
import { CompetitorListComponent } from './competitor/competitor-list/competitor-list.component';
import { CompetitorService } from './competitor/competitor.service';
import { DefinitionsComponent } from './definitions.component';
import { RegionEditComponent } from './region/region-edit/region-edit.component';
import { RegionListComponent } from './region/region-list/region-list.component';
import { RegionService } from './region/region.service';
import { ShowVehicleBrandLogoComponent } from './vehicle/vehicleBrand/showVehicleBrandLogo/showVehicleBrandLogo.component';
import { VehicleBrandEditComponent } from './vehicle/vehicleBrand/vehicleBrand-edit/vehicleBrand-edit.component';
import { VehicleBrandListComponent } from './vehicle/vehicleBrand/vehicleBrand-list/vehicleBrand-list.component';
import { VehicleBrandService } from './vehicle/vehicleBrand/vehicleBrand.service';
import { VehicleCapacityEditComponent } from './vehicle/vehicleCapasity/vehicleCapacity-edit/vehicleCapacity-edit.component';
import { VehicleCapacityListComponent } from './vehicle/vehicleCapasity/vehicleCapacity-list/vehicleCapacity-list.component';
import { VehicleCapacityService } from './vehicle/vehicleCapasity/vehicleCapacity.service';
import { VehicleModelEditComponent } from './vehicle/vehicleModel/vehicleModel-edit/vehicleModel-edit.component';
import { VehicleModelListComponent } from './vehicle/vehicleModel/vehicleModel-list/vehicleModel-list.component';
import { VehicleModelService } from './vehicle/vehicleModel/vehicleModel.service';
import { VehicleEditComponent } from './vehicle/vehicles/vehicle-edit/vehicle-edit.component';
import { VehicleListComponent } from './vehicle/vehicles/vehicle-list/vehicle-list.component';
import { VehicleService } from './vehicle/vehicles/vehicle.service';
import { WarehouseEditComponent } from './warehouse/warehouse-edit/warehouse-edit.component';
import { WarehouseListComponent } from './warehouse/warehouse-list/warehouse-list.component';



const routes: Routes = [
	{
		path: '',
		component: DefinitionsComponent, 
		children: [
			{
				path: 'regions',
				component: RegionListComponent
			},
			{
				path: 'competitors',
				component: CompetitorListComponent
			},
			{
				path: 'warehouse',
				component: WarehouseListComponent
			},
			{
				path: 'vehicles',
				children: [
					{
						path: 'brand',
						component: VehicleBrandListComponent
					},
					{
						path: 'model',
						component: VehicleModelListComponent
					},
					{
						path: 'capacity',
						component: VehicleCapacityListComponent
					},
					{
						path: 'vehicle',
						component: VehicleListComponent
					},
				],
			},
		]
	}
];

@NgModule({
	imports: [
		PartialsModule,
		FileUploadModule,
		RouterModule.forChild(routes)
	],
	entryComponents: [
		RegionEditComponent,
		CompetitorEditComponent,
		VehicleBrandEditComponent,
		VehicleModelEditComponent,
		VehicleCapacityEditComponent,
		ShowVehicleBrandLogoComponent,
		VehicleEditComponent,
		WarehouseEditComponent
	],
	providers: [
		RegionService,
		CompetitorService,
		VehicleBrandService,
		VehicleModelService,
		VehicleCapacityService,
		VehicleService,
		WarehouseService
	],
	declarations: [
		RegionListComponent,
		DefinitionsComponent,
		RegionEditComponent,
		CompetitorListComponent,
		CompetitorEditComponent,
		VehicleBrandListComponent,
		VehicleBrandEditComponent,
		VehicleModelEditComponent,
		VehicleModelListComponent,
		VehicleCapacityListComponent,
		VehicleCapacityEditComponent,
		ShowVehicleBrandLogoComponent,
		VehicleListComponent,
		VehicleEditComponent,
		WarehouseListComponent,
		WarehouseEditComponent
	]
})
export class DefinitionsModule { }
