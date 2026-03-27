import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from './common.service';        // we'll create this stub
import { DatetimeService } from './datetime.service';    // we'll create this stub

@Injectable({ providedIn: 'root' })
export class ReturnTypeService {
  private componentMethodCallSource = new Subject<any>();
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private datetimeService: DatetimeService
  ) {}

  private handleError(error: any): Observable<never> {
    this.componentMethodCallSource.next(error);
    return throwError(() => error);
  }

  private getBaseUrl(): string {
    return this.commonService.getAPIPrefix('SOMNT24'); // should return ''
  }

  // Get Module Data for list prompt
  GetModulePromptData(): Observable<any> {
    return this.http.get(`${this.getBaseUrl()}/api/SOMNT24/GetModulePromptData`)
      .pipe(catchError(error => this.handleError(error)));
  }

  GetModulePromptDataForNew(): Observable<any> {
    return this.http.get(`${this.getBaseUrl()}/api/SOMNT24/GetModulePromptDataForNew`)
      .pipe(catchError(error => this.handleError(error)));
  }

  GetCategoryPromptData(): Observable<any> {
    return this.http.get(`${this.getBaseUrl()}/api/SOMNT24/GetCategoryPromptData`)
      .pipe(catchError(error => this.handleError(error)));
  }

  ListReturnTypeData(selectionCriteria: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.getBaseUrl()}/api/SOMNT24/ListReturnTypeData`, selectionCriteria, { headers })
      .pipe(catchError(error => this.handleError(error)));
  }

  SeletedReturnType(moduleCode: string, returnType: string): Observable<any> {
    const url = `${this.getBaseUrl()}/api/SOMNT24/SeletedReturnType?moduleCode=${encodeURIComponent(moduleCode)}&returnType=${encodeURIComponent(returnType)}`;
    return this.http.get(url).pipe(catchError(error => this.handleError(error)));
  }

  InsertReturnType(formData: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.getBaseUrl()}/api/SOMNT24/InsertReturnType`, formData, { headers })
      .pipe(catchError(error => this.handleError(error)));
  }

  ExistTransaction(formData: any): Observable<any> {
    const objectData = { formData };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.getBaseUrl()}/api/SOMNT24/ExistTransaction`, JSON.stringify(objectData), { headers })
      .pipe(catchError(error => this.handleError(error)));
  }

  GetDisplayErrorMessage(): Observable<any> {
    return this.http.get(`${this.getBaseUrl()}/api/SOMNT24/GetDisplayErrorMessage`)
      .pipe(catchError(error => this.handleError(error)));
  }
}