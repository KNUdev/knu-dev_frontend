import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadAnim } from './load-anim/load-anim.component';

@Component({
    selector: 'app-loading-screen',
    imports: [CommonModule, LoadAnim],
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss',
})
export class LoadingScreenComponent {}
