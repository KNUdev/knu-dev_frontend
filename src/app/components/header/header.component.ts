import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherService } from '../../services/languages/language-switcher.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [FormsModule],
})
export class HeaderComponent {
    private translate = inject(TranslateService);
    private router = inject(Router);
    protected languageSwitcher = LanguageSwitcherService(this.translate);

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }
}
