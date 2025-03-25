import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent<T> implements OnChanges {
    @Input() totalItems: number = 0;
    @Input() currentPage: number = 0;
    @Input() pageSize: number = 10;
    @Input() isLoading: boolean = false;

    @Output() pageChange = new EventEmitter<number>();

    paginationArray: (number | string)[] = [];
    totalPages: number = 0;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['totalItems'] || changes['pageSize']) {
            this.calculateTotalPages();
            this.generatePaginationArray();
        } else if (changes['currentPage']) {
            this.generatePaginationArray();
        }
    }

    private calculateTotalPages(): void {
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    }

    generatePaginationArray(): void {
        this.paginationArray = [];

        if (this.totalPages <= 1) return;

        this.paginationArray.push(0);

        if (this.totalPages <= 5) {
            for (let i = 1; i < this.totalPages; i++) {
                this.paginationArray.push(i);
            }
            return;
        }

        const current = this.currentPage;
        const last = this.totalPages - 1;

        if (current <= 2) {
            this.paginationArray.push(1, 2, 3, '...', last);
        } else if (current >= last - 2) {
            this.paginationArray.push(
                '...',
                last - 3,
                last - 2,
                last - 1,
                last
            );
        } else {
            this.paginationArray.push(
                '...',
                current - 1,
                current,
                current + 1,
                '...',
                last
            );
        }
    }

    goToPage(page: number): void {
        if (
            page !== this.currentPage &&
            page >= 0 &&
            page < this.totalPages &&
            !this.isLoading
        ) {
            this.pageChange.emit(page);
        }
    }

    previousPage(): void {
        if (this.currentPage > 0 && !this.isLoading) {
            this.goToPage(this.currentPage - 1);
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages - 1 && !this.isLoading) {
            this.goToPage(this.currentPage + 1);
        }
    }
}
