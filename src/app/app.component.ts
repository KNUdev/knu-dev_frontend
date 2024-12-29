import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    private router = inject(Router);

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }
}
