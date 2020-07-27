import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpinnerService } from '../service/spinner.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor(private spinnerService: SpinnerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinnerService.show();

    return next
    		.handle(request)
    		.pipe(
    			tap((event: HttpEvent<any>) => {
    				if (event instanceof HttpResponse) {
    					this.spinnerService.hide();
    				}
    			}, (error) => {
    				this.spinnerService.hide();
    			})
    		);
  }
}
