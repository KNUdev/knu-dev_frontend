import { Component } from '@angular/core';

type Department = {
    ukName: string;
    enName?: string;
    link: string;
};

type DepartmentGroup = {
    title: string;
    items: Department[];
};

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    get logoPath(): string {
        return 'assets/footer/KNULogo.svg';
    }

    socialLinks: { name: string; link: string }[] = [
        { name: 'instagram', link: 'assets/social networks/inst.svg' },
        { name: 'telegram', link: 'assets/social networks/tg.svg' },
    ];

    departments: { institutes: DepartmentGroup; faculties: DepartmentGroup } = {
        institutes: {
            title: 'ІНСТИТУТИ',
            items: [
                {
                    ukName: 'Навчально-науковий інститут "Інститут геології"',
                    link: 'https://geology.knu.ua/',
                },
                {
                    ukName: 'Військовий інститут',
                    link: 'https://mil.knu.ua/ua/',
                },
                {
                    ukName: 'Інститут Управління державної охорони України',
                    link: 'https://institute.do.gov.ua/',
                },
                {
                    ukName: 'Інститут післядипломної освіти',
                    link: 'https://ipe.knu.ua/',
                },
                {
                    ukName: 'Навчально-науковий інститут',
                    link: 'https://philology.knu.ua/',
                },
            ],
        },
        faculties: {
            title: 'ФАКУЛЬТЕТИ',
            items: [
                {
                    ukName: 'Географічний факультет',
                    link: 'https://geo.knu.ua/',
                },
                {
                    ukName: 'Економічний факультет',
                    link: 'https://econom.knu.ua/',
                },
                {
                    ukName: 'Історичний факультет',
                    link: 'http://history.univ.kiev.ua/',
                },
                {
                    ukName: 'Математичний факультет',
                    link: 'https://mechmat.knu.ua/',
                },
                {
                    ukName: 'Факультет інформаційних технологій',
                    link: 'https://fit.knu.ua/',
                },
            ],
        },
    };
}
