import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {provideRouter, TitleStrategy} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {catchError, from, of} from 'rxjs';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {register} from 'swiper/element';

import {routes} from './app.routes';
import {PageTitleStrategy} from './core/services/title-strategy.service';
import {httpInterceptor} from './core/interceptors/http.interceptor';

/* i18n */
registerLocaleData(localeEs);
registerLocaleData(localeEn);

export class LazyTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return from(import(`../../public/i18n/${lang}.json`)).pipe(
      catchError(() => of({}))
    );
  }
}

register();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    {provide: TitleStrategy, useClass: PageTitleStrategy},
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: LazyTranslateLoader,
        },
      })
    ),
  ],
};
