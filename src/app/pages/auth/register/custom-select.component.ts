import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';

interface Department {
    id: string;
    name: {
        ukName: string;
        enName: string;
    };
}

interface SelectOption {
    id: string;
    codeName?: string;
    name?: {
        ukName: string;
        enName: string;
    };
    displayedName?: string;
    visible?: boolean;
}

interface FilteredOption extends SelectOption {
    visible: boolean;
    matchScore?: number;
}

@Component({
    selector: 'app-custom-select',
    imports: [CommonModule, FormsModule],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomSelectComponent),
            multi: true,
        },
    ],
    template: `
        <div class="select-container" [class.open]="isOpen">
            <div
                class="select-header"
                (click)="toggleDropdown()"
                [class.has-value]="selectedOption"
                [class.focused]="isOpen"
            >
                <input
                    *ngIf="isOpen && searchable"
                    type="text"
                    [(ngModel)]="searchQuery"
                    (input)="filterOptions()"
                    (click)="preventClose($event)"
                    class="search-input"
                    placeholder="Пошук..."
                />
                <span
                    *ngIf="!isOpen || !searchable"
                    class="select-value"
                    (click)="toggleDropdown($event)"
                >
                    {{
                        selectedOption
                            ? getDisplayValue(selectedOption)
                            : placeholder
                    }}
                </span>
                <svg
                    class="arrow-icon"
                    [class.open]="isOpen"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                </svg>
            </div>

            <div *ngIf="isOpen" class="select-dropdown">
                <div
                    *ngFor="let option of filteredOptions"
                    class="option-item"
                    [class.selected]="option[valueField] === selectedOption?.[valueField]"
                    [class.faded]="!option.visible"
                    (click)="selectOption(option)"
                >
                    <span
                        [innerHTML]="
                            searchable
                                ? highlightText(getDisplayValue(option))
                                : getDisplayValue(option)
                        "
                    ></span>
                </div>

                <div
                    *ngIf="searchable && searchQuery && !filteredOptions.length"
                    class="no-results"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path
                            d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5z"
                            fill="currentColor"
                        />
                        <path
                            d="M11 10h2v5h-2zm0 6h2v2h-2z"
                            fill="currentColor"
                        />
                    </svg>
                    <span
                        >По запиту "{{ searchQuery }}" нічого не знайдено</span
                    >
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .select-container {
                position: relative;
                width: 100%;
                font-family: system-ui, -apple-system, sans-serif;
            }

            .disabled {
                opacity: 0.6;
                cursor: not-allowed;

                .select-header {
                    background-color: #f5f5f5;
                    pointer-events: none;
                }
            }

            .select-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 4px;
                cursor: pointer;
                min-height: 48px;
                color: #999;
                transition: all 0.2s ease;
            }

            .select-header.focused {
                border-color: #ffd700;
            }

            .select-header.has-value {
                color: #fff;
            }

            .search-input {
                width: 100%;
                padding: 8px;
                border: none;
                background: transparent;
                color: #fff;
                outline: none;
                font-size: 16px;
            }

            .search-input::placeholder {
                color: #666;
            }

            .select-value {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }

            .arrow-icon {
                transition: transform 0.2s ease;
                margin-left: 8px;
                color: #666;
            }

            .arrow-icon.open {
                transform: rotate(180deg);
            }

            .select-dropdown {
                position: absolute;
                top: calc(100% + 4px);
                left: 0;
                right: 0;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 4px;
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
            }

            .option-item {
                padding: 12px 16px;
                cursor: pointer;
                color: #fff;
                transition: background-color 0.2s ease, color 0.2s ease;
            }

            .option-item.faded {
                color: #666; /* Серый цвет для ослабленных элементов */
            }

            .option-item:hover {
                background: #333;
            }

            .option-item.selected {
                background: #2a2a2a;
            }

            .no-results {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                color: #666;
                gap: 8px;
                flex-direction: column;
            }

            .highlight {
                color: #ffd700; /* Жёлтый для подсветки текста */
                font-weight: bold;
            }

            .select-dropdown::-webkit-scrollbar {
                width: 8px;
            }

            .select-dropdown::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .select-dropdown::-webkit-scrollbar-thumb {
                background: #333;
                border-radius: 4px;
            }

            .select-dropdown::-webkit-scrollbar-thumb:hover {
                background: #444;
            }
        `,
    ],
})
export class CustomSelectComponent implements ControlValueAccessor {
    @Input() options: SelectOption[] = [];
    @Input() placeholder = 'Select an option';
    @Input() searchable = true;
    @Input() valueField: 'id' | 'codeName' = 'id';
    @Input() displayField: 'name.ukName' | 'displayedName' = 'name.ukName';
    @Output() selectionChange = new EventEmitter<any>();

    isOpen = false;
    disabled = false;
    selectedOption: any = null;
    searchQuery = '';
    filteredOptions: FilteredOption[] = [];

    private onChange: any = () => {};
    private onTouched: any = () => {};

    ngOnInit() {
        this.resetFilter();
    }

    getDisplayValue(option: SelectOption): string {
        if (this.displayField === 'name.ukName') {
            return option.name?.ukName || '';
        }
        return option.displayedName || '';
    }

    // Update selectOption method
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
        if (!this.searchable) {
            return;
        }

        const query = this.searchQuery.toLowerCase().trim();

        this.filteredOptions = this.options
            .map((option) => ({
                ...option,
                visible: this.getDisplayValue(option)
                    .toLowerCase()
                    .includes(query),
                matchScore: this.getMatchScore(
                    this.getDisplayValue(option).toLowerCase(),
                    query
                ),
            }))
            .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
            .filter((option) => option.visible);
    }

    private getMatchScore(text: string, query: string): number {
        if (!query) return 100;
        if (text === query) return 90;
        if (text.startsWith(query)) return 80;
        if (text.includes(query)) return 70;
        return 0;
    }

    resetFilter(): void {
        this.filteredOptions = this.options.map((option) => ({
            ...option,
            visible: true,
        }));
    }

    highlightText(text: string): string {
        if (!this.searchQuery) return text;
        const query = this.searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape RegEx
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    constructor(private elementRef: ElementRef) {}

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
            event.stopPropagation();
        }

        if (!this.disabled) {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.onTouched();
                this.resetFilter();

                // Опционально: фокус на поле поиска при открытии
                setTimeout(() => {
                    const searchInput =
                        this.elementRef.nativeElement.querySelector(
                            '.search-input'
                        );
                    if (searchInput) {
                        searchInput.focus();
                    }
                });
            }
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

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
