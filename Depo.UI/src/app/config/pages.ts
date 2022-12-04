import { ConfigModel } from '../core/interfaces/config';

export class PagesConfig implements ConfigModel {
	public config: any = {};

	constructor() {
		this.config = {
			'/': {
				page: {
					title: 'COMMON.DASHBOARD.TITLE',
					desc: 'COMMON.DASHBOARD.DESCRIPTION',
					subheader: true
				}
			},
			profile: {
				page: { title: 'COMMON.PROFILE.TITLE', desc: '', subheader: false }
			},
			404: {
				page: { title: 'COMMON.NOTFOUND.TITLE', desc: '', subheader: false }
			}
		};
	}
}
