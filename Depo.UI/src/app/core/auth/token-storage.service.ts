import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class TokenStorage {
	/**
	 * Get access token
	 * @returns {Observable<string>}
	 */
	public getAccessToken(): Observable<string> {
		const token: string = <string>localStorage.getItem('accessToken');
		return of(token);
	}

	/**
	 * Get refresh token
	 * @returns {Observable<string>}
	 */
	public getRefreshToken(): Observable<string> {
		const token: string = <string>localStorage.getItem('refreshToken');
		return of(token);
	}

	/**
	 * Set access token
	 * @returns {TokenStorage}
	 */
	public setAccessToken(token: string): TokenStorage {
		localStorage.setItem('accessToken', token);

		return this;
	}

	/**
	 * Set refresh token
	 * @returns {TokenStorage}
	 */
	public setRefreshToken(token: string): TokenStorage {
		localStorage.setItem('refreshToken', token);

		return this;
	}

	/**
	 * Remove tokens
	 */
	public clear() {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('bmsSearchInputs');
	}

	public getItemLocalStorage(inputKey: string): string{
		return JSON.parse(localStorage.getItem('bmsSearchInputs')).find(x => x.key === inputKey).value;
	}

	public setItemLocalStorage(inputKey: string, inputValue: string): void{
		var bmsSearches = JSON.parse(localStorage.getItem('bmsSearchInputs'));
		if (bmsSearches != undefined && bmsSearches != null) {
			for (let i = 0; i < bmsSearches.length; i++) {
				if (bmsSearches[i].key == inputKey) {
					bmsSearches[i].value = inputValue;
				}
			}
		}
		localStorage.removeItem("bmsSearchInputs");
		localStorage.setItem("bmsSearchInputs", JSON.stringify(bmsSearches));
	}
}
