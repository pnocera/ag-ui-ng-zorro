import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideNzI18n(en_US)
  ]
};