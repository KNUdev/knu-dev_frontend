import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FooterComponent } from './footer/footer.component';

@Component({
    selector: 'app-root',
    imports: [FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    constructor(private translate: TranslateService) {
        translate.setDefaultLang('uk');
        translate.use('uk');
    }

    switchLang(event: any) {
        const lang = event.target.value;
        this.translate.use(lang);
    }
}
