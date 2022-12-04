// Türkçe
export const locale = {
	lang: 'tr',
	data: {
		TRANSLATOR: {
			SELECT: 'Dil seçiniz.',
		},
		MENU: {
			DASHBOARD: 'Dashboard',
			MERCHANT: {
				SELF: 'Bayi',
				MANAGEMENT: 'Bayi Yönetim',
				GROUP: 'Grup Yönetim'
			},
			IDENTITY: {
				SELF: 'Kimlik',
				USERS: 'Kullanıcı',
				ROLES: 'Roller',
				HIERARCHY: 'Hiyerarşi',
			},
			DEFINITIONS:
			{
				SELF: 'Tanımlar',
				REGION: 'Bölge',
				COMPETITOR:'Rakip Firma',
				WAREHOUSE:'Depo',
				VEHICLES:
				{
					SELF: 'Araçlar',
					BRAND: 'Marka',
					MODEL: 'Model',
					CAPACITY:'Kapasite',
					VEHICLE:'Araç',
				} 
			},
			CRM:
			{
				SELF: 'CRM',
				GROUP: 'Grup',
				COMPANY: 'Şirket',
				MERCHANT: 'Müşteri'
			}
		},
		PROFILE: {
			CHANGE_PASSWORD: 'Şifreyi Değiştir',
			CANCEL: 'İptal',
			OLD_PASSWORD: 'Eski Şifre',
			NEW_PASSWORD: 'Yeni Şifre',
			NEW_PASSWORD_AGAIN: 'Yeni Şifre Tekrarı',
			SAVE: 'Kaydet'
		},
		IDENTITY:
		{
			ROLE:
			{
				NEW : 'Rol Ekle',
				ROLE_NAME: 'Rol Adı',
				LIST : 'Rol Listesi',
				CREATE: 'Rol Oluştur',
				EDIT: 'Rol Güncelle'
			},
			USER:
			{
				NEW : 'Kullanıcı Ekle',
				NAME: 'Ad',
				SURNAME: 'Soyad',
				LIST : 'Kullanıcı Listesi',
				CREATE: 'Kullanıcı Oluştur',
				EDIT: 'Kullanıcı Güncelle',
				EMAIL: 'E-mail',
				PHONE_NUMBER: 'Tel. No',
				STATUS: 'Statü',
				ACTIVE : 'Aktif',
				PASSIVE: 'Pasif',
				SET_ROLE: 'Rol Ata',
				SET_HIERARCHY: 'Hierarşi Ata',
				PASSWORD: 'Şifre'
			},
			HIERARCHY:
			{
				NEW : 'Hiyerarşi Ekle',
				ROLE_NAME: 'Hiyerarşi Adı',
				LIST : 'Hiyerarşi Listesi',
				CREATE: 'Hiyerarşi Oluştur',
				EDIT: 'Hiyerarşi Güncelle',
				TITLE: 'Hiyerarşi Adı',
				TITLE2: 'Ünvan'
			},
		},
		DEFINITION:
		{
			WAREHOUSE:
			{
				NEW : 'Depo Ekle',
				NAME: 'Depo Adı',
				LIST : 'Depo Listesi',
				CREATE: 'Depo Oluştur',
				EDIT: 'Depo Güncelle',
				PHONE_NUMBER: 'Tel. No',
				STATUS: 'Statü',
				ACTIVE : 'Aktif',
				PASSIVE: 'Pasif',
				REPRESENTETIVE: 'Sorumlu',
				LOGO_CODE: 'Logo Kodu',
				ADDRESS: 'Adres',
				CITY: 'Şehir'
			},
			REGION:
			{
				NEW : 'Bölge Ekle',
				NAME: 'Bölge Adı',
				LIST : 'Bölge Listesi',
				CREATE: 'Bölge Oluştur',
				EDIT: 'Bölge Güncelle',
				PHONE_NUMBER: 'Tel. No',
				STATUS: 'Statü',
				ACTIVE : 'Aktif',
				PASSIVE: 'Pasif',
				PHONE_CODE: 'Şehir Telefon Kodu',
				PLATE_CODE: 'Şehir Plaka Kodu',
				ADDRESS: 'Adres',
				CITY_NAME: 'Şehir Adı'
			},
			CITY:{
				SELF: 'Şehir'
			},
			COMPETITOR:{
				NEW : 'Rakip Firma Ekle',
				NAME: 'Rakip Firma Adı',
				LIST : 'Rakip Firma Listesi',
				CREATE: 'Rakip Firma Oluştur',
				EDIT: 'Rakip Firma Güncelle',
				CREATE_DATE: 'Oluşturma Tarihi',
				MODIFIED_DATE: 'Değiştirilme Tarihi',
				ACTIVE : 'Aktif',
				PASSIVE: 'Pasif',
				PHONE_CODE: 'Şehir Telefon Kodu',
				PLATE_CODE: 'Şehir Plaka Kodu',
				ADDRESS: 'Adres',
				CITY_NAME: 'Şehir Adı',
			},
			VEHICLE:
			{
				BRAND:
				{
					NAME:'Marka Adı',
					DESCRIPTION:'Açıklama',
					MODIFIED_DATE: 'Değişiklik Tarihi',
					NEW:'Marka Ekle',
					CREATE:'Marka Oluştur',
					LIST:'Araç Marka Listesi',
					EDIT: 'Marka Düzenle',
					LOGO: 'Logo'
				},
				MODEL:
				{
					NAME:'Model Adı',
					MODIFIED_DATE: 'Değişiklik Tarihi',
					NEW:'Model Ekle',
					CREATE:'Model Oluştur',
					LIST:'Araç Model Listesi',
					EDIT:'Model Düzenle',
					MAINTENANCE_YEAR:'Bakım Periyodu(Yıl)',
					MAINTENANCE_KM:'Bakım Periyodu(KM)'
				},
				CAPACITY:
				{
					NAME:'Kapasite Adı',
					MODIFIED_DATE: 'Değişiklik Tarihi',
					NEW:'Kapasite Ekle',
					CREATE:'Kapasite Oluştur',
					LIST:'Araç Kapasite Listesi',
					EDIT:'Kapasite Düzenle'
				},
				TYPE:'Araç Kapasitesi',
				VEHICLE:{
					NEW:'Araç Ekle',
					CREATE:'Araç Oluştur',
					LIST:'Araç Listesi',
					EDIT:'Araç Düzenle',
					PLATE:'Araç Plakası',
					TYPE:'Araç Tipi',
					MODEL:'Marka/Model',
					CAPACITY:'Kapasite',
					CITY:'İl(34)',
					CODE:'Kod(ABC)',
					CODE2:'Kod(123)',
					COMPANY:'Cihaz Takip Firması',
					FOLLOW_CODE:'Cihaz Takip Kodu',
					RENTAL:'Araç Kirası',
					YEAR:'Model Yılı',
					SELF:'Araçlar',
					LASTMAINTENANCEKM:'Son Bakım Kmsi'
				}
			}
		},
		CRM:
		{
			GROUP:{
				NEW : 'Grup Ekle',
				NAME: 'Grup Adı',
				LIST : 'Grup Listesi',
				CREATE: 'Grup Oluştur',
				EDIT: 'Grup Güncelle',
				CREATE_DATE: 'Oluşturma Tarihi',
				MODIFIED_DATE: 'Değiştirilme Tarihi',
				SELF: 'Grup'
			},
			COMPANY:
			{
				NEW : 'Şirket Ekle',
				NAME: 'Şirket Adı',
				LIST : 'Şirket Listesi',
				CREATE: 'Şirket Oluştur',
				EDIT: 'Şirket Güncelle',
				GROUP_NAME: 'Grup Adı',
				DESCRIPTION: 'Şirket Açıklaması',
				PLATE_CODE: 'Şehir Plaka Kodu',
				ADDRESS: 'Adres',
				CITY_NAME: 'Şehir Adı',
				SELF: 'Şirket'
			},
			MERCHANT:
			{
				NEW : 'Müşteri Ekle',
				NAME: 'Müşteri Adı',
				LIST : 'Müşteri Listesi',
				CREATE: 'Müşteri Yarat',
				EDIT: 'Müşteriyi Güncelle',
				COMPANY_NAME: 'Şirket Adı',
				DESCRIPTION: 'Müşteri Açıklaması',
				PLATE_CODE: 'Şehir Plaka Kodu',
				ADDRESS: 'Adres',
				CITY_NAME: 'Şehir Adı',
				ALIASNAME: 'Görünen Ad',
				CONTACT_PERSON: 'İlgili Kişi',
				CONTACT_PHONE: 'Tel No.',
				CONTACT_EMAIL: 'Mail',
				WEB: 'Web Adresi',
				LATITUDE: 'Enlem',
				LONGITUDE: 'Boylam',
				PHONE: 'Tel No',
				EMAIL: 'E-mail',
				DETAIL:{
					SELF:'Detay',
					HASSERVICE:'Servis Alıyor Mu?',
					VEHICLE:'Araç Detayı Gir',
					VEHICLE_ADD:'Araç Detayı Ekle',
					CONTRACT_PERIOD:'Kontrat Periyodu(Gün)',
					CR:'Müşteri Temsilcisi',
					PERSONAL_NUMBER:'Personal Sayısı',
					SHIFT_COUNT:'Vardiya Sayısı',
					VEHICLE_COUNT:'Araç Sayısı',
					YES:'Evet',
					NO:'Hayır',
					USERS:'İlgili Kişiler',
					USER_LIST:'İlgili Kişiler Listesi'
				},
				VEHICLE_COUNT:'Araç Sayısı',
				INTERVIEW:
				{
					SELF:'Görüşme',
					NEW:'Yeni Görüşme',
					CREATE:'Görüşme Oluştur',
					DATE:'Tarih',
					TIME:'Saat',
					TITLE:'Konu',
					TYPE:'Görüşme Şekli',
					LIST:'Görüşme Listesi',
					DESCRIPTION:'Görüşme Açıklaması',
					EDIT:'Görüşmeyi Güncelle',
				},
				CONTACT:
				{
					SELF: 'İlgili Kişi',
					contactPerson: 'Yetkili Şahıs',
					contactEmail: 'Email',
					contactPhone: 'Telefon Numarası',
					contactTitle: 'Ünvan',
				},
				CONTRACT:
				{
					SELF:'Sözleşme',
					FUELPROCESSPERCENTAGE:'Yakıt İşlem %si',
					DATE:'Sözleşme Tarihi',
					INFLATIONPROCESSPERCENTAGE:'Enflasyon İşlem %si',
					DESCRIPTION:'Sözleşme Açıklaması',
					NEW:'Yeni Sözleşme',
					CREATE:'Sözleşme Oluştur',
					LIST:'Sözleşme Listesi',
					INFLATIONCHECKPERIOD:'Enflasyon Kontrol Periyodu',
					FUELCHECKPERIOD:'Yakıt Kontrol Periyodu',
					PERCENTAGEOFINFLATIONPRICEWILLBEPROCESSED:'Enflasyon Fiyatının % Kaçına İşlenecek',
					PERCENTAGEOFFUELPRICEWILLBEPROCESSED:'Yakıt Fiyatının % Kaçına İşlenecek',
					EDIT:'Sözleşme Düzenle'
				},
				OFFER:
				{
					SELF:'Teklif',
					CREATE_DATE:'Oluşturulma Tarihi',
					MODIFIED_DATE:'Son İşlem Tarihi',
					USER_NAME:'Oluşturun Kişi',
					STATUS:'Durum',
					PROFIT:'Kar Çarpanı',
					FUELFEE:'Yakıt Fiyatı',
					NEW:'Yeni Teklif',
					CREATE:'Teklif Oluştur',
					LIST:'Teklif Listesi',
					EDIT:'Teklif Düzenle',
					DRIVER_COST:'Sürücü Maliyeti',
					PROJECTMANAGER_COST:'Proje Sorumlusu Maliyeti',
					CONTROLTOOL_COST:'Kontrol Aracı Maliyeti',
					CONTROLTOOL_COUNT:'Kontrol Aracı Adedi',
					FUELLITER_FEE:'Yakıt Litre Ücreti',
					FUELCOMMISSION_RATE:'Yakıt Komisyon Oranı',
					LETTER:'Teminat Mektubu Ücreti',
					ANNUAL:'Yıllık Finansman Ücreti',
					MULTIPLIER:'Kar Çarpanı',
					MIDI : 'Midi',
					MINI:'Mini',
					BUS:'Otobüs',
					CAR:'Otomobil',
					CUSTOMER_MATURITY:'Müşteri Vade',
					SUBCONTRACTOR_MATURITY:'Taşeron Vade',
					FUEL_MATURITY:'Yakıt Vade',
					DESCRIPTION:'Teklif Açıklaması',
					FILE_TYPE: 'Dosya Tipi',
					INSTALLED_FILES: 'Yüklü Dokümanlar'
				}

			},
		},
		MATPAGINATOR: {
			ITEMSPERPAGELABEL: 'Sayfa başına öğe',
			NEXT: 'İleri',
			PREV: 'Geri',
			FIRST: 'İlk Sayfa',
			LAST: 'Son Sayfa'
		},
		AUTH: {
			GENERAL: {
				OR: 'Veya',
				SUBMIT_BUTTON: 'Kaydet',
				NO_ACCOUNT: 'Hesabınız mı yok?',
				SIGNUP_BUTTON: 'Kaydol',
				FORGOT_BUTTON: 'Şifremi Unuttum',
				BACK_BUTTON: 'Geri',
				PRIVACY: 'Özel',
				LEGAL: 'Resmi',
				CONTACT: 'İletişim',
				CHANGE_PASSWORD : 'Kod Gönder',
				CONFIRM_CODE: 'Kodu Onayla',
				CODE_INFO:'E-mail e gelen kodu gir.',
				CODE_BUTTON:'Kontrol Et',
				NEW_PASSWORD:'Yeni Şifre',
				NEW_PASSWORD_AGAIN:'Yeni Şifre Tekrarı',
				COMPETITORS : 'Rakip Firmalar'
			},
			LOGIN: 
			{
				TITLE: 'Giriş Yap',
				EMAIL: 'E-Mail',
				PASSWORD: 'Şifre',
				BUTTON: 'Giriş Yap',
			},
			FORGOT: {
				TITLE: 'Şifreni mi unuttun?',
				DESC: 'Şifreni yenilemek için email giriniz',
			},
			REGISTER: {
				TITLE: 'Kaydol',
				DESC: 'Hesap bilgilerinizi giriniz',
				SUCCESS: 'Hesabınız başarıyla kaydedildi. Lütfen hesabınızla giriş yapınız.'
			},
			INPUT: {
				EMAIL: 'E-posta',
				FULLNAME: 'İsim',
				PASSWORD: 'Şifre',
				CONFIRM_PASSWORD: 'Şifre Tekrar',
			},
			VALIDATION: {
				INVALID: '{{name}} geçersiz',
				REQUIRED: '{{name}} gerekli',
				MIN_LENGTH: '{{name}} en az {{min}} olmalıdır.',
				AGREEMENT_REQUIRED: 'Katılım şartlarını okudum, oanylıyorum',
				NOT_FOUND: '{{name}} bulunamadı',
				INVALID_LOGIN: 'Giriş bilgileri geçersiz.'
			}
		},
		
		COMMON: {
			SELECTED_RECORDS_COUNT: 'Seçilen kayıt sayısı: ',
			ALL: 'Tümü',
			NONE: 'Hiçbiri',
			ACTIVE: 'Aktif',
			PASSIVE: 'Pasif',
			FILTER: 'Filtre',
			BY_STATUS: 'Durum',
			BY_TYPE: 'Tip',
			SEARCH: 'Ara',
			NO_ENTRIES: 'Sonuç bulunamadı',
			IN_ALL_FIELDS: 'tüm alanlarda',
			NAME: 'Adı',
			TYPE: 'Tip',
			ACTIONS: 'İşlemler',
			NO_RECORDS_FOUND: 'Kayıt bulunamadı',
			DELETE_ALL: 'Tümünü Sil',
			FORM_ERROR_MSG: 'Giridiğiniz değerleri kontrol edip tekrar giriniz.',
			SAVE: 'Kaydet',
			CANCEL: 'İptal',
			SAVE_CHANGES: 'Değişiklikleri kaydet',
			CANCEL_CHANGES: 'Değişiklikleri iptal et',
			ENTER_CHANNEL_NAME: 'Kanal adı giriniz',
			DELETE_SELECTED: 'Seçilenleri sil',
			FETCH_SELECTED: 'Seçilenleri getir',
			MORE_ACTIONS: 'Daha fazla işlem',
			CLAIM_TITLE: 'Yetki Seç',
			STATUS: 'Durum',
			DOWNLOAD_FILE: 'Dosyayı İndir',
			ABOUT: 'Hakkında',

			BUTTONS: {
				OK: 'Tamam',
				CANCEL: 'İptal',
				CLOSE: 'Kapat',
				SAVE: 'Kaydet',
				DELETE: 'Sil',
				ADD: 'Ekle',
				EDIT: 'Güncelle',
				UPDATE_STATUS: 'Durum Güncelle',
				MORE_ACTIONS: 'Diğer İşlemler',
				SAVE_CHANGES: 'Değişiklikleri Kaydet',
				PUBLISH: 'Yayınla',
				BACK: 'Geri',
				DONE: 'Tamam',
				DOWNLOAD: 'İndir',
				LOGOUT: 'Çıkış',
				SEARCH: 'Ara',
				EXPORT_EXCEL: 'Excel Al',
				IMPORT_EXCEL: 'Excel Yükle',
				NO: 'Hayır',
				YES: 'Evet',
				CHANGE_STATUS: 'Statü Değiştir',
				CREATE: 'Ekle',
				DETAIL: 'Detay Gir'
			},
			CONFIRMATION: {
				TITLE: 'Bilgi...',
				DESC: 'İşlemi onaylıyor musunuz?',
				WAIT_DESC: 'İşleminiz gerçekleştiriliyor...',
				MESSAGE: 'İşleminiz başarıyla gerçekleştirilmiştir.'
			},
			DELETE: {
				TITLE: 'Kayıt Sil',
				DESC: 'Kaydı silmek istediğinize emin misiniz?',
				WAIT_DESC: 'Kayıt siliniyor...',
				MESSAGE: 'Kayıt silindi.'
			},
			DELETE_MULTI: {
				TITLE: 'Kayıtları Sil',
				DESC: 'Kayıtları silmek istediğinize emin misiniz?',
				WAIT_DESC: 'Kayıtlar siliniyor...',
				MESSAGE: 'Kayıtlar silindi.'
			},
			DASHBOARD: {
				TITLE: 'Dashboard',
				DESCRIPTION: ''
			},
			PROFILE: {
				TITLE: 'Profilim',
				DESCRIPTION: 'Kullanıcı Bilgilerim',
				CHANGEPASSWORD: 'Şifreyi Değiştir',
			},
			EXCEL:
			{
				USERS : 'Kullanıcı',
				HIERARCHIES : 'Hiyerarşi',
				ROLES: 'Rol',
				REGIONS: 'Bölge',
				COMPETITORS:'Rakip Firma',
				GROUP: 'Grup',
				COMPANY: 'Şirket',
				MERCHANT: 'Satıcı',
				VEHICLE_BRAND:'Marka',
				VEHICLE_MODEL:'Model',
				VEHICLE_CAPACITY:'Kapasite',
				MERCHANT_CONTACT:'Satıcı Kullanıcıları',
				MERCHANT_INTERVIEW:'Görüşmeler',
				MERCHANT_CONTRACT:'Sözleşme',
				MERCHANT_OFFER:'Teklif',
				VEHICLE_SELF:'Araçlar'
			},
			NOTFOUND: {
				TITLE: 'Sayfa bulunamadı!',
				DESCRIPTION: ''
			}
		}
	}
};
