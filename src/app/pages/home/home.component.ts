import {Component, ViewEncapsulation} from '@angular/core';
import { CampusComponent } from './components/campus/campus.component';
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
        TeamButtonComponent,
        PreCampusComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {}
