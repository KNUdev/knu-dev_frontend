import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { languageSwitcher } from '../../services/languages/language-switcher';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [FormsModule],
})
export class HeaderComponent {
    private translate = inject(TranslateService);
    private router = inject(Router);
    protected languageSwitcher = languageSwitcher(this.translate);

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }
}
