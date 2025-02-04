import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RoleList } from '../../../../common/components/role-list/role-list.component';

@Component({
    selector: 'career-path',
    templateUrl: './career-path.component.html',
    styleUrl: './career-path.component.scss',
    imports: [CommonModule, TranslateModule, RoleList],
})
export class CareerPathComponent {}
