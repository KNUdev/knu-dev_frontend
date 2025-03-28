import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LoadingScreenComponent } from './components/loading/loading.component';
import { LoadingService } from './services/loading.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        HeaderComponent,
        FooterComponent,
        LoadingScreenComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    private router = inject(Router);

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }

    constructor(protected loadingService: LoadingService) {
        window.addEventListener('load', this.hideLoadingScreen.bind(this));

        const backupTimeout = setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);

        window.addEventListener('load', () => {
            clearTimeout(backupTimeout);
        });
    }

    private hideLoadingScreen(): void {
        if (this.loadingService.isLoading()) {
            setTimeout(() => {
                this.loadingService.hide();
            }, 500);
        }
    }
}
