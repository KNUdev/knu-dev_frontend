import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LoadingScreenComponent } from './components/loading/loading.component';
import { LoadingService } from './services/loading.services';

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
    constructor(protected loadingService: LoadingService) {}

    ngOnInit() {
        // Hide loading screen after resources are loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loadingService.hide();
            }, 500); // Add small delay for smoother transition
        });
    }
    private router = inject(Router);

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }
}
