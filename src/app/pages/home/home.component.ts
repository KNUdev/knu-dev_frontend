import { Component, inject, ViewEncapsulation } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';
import { I18nService } from '../../services/languages/i18n.service';
import { CampusComponent } from './components/campus/campus.component';
import { CareerPathComponent } from './components/career-path/career-path.component';
import { HomeHeaderComponent } from './components/home-header/home-header.component';
import { PreCampusComponent } from './components/pre-campus/pre-campus.component';
import { RunningLineComponent } from './components/running-line/running-line.component';
import { TeamButtonComponent } from './components/team-button/team-button.component';

@Component({
    selector: 'app-home',
    imports: [
        HomeHeaderComponent,
        RunningLineComponent,
        CampusComponent,
        CareerPathComponent,
        TeamButtonComponent,
        PreCampusComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);

    constructor() {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/home',
                        event.lang
                    )
                )
            )
            .subscribe();
    }
}
