export class VehicleModel {
	id: number;
	scVehicleTypeId: number;
	vehiclePlate:string;
	vehicleTrackingDeviceCompanyId:number;
	vehicleTrackingDeviceNo:string;
	vehicleModelId:number;
	vehicleRental:number;
	vehicleCapacityId:number;
	vehicleModelYear:number;
	subcontractorId:number;
	gpsPrice:number;
	vehiclePhotoList:VehicleFileModel[];
	vehicleLisenceList:VehicleFileModelWithDate;
	vehicleTrafficIMMSList:VehicleFileModelWithDate;
	vehicleTrafficInsuranceList:VehicleFileModelWithDate;
	vehicleInspectionList:VehicleFileModelWithDate;
	vehicleMaintenanceList:VehicleFileMaintenance;
	description: string;
	scVehicleTypeName:string;
	vehicleModelName:string;
	vehicleCapacityName:string;
	vehicleBrandId:number;
	maintenancePeriodKM:number;
    maintenancePeriodYear:number;
	clear() {
		this.id = 0;
		this.scVehicleTypeId = 0;
		this.vehiclePlate = '';
		this.vehicleTrackingDeviceCompanyId = 0;
		this.vehicleTrackingDeviceNo = '';
		this.vehicleModelId = 0;
		this.vehicleRental = 0;
		this.vehicleCapacityId = 0;
		this.vehicleModelYear = 0;
		this.subcontractorId = 0;
		this.gpsPrice = 0;
		this.vehiclePhotoList = [];
		this.vehicleLisenceList = new VehicleFileModelWithDate();
		this.vehicleTrafficIMMSList = new VehicleFileModelWithDate();
		this.vehicleTrafficInsuranceList = new VehicleFileModelWithDate();
		this.vehicleInspectionList = new VehicleFileModelWithDate();
		this.vehicleMaintenanceList = new VehicleFileMaintenance();
		this.description = '';
		this.scVehicleTypeName='';
		this.vehicleModelName='';
		this.vehicleCapacityName='';
		this.vehicleBrandId=0;
		this.maintenancePeriodKM = 0;
		this.maintenancePeriodYear = 0;
	}
}
export class VehicleFileModel
{
	fileName:string;
	filePath:string;
	fileLength:number;
	fileBase64:string
}
export class VehicleFileModelWithDate
{
	fileName:string;
	filePath:string;
	fileLength:number;
	startDate:Date;
	endDate:Date;
}
export class VehicleFileMaintenance
{
	fileName:string;
	filePath:string;
	fileLength:number;
	endDate:Date;
	lastMaintenanceKM:number;
}

