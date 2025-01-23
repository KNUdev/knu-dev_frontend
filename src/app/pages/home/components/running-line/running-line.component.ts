import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Logo {
    name: string;
    url: string;
}

@Component({
    selector: 'running-line',
    imports: [CommonModule],
    templateUrl: './running-line.component.html',
    styleUrl: './running-line.component.scss',
})
export class RunningLineComponent {
    logos: Logo[] = [
        { name: 'Spring', url: 'assets/icon/companyLogo/spring.svg' },
        { name: 'Neo4j', url: 'assets/icon/companyLogo/neo4j.svg' },
        { name: 'Docker', url: 'assets/icon/companyLogo/docker.svg' },
        { name: 'AWS', url: 'assets/icon/companyLogo/aws.svg' },
        { name: 'Angular', url: 'assets/icon/companyLogo/angular.svg' },
        { name: 'Java', url: 'assets/icon/companyLogo/java.svg' },
        { name: 'Hibernate', url: 'assets/icon/companyLogo/hibernate.svg' },
        { name: 'Mongo', url: 'assets/icon/companyLogo/mongo.svg' },
        { name: 'RsJs', url: 'assets/icon/companyLogo/rsjs.svg' },
    ];

    doubledLogos = [...this.logos, ...this.logos, ...this.logos];
}
