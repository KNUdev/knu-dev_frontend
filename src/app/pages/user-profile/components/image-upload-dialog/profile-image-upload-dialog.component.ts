import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslatePipe} from '@ngx-translate/core';

export type UploadMode = 'avatar' | 'banner';

@Component({
    selector: 'profile-image-upload-dialog',
    standalone: true,
    templateUrl: './profile-image-upload-dialog.component.html',
    imports: [
        MatIcon,
        TranslatePipe
    ],
    styleUrls: ['./profile-image-upload-dialog.component.scss']
})
export class ProfileImageUploadDialogComponent {
    isNewFileSelected = signal<boolean>(false);
    @Input({required: true}) currentImageUrl?: string;
    @Output() fileSelected = new EventEmitter<File>();
    @Output() fileRemoved = new EventEmitter<never>();
    @Output() close = new EventEmitter<void>();
    private readonly closeDialogIconPath = "assets/icon/system/close.svg" as const;
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);
    private selectedFile = signal<File | undefined>(undefined);

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'closeDialog',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.closeDialogIconPath)
        );
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.currentImageUrl = URL.createObjectURL(file);
            this.selectedFile.set(file);
            this.isNewFileSelected.set(true);
        }
    }

    onFileRemove(): void {
        this.fileRemoved.emit();
    }

    onClose(): void {
        this.close.emit();
    }

    handleFileUpload() {
        this.fileSelected.emit(this.selectedFile());
    }

}
