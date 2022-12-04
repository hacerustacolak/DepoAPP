import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef
} from '@angular/core';
import { MessengerService } from '../../../../../core/services/messenger.service';

@Component({
	selector: 'm-messenger',
	templateUrl: './messenger.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessengerComponent implements OnInit {

	messages = [{
		username: 'user',
		type: 'in',
		text: 'Hello!'
	}];

	constructor(public messengerService: MessengerService, private changeDetectorRef: ChangeDetectorRef) { }

	ngOnInit(): void {

	}

	onEnter(event){
		console.log(event);
	}
}
