import { Injectable } from '@angular/core';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UtilsService {
	constructor(private translate: TranslateService) { }

	/**
	 * Build url parameters key and value pairs from array or object
	 * @param obj
	 */
	urlParam(obj: any): string {
		return Object.keys(obj)
			.map(k => k + '=' + encodeURIComponent(obj[k]))
			.join('&');
	}

	/**
	 * Simple object check.
	 * @param item
	 * @returns {boolean}
	 */
	isObject(item) {
		return item && typeof item === 'object' && !Array.isArray(item);
	}

	/**
	 * Deep merge two objects.
	 * @param target
	 * @param ...sources
	 * @see https://stackoverflow.com/a/34749873/1316921
	 */
	mergeDeep(target, ...sources) {
		if (!sources.length) {
			return target;
		}
		const source = sources.shift();

		if (this.isObject(target) && this.isObject(source)) {
			for (const key in source) {
				if (this.isObject(source[key])) {
					if (!target[key]) {
						Object.assign(target, { [key]: {} });
					}
					this.mergeDeep(target[key], source[key]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}

		return this.mergeDeep(target, ...sources);
	}

	getPath(obj, val, path?) {
		path = path || '';
		let fullpath = '';
		for (const b in obj) {
			if (obj[b] === val) {
				return path + '/' + b;
			} else if (typeof obj[b] === 'object') {
				fullpath =
					this.getPath(obj[b], val, path + '/' + b) || fullpath;
			}
		}
		return fullpath;
	}

	guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	getDateFormat() {
		let lang = this.translate.currentLang;
		if (lang === 'tr') {
			return 'dd/MM/yyyy';
		}

		return 'dd/MM/yyyy';
	}
}

export function getSipServer() {
	return 'sunflower.viases.cloud:5060';
}

export function isInteger(value: any): value is number {
	return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function isString(value: any): value is string {
	return typeof value === 'string';
}

export function convertToMegaByte(bytes: number): string {
	return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
