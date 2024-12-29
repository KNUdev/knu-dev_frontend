/// <reference types="@angular/localize" />

import { provideHttpClient } from '@angular/common/http';
import '@angular/localize/init';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/services/app.routes';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        provideTranslateService(),
        provideRouter(routes),
    ],
}).catch((err) => console.error(err));
