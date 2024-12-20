import { Component } from '@angular/core';
import { FooterComponent } from './footer/footer.component';

@Component({
    selector: 'app-root',
    imports: [FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {}
