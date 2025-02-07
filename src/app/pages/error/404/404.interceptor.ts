import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {inject} from '@angular/core';
import {Router} from '@angular/router';

export function notFoundInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const router = inject(Router);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 404) {
                router.navigateByUrl('/error/404', { state: { fromInterceptor: true }})
            }
            return throwError(() => error);
        })
    );
}
