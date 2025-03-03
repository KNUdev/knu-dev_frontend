import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'app-backdrop-window',
    imports: [
        MatIcon
    ],
    templateUrl: './backdrop-window.component.html',
    standalone: true,
    styleUrl: './backdrop-window.component.scss'
})
export class BackdropWindowComponent implements OnInit {
    @Output() close = new EventEmitter();
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);

    ngOnInit(): void {
        this.matIconRegistry.addSvgIcon(
            'closeDialog',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/close.svg')
        );
    }

    public onClose() {
        this.close.emit();
    }

}
