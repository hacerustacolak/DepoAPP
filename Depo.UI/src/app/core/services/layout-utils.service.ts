import { Injectable } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ActionNotificationComponent } from '../../content/partials/components/action-notification/action-notification.component';
import { DeleteEntityDialogComponent } from '../../content/partials/components/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from '../../content/partials/components/fetch-entity-dialog/fetch-entity-dialog.component';


export enum MessageType {
	Create,
	Read,
	Update,
	Delete,
	Copy,
	Info
}

@Injectable()
export class LayoutUtilsService {
	constructor(private snackBar: MatSnackBar,
		private dialog: MatDialog) { }

	// SnackBar for notifications
	showActionNotification(
		message: string,
		type: MessageType = MessageType.Create,
		duration: number = -1,
		showCloseButton: boolean = true,
		showUndoButton: boolean = false,
		undoButtonDuration: number = 3000,
		verticalPosition: 'top' | 'bottom' = 'top'
	) {
		return this.snackBar.openFromComponent(ActionNotificationComponent, {
			duration: duration,
			data: {
				message,
				snackBar: this.snackBar,
				showCloseButton: showCloseButton,
				showUndoButton: showUndoButton,
				undoButtonDuration,
				verticalPosition,
				type,
				action: 'Undo'
			},
			verticalPosition: verticalPosition
		});
	}

	// Method returns instance of MatDialog
	deleteElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	// Method returns instance of MatDialog
	fetchElements(_data) {
		return this.dialog.open(FetchEntityDialogComponent, {
			data: _data,
			width: '400px'
		});
	}
}
