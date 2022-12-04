// Core
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
// Services


@Injectable()
export class MatPaginatorIntlService extends MatPaginatorIntl {

    translate: TranslateService;

    constructor(translate: TranslateService) {
        super();

        this.translate = translate;
        this.init();
    }

    init() {
        this.translate.onLangChange.subscribe(() => {
            this.translateLabels();
        });
    
        this.translateLabels();
    }

    
    translateLabels() {
        this.itemsPerPageLabel = this.translate.instant('MATPAGINATOR.ITEMSPERPAGELABEL') + ':'; 
        this.nextPageLabel     = this.translate.instant('MATPAGINATOR.NEXT');
        this.previousPageLabel = this.translate.instant('MATPAGINATOR.PREV');
        this.firstPageLabel = this.translate.instant('MATPAGINATOR.FIRST');
        this.lastPageLabel = this.translate.instant('MATPAGINATOR.LAST');
        
        this.changes.next();
    }
}