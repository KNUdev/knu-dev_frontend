import {Component, Inject} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {BackdropWindowComponent} from '../../../../common/components/backdrop-window/backdrop-window.component';

export interface ConfirmDialogData {
    message: string;
    buttonText: string;
}

@Component({
    selector: 'app-confirm-dialog',
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogTitle,
        BackdropWindowComponent
    ],
    templateUrl: './confirm-dialog.component.html',
    standalone: true,
    styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

}
