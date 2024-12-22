import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
    selector: 'app-home',
    imports: [FooterComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {}
