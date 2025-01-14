import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    inject,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

interface SelectOption {
    id: string;
    codeName?: string;
    name?: {
        ukName: string;
        enName: string;
    };
    displayedName?: string;
    visible?: boolean;
    matchScore?: number;
}

interface FilteredOption extends Omit<SelectOption, 'visible'> {
    visible: boolean;
    matchScore: number;
}

@Component({
    selector: 'write-dropdowns',
    imports: [CommonModule, FormsModule, MatIconModule],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => WriteDropDowns),
            multi: true,
        },
    ],
    templateUrl: './write-dropdowns.html',
    styleUrls: ['./write-dropdowns.scss'],
})
export class WriteDropDowns implements ControlValueAccessor {
    @Input() options: SelectOption[] = [];
    @Input() placeholder = 'Select an option';
    @Input() valueField: 'id' | 'codeName' = 'id';
    @Input() displayField: 'name.ukName' | 'displayedName' = 'name.ukName';
    @Output() selectionChange = new EventEmitter<any>();
    private static currentOpenDropdown: WriteDropDowns | null = null;
    @ViewChild('searchInput') searchInput!: ElementRef;

    readonly iconPaths = {
        errorTriangle: 'assets/icon/system/errorTriangle.svg',
    } as const;

    private focusSearchInput(): void {
        setTimeout(() => {
            this.searchInput?.nativeElement?.focus();
        });
    }

    get hasNoResults(): boolean {
        return (
            !!this.searchQuery &&
            !this.filteredOptions.some((opt) => opt.visible)
        );
    }

    isOpen = false;
    disabled = false;
    selectedOption: any = null;
    searchQuery = '';
    filteredOptions: FilteredOption[] = [];

    private onChange: any = () => {};
    private onTouched: any = () => {};

    getDisplayValue(option: SelectOption): string {
        if (this.displayField === 'name.ukName' && option.name?.ukName) {
            return option.name.ukName;
        }
        if (this.displayField === 'displayedName' && option.displayedName) {
            return option.displayedName;
        }
        return option.displayedName || option.name?.ukName || '';
    }

    selectOption(option: SelectOption): void {
        this.selectedOption = option;
        this.isOpen = false;
        this.searchQuery = '';
        this.resetFilter();

        const value =
            this.valueField === 'id' ? option.id : option.codeName || option.id;

        this.onChange(value);
        this.selectionChange.emit(option);
    }

    filterOptions(): void {
        const query = this.searchQuery.toLowerCase().trim();

        this.filteredOptions = this.options
            .map((option): FilteredOption => {
                const displayValue = this.getDisplayValue(option).toLowerCase();
                const visible = !query || displayValue.includes(query);
                const matchScore = this.getMatchScore(displayValue, query);

                return {
                    ...option,
                    visible,
                    matchScore,
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    private getMatchScore(text: string, query: string): number {
        if (!query) return 100;
        if (text === query) return 90;
        if (text.startsWith(query)) return 80;
        if (text.includes(query)) return 70;
        return 0;
    }

    resetFilter(): void {
        this.filteredOptions = this.options.map(
            (option): FilteredOption => ({
                ...option,
                visible: true,
                matchScore: 100,
            })
        );
    }

    highlightText(text: string): string {
        if (!this.searchQuery) return text;
        const query = this.searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    constructor(private elementRef: ElementRef) {
        this.resetFilter();
        this.matIconRegistry.addSvgIcon(
            'errorTriangle',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorTriangle
            )
        );
    }

    @HostListener('document:click', ['$event'])
    clickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
            this.searchQuery = '';
            this.resetFilter();
        }
    }

    preventClose(event: Event) {
        event.stopPropagation();
    }

    toggleDropdown(event?: Event): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.disabled) return;

        if (
            WriteDropDowns.currentOpenDropdown &&
            WriteDropDowns.currentOpenDropdown !== this
        ) {
            WriteDropDowns.currentOpenDropdown.isOpen = false;
            WriteDropDowns.currentOpenDropdown.resetFilter();
        }

        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            WriteDropDowns.currentOpenDropdown = this;
            this.resetFilter();
            this.focusSearchInput();
        } else {
            WriteDropDowns.currentOpenDropdown = null;
        }
    }

    ngOnDestroy(): void {
        if (WriteDropDowns.currentOpenDropdown === this) {
            WriteDropDowns.currentOpenDropdown = null;
        }
    }

    writeValue(value: any): void {
        if (value) {
            this.selectedOption = this.options.find((opt) => opt.id === value);
        } else {
            this.selectedOption = null;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
