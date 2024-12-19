import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    get logoPath() {
        return 'assets/footer/KNULogo.png';
    }

    socialLinks = [
        {
            item: [
                { name: 'instagram', link: 'assets/social networks/inst.svg' },
                { name: 'telegram', link: 'assets/social networks/tg.svg' },
            ],
        },
    ];

    institutes = [
        {
            title: 'ІНСТИТУТИ',
            items: [
                {
                    name: 'Навчально-науковий інститут “Інститут геології”',
                    link: 'https://geology.knu.ua/',
                },
                {
                    name: 'Військовий інститут',
                    link: 'https://mil.knu.ua/ua/',
                },
                {
                    name: 'Інститут Управління державної охорони України',
                    link: 'https://institute.do.gov.ua/',
                },
                {
                    name: 'Інститут післядипломної освіти',
                    link: 'https://ipe.knu.ua/',
                },
                {
                    name: 'Навчально-науковий інститут',
                    link: 'https://philology.knu.ua/',
                },
            ],
        },
    ];

    faculties = [
        {
            title: 'ФАКУЛЬТЕТИ',
            items: [
                {
                    name: 'Географічний факультет',
                    link: 'https://geo.knu.ua/',
                },
                {
                    name: 'Економічний факультет',
                    link: 'https://econom.knu.ua/',
                },
                {
                    name: 'Історичний факультет',
                    link: 'http://www.history.univ.kiev.ua/',
                },
                {
                    name: 'Математичний факультет',
                    link: 'https://mechmat.knu.ua/',
                },
                {
                    name: 'Факультет інформаційних технологій',
                    link: 'https://fit.knu.ua/',
                },
            ],
        },
    ];
}
