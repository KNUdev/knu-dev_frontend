import {Component, Input, Output, EventEmitter, signal, inject} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

export type UploadMode = 'avatar' | 'banner';

@Component({
    selector: 'profile-image-upload-dialog',
    standalone: true,
    templateUrl: './profile-image-upload-dialog.component.html',
    imports: [
        MatIcon
    ],
    styleUrls: ['./profile-image-upload-dialog.component.scss']
})
export class ProfileImageUploadDialogComponent {
    private readonly closeDialogIconPath = "assets/icon/system/close.svg" as const;
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'closeDialog',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.closeDialogIconPath)
        );
    }

    isNewFileSelected = signal<boolean>(false);
    @Input({required: true}) currentImageUrl?: string;
    @Output() fileSelected = new EventEmitter<File>();
    @Output() fileRemoved = new EventEmitter<never>();
    @Output() close = new EventEmitter<void>();

    selectedFileName: string = 'Завантажити новий аватар';

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.currentImageUrl = URL.createObjectURL(file);
            this.selectedFileName = file.name;
            this.isNewFileSelected.set(true);
            this.fileSelected.emit(file);
        }
    }

    onFileRemove(): void {
        this.fileRemoved.emit();
    }

    onClose(): void {
        this.close.emit();
    }

}
