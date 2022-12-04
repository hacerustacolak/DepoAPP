import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'mFirstLetter'
})
export class FirstLetterPipe implements PipeTransform {
	transform(value: any, args?: any): any {
		if (value == undefined || value == null) {
			return '';
		}
		return value.charAt(0);
	}
}
