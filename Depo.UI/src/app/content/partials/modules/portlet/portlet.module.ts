import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	MatProgressSpinnerModule,
	MatProgressBarModule
} from '@angular/material';
import { PortletComponent } from './portlet.component';
import { CoreModule } from '../../../../core/core.module';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		MatProgressSpinnerModule,
		MatProgressBarModule
	],
	declarations: [PortletComponent],
	exports: [PortletComponent]
})
export class PortletModule {}
