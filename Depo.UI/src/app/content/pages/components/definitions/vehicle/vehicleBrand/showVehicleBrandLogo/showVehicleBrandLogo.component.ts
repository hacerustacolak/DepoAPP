import { ChangeDetectionStrategy, Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { VehicleBrandModel } from '../vehicleBrand.model';
import { VehicleBrandService } from '../vehicleBrand.service';

@Component({
	selector: 'showVehicleBrandLogo',
	templateUrl: './showVehicleBrandLogo.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowVehicleBrandLogoComponent implements OnInit {
	logo: string = '';
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(public dialogRef: MatDialogRef<ShowVehicleBrandLogoComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private vehicleBrandService: VehicleBrandService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.getImage(this.data.filePath);
	}


	getTitle(): string {
		return this.translate.instant('DEFINITION.VEHICLE.BRAND.LOGO');
	}

	getImage(filePath: string) {
		this.viewLoading = true;

		let model: VehicleBrandModel = new VehicleBrandModel();
		model.filePath = filePath;

		this.vehicleBrandService.getImageByFilepath(model).subscribe((res) => {
			this.logo = 'data:image/jpg;base64,' + res.data;
			this.viewLoading = false;
			this.cdr.detectChanges();
		});
	}
}
