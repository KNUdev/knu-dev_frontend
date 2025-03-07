import {CommonModule} from '@angular/common';
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
    ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

export interface LocalizedName {
    uk: string;
    en: string;
}

export interface SelectOption {
    id: string;
    codeName?: string;
    name?: LocalizedName;
    displayedName?: string;
    description?: string;
    disabled?: boolean;
    group?: string;
}

interface FilteredOption extends SelectOption {
    visible: boolean;
    matchScore: number;
}

@Component({
    selector: 'register-write-dropdowns',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, TranslateModule],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => WriteDropDowns),
            multi: true
        }
    ],
    templateUrl: './write-dropdowns.html',
    styleUrls: ['./write-dropdowns.scss']
})
export class WriteDropDowns implements ControlValueAccessor {
    private static currentOpenDropdown: WriteDropDowns | null = null;
    @Input() hasError = false;
    @Input() errorMessage = '';
    @Input() placeholder = 'Select an option';
    @Input() valueField: 'id' | 'codeName' = 'id';
    @Input() defaultSelectedId?: string;
    @Output() selectionChange = new EventEmitter<any>();
    @ViewChild('searchInput') searchInput!: ElementRef;
    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        errorTriangle: 'assets/icon/system/errorTriangle.svg',
        errorQuadrilateral: 'assets/icon/system/errorQuadrilateral.svg'
    } as const;
    isOpen = false;
    disabled = false;
    selectedOption: SelectOption | null = null;
    searchQuery = '';
    filteredOptions: FilteredOption[] = [];
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    constructor(private elementRef: ElementRef) {
        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowDown)
        );
        this.matIconRegistry.addSvgIcon(
            'errorTriangle',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorTriangle
            )
        );
        this.matIconRegistry.addSvgIcon(
            'errorQuadrilateral',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorQuadrilateral
            )
        );

        this.translate.onLangChange.subscribe(() => {
            if (this.selectedOption) {
                const currentId = this.selectedOption[this.valueField];
                setTimeout(() => {
                    const updatedOption = this._options.find(
                        (opt) => opt[this.valueField] === currentId
                    );
                    if (updatedOption) {
                        this.selectedOption = updatedOption;
                        this.onChange(updatedOption[this.valueField]);
                        this.selectionChange.emit(updatedOption);
                    }
                    this.resetFilter();
                }, 100);
            }
        });
    }

    private _options: SelectOption[] = [];

    get options(): SelectOption[] {
        return this._options;
    }

    @Input()
    set options(value: SelectOption[]) {
        this._options = value || [];
        if (this.defaultSelectedId && !this.selectedOption) {
            const found = this._options.find(
                (o) => o.id === this.defaultSelectedId
            );
            if (found) {
                this.selectedOption = found;
                const v = this.valueField === 'id' ? found.id : found.codeName || found.id;
                this.onChange(v);
                this.selectionChange.emit(found);
            }
        }
        this.resetFilter();
    }

    get hasNoResults(): boolean {
        return (
            !!this.searchQuery &&
            !this.filteredOptions.some((opt) => opt.visible)
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

    getDisplayValue(option: SelectOption): string {
        if (option?.name) {
            const name =
                this.translate.currentLang === 'uk'
                    ? option.name.uk
                    : option.name.en;

            if (option.codeName) {
                return `${option.codeName} - ${name}`;
            }
            return name;
        }
        return option?.displayedName || '';
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

        this.filteredOptions = this._options
            .map((option): FilteredOption => {
                const displayValue = this.getDisplayValue(option).toLowerCase();
                const visible = !query || displayValue.includes(query);
                const matchScore = this.getMatchScore(displayValue, query);

                return {
                    ...option,
                    visible,
                    matchScore
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    resetFilter(): void {
        this.filteredOptions = this._options.map(
            (option): FilteredOption => ({
                ...option,
                visible: true,
                matchScore: 100
            })
        );
    }

    highlightText(text: string): string {
        if (!this.searchQuery) return text;
        const query = this.searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    writeValue(value: any): void {
        if (value) {
            this.selectedOption = this._options.find((opt) => opt.id === value) ?? null;
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

    private onChange: any = () => {
    };

    private onTouched: any = () => {
    };

    private focusSearchInput(): void {
        setTimeout(() => {
            this.searchInput?.nativeElement?.focus();
        });
    }

    private getMatchScore(text: string, query: string): number {
        if (!query) return 100;
        if (text === query) return 90;
        if (text.startsWith(query)) return 80;
        if (text.includes(query)) return 70;
        return 0;
    }
}

