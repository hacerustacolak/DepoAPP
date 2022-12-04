export class MerchantModel {
	id: number;
	companyId:number;
	merchantName: string;
	aliasName: string;
	address: string;
	regionId: number;
	regionName: string;
	webSiteUrl:string;
	description:string;
	longitude:string;
	latitude:string;
	groupName: string;
	phone:string;
	email:string;
	logoCode:string;
	representive:string;
	createDate:string;
	city:string;

	clear() {
		this.id = 0;
		this.merchantName = '';
		this.aliasName = '';
		this.address = '';
		this.description = '';
		this.webSiteUrl = '';
		this.longitude = '';
		this.latitude = '';
		this.companyId = 0;
		this.regionId = 0;
		this.groupName = '';
		this.regionName = '';
		this.phone = '';
		this.email = ''; 
		this.logoCode= '';
		this.representive= '';
		this.createDate= '';
		this.city= '';
	}
}

export class MerchantDetailModel {
	id: number;
	vehicleDetail:VehicleDetail[];
	vehicleDetailJson: string;
	isSpecialTransfer: boolean;
	vehicleCount: number;
	shiftCount: number;
	personalCount: number;
	customerRepresentativeId:number;
	contractPeriod:number;
	tenderDate:Date;
	contractEndDate:Date;
	competitorsId: number;
	hasService:boolean;
	merchantName:string;
	clear() {
		this.id = 0;
		this.vehicleDetail = [];
		this.vehicleDetailJson = '';
		this.isSpecialTransfer = false;
		this.vehicleCount = 0;
		this.shiftCount = 0;
		this.personalCount = 0;
		this.customerRepresentativeId = 0;
		this.contractPeriod = 0;
		this.tenderDate = new Date();
		this.contractEndDate = new Date();
		this.competitorsId = 0;
		this.hasService = false;
		this.merchantName = '';
	}
}
export class VehicleDetail
{
	vehicleCount : number;
	vehicleCapacityId:number;
}

export class MerchantPerson{
	id:number;
	userId:number[];
	contactPerson: string;
	contactPhone: string
	contactEmail: string;
	contactTitle: string;
	merchantId:number;
	clear() {
		this.contactPerson = "";
		this.contactEmail = "";
		this.contactPhone = "";
		this.contactTitle = "";
		this.id = 0;
		this.userId = [];
		this.merchantId = 0;
	}
}

export class MerchantInterview{
	id:number;
	merchantId:number;
	merchantContactId:number;
	title:string;
	name:string;
	description:string;
	interviewTypeId:number;
	interviewType:string;
	interviewDate: Date;
	clear()
	{
		this.id = 0;
		this.merchantId = 0;
		this.merchantContactId = 0;
		this.title = "";
		this.name = "";
		this.description = "";
		this.interviewTypeId = 0;
		this.interviewType = "";
		this.interviewDate = new Date();
		
	}
}
export class MerchantContract{
	id:number;
	merchantId:number;
	contractDate:Date;
    fuelProcessingPercentage :number
    fuelCheckPeriod :number
    percentageOfFuelPriceWillBeProcessed :number
    inflationProcessingPercentage :number
    inflationCheckPeriod :number
    percentageOfInflationPriceWillBeProcessed :number
	description:string
	clear()
	{
		this.id = 0;
		this.merchantId = 0;
		this.fuelProcessingPercentage = 0;
		this.fuelCheckPeriod = 0;
		this.percentageOfFuelPriceWillBeProcessed = 0;
		this.inflationProcessingPercentage = 0;
		this.inflationCheckPeriod = 0;
		this.percentageOfInflationPriceWillBeProcessed = 0;
		this.contractDate = new Date();
		this.description = '';
	}
}
export class MerchantOffer{
	id:number;
	merchantId:number;
	driverCost:number;
    projectManagerCost :number;
    controlToolCost :number;
    controlToolCount :number;
    fuelLiterFee :number;
    fuelCommissionRate :number;
    letterOfGuaranteeFee :number;
    annualFinancingFee :number
    profitMultiplier :number;
    miniRentalFee :number;
    midiRentalFee :number;
    busRentalFee :number;
    carRentalFee :number;
    customerMaturity :number;
    subcontractorMaturity :number;
    fuelMaturity :number;
    status :string;
    userName :string;
	description:string;
	modifiedDate:Date;
	createDate:Date;
	filePath :string;
    fileSize :number;
    fileName :string;
	fileType:string;
	merchantOfferFile: MerchantOfferFile[];
	
	clear()
	{
		this.carRentalFee = 0;
		this.customerMaturity = 0;
		this.subcontractorMaturity = 0;
		this.fuelMaturity = 0;
		this.id = 0;
		this.merchantId = 0;
		this.driverCost = 0;
		this.projectManagerCost = 0;
		this.controlToolCost = 0;
		this.controlToolCount = 0;
		this.fuelLiterFee = 0.00;
		this.fuelCommissionRate = 0.00;
		this.letterOfGuaranteeFee = 0;
		this.annualFinancingFee = 0;
		this.profitMultiplier = 0;
		this.miniRentalFee = 0;
		this.midiRentalFee = 0;
		this.busRentalFee = 0;
		this.modifiedDate = new Date();
		this.createDate = new Date();
		this.userName = '';
		this.description = '';
		this.filePath = '';
		this.fileName = '';
		this.fileSize = 0;
		this.fileType = '';
		this.merchantOfferFile = [];
	}
}

export class MerchantOfferFile{
	id:number;
	merchantId:number;
	merchantOfferId:number;
    filePath :string;
    fileSize :number;
    fileName :string;
	fileType :string;
    
	clear()
	{
		this.merchantOfferId = 0;
		this.fileSize = 0;
		this.id = 0;
		this.merchantId = 0;
		this.filePath = '';
		this.fileName = '';
	}
}
