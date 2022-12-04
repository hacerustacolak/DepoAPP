import { Component, ChangeDetectionStrategy, ElementRef, Input, Inject } from "@angular/core";
import { CronOptions } from 'cron-editor/lib/CronOptions';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
    selector: 'm-cron-editor',
    templateUrl: './cron-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CronEditorComponent {
    constructor(
        private el: ElementRef,
        public dialogRef: MatDialogRef<CronEditorComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
    ) {

    }

    cronExpression: string;
    isCronDisabled = false;
    
    cronOptions: CronOptions = {
        formInputClass: 'form-control cron-editor-input',
        formSelectClass: 'form-control cron-editor-select',
        formRadioClass: 'cron-editor-radio',
        formCheckboxClass: 'cron-editor-checkbox',

        defaultTime: '10:00:00',
        use24HourTime: true,

        hideMinutesTab: false,
        hideHourlyTab: false,
        hideDailyTab: false,
        hideWeeklyTab: false,
        hideMonthlyTab: false,
        hideYearlyTab: false,
        hideAdvancedTab: false,

        hideSeconds: true,
        removeSeconds: false,
        removeYears: false
    };

    ngOnInit(){
        this.cronExpression = this.data.cronExpression ? this.data.cronExpression : '4 3 2 12 1/1 ? *';
    }

    ngAfterViewInit() {
        let cronTabs = this.el.nativeElement.querySelectorAll('.nav-tabs li a');

        for (let tab of cronTabs) {
            tab.style.margin = '10px';
        }
    }

    onSubmit(){
        this.dialogRef.close({
            cronExpression: this.cronExpression
        });
    }
}