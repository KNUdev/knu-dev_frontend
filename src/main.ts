/// <reference types="@angular/localize" />

import { provideHttpClient } from '@angular/common/http';
import '@angular/localize/init';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideTranslateService()],
}).catch((err) => console.error(err));
