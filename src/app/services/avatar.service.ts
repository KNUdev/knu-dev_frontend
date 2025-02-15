import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    private avatarUrl = new BehaviorSubject<string>('');

    currentAvatarUrl$ = this.avatarUrl.asObservable();

    updateAvatarUrl(url: string) {
        this.avatarUrl.next(url);
    }
}
