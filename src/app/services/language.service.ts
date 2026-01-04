import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLang: string = 'en';

    constructor(private translate: TranslateService) {
        const savedLang = localStorage.getItem('appLanguage') || 'en';
        this.setLanguage(savedLang);
    }

    setLanguage(lang: string): void {
        this.currentLang = lang;
        this.translate.use(lang);
        localStorage.setItem('appLanguage', lang);

        // Update HTML dir and lang attributes for RTL support
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('lang', lang);
        htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    getCurrentLanguage(): string {
        return this.currentLang;
    }

    toggleLanguage(): void {
        const newLang = this.currentLang === 'en' ? 'ar' : 'en';
        this.setLanguage(newLang);
    }
}
