import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function ngrokHeaderInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    // Clone the request and add the ngrok header
    const modifiedReq = req.clone({
        headers: req.headers.set('ngrok-skip-browser-warning', 'true'),
    });

    // Pass the modified request to the next handler
    return next(modifiedReq);
}
