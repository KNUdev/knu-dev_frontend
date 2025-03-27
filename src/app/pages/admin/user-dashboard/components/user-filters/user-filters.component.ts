import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    ViewChildren,
    inject,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import {
    SelectOption,
    WriteDropDowns,
} from '../../../../../common/components/dropdown/write-dropdowns';
import { LabelInput } from '../../../../../common/components/input/label-input/label-input';
import { FilterParams } from '../../../../../services/admin/admin-accounts.service';
import { FilterOptionGroup } from '../../filter-options.model';

@Component({
    selector: 'app-user-filters',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        WriteDropDowns,
        LabelInput,
    ],
    templateUrl: './user-filters.component.html',
    styleUrls: ['./user-filters.component.scss'],
})
export class UserFiltersComponent implements OnInit {
    @Input() filters: FilterParams = {};
    @Input() filterOptions: FilterOptionGroup = {
        units: [],
        expertise: [],
        studyYears: [],
        technicalRoles: [],
    };
    @Input() departments: SelectOption[] = [];
    @Input() specialties: SelectOption[] = [];
    @Input() recruitments: SelectOption[] = [];
    @Input() isLoadingDepartments = false;
    @Input() isLoadingSpecialties = false;
    @Input() isLoadingRecruitments = false;
    @Input() searchInputValue = '';

    @Output() filtersChange = new EventEmitter<FilterParams>();
    @Output() searchChange = new EventEmitter<string>();
    @Output() searchBlurEvent = new EventEmitter<void>();
    @Output() searchKeyUpEvent = new EventEmitter<KeyboardEvent>();
    @Output() dateFilterChange = new EventEmitter<void>();
    @Output() dropdownChange = new EventEmitter<{
        field: keyof FilterParams;
        value: any;
    }>();
    @Output() resetFiltersEvent = new EventEmitter<void>();

    @ViewChildren(WriteDropDowns) filterDropdowns!: QueryList<WriteDropDowns>;

    searchForm: FormGroup;
    private fb = inject(FormBuilder);

    constructor() {
        this.searchForm = this.fb.group({
            searchInput: [''],
        });
    }

    ngOnInit(): void {
        this.searchForm.get('searchInput')?.setValue(this.searchInputValue, {
            emitEvent: false,
        });
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchChange.emit(target.value);
    }

    onSearchBlur(): void {
        this.searchBlurEvent.emit();
    }

    onSearchKeyUp(event: KeyboardEvent): void {
        this.searchKeyUpEvent.emit(event);
    }

    onDateFilterChange(): void {
        this.dateFilterChange.emit();
    }

    onDropdownChange(field: keyof FilterParams, value: any): void {
        this.dropdownChange.emit({ field, value });
    }

    resetFilters(): void {
        this.resetFiltersEvent.emit();
    }

    resetDropdownSelections(): void {
        setTimeout(() => {
            this.filterDropdowns.forEach((dropdown) => {
                dropdown.resetSelection();
            });
        });
    }
}
