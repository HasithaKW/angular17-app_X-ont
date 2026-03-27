import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface SelectionCriteria {
  ModuleCode: string;
  ModuleCodeDesc: string;
  RetnType: string;
  Description: string;
  Status: boolean;
  FirstRow: number;
  LastRow: number;
  Collapsed: boolean;
}

export interface ReturnTypeData {
  ReturnType: string;
  Description: string;
  ModuleCode: string;
  ModuleCodeDesc: string;
  ReturnCategory: string;
  CategoryDesc: string;
  ReturnValueValidation: string;
  SalableReturn: boolean;
  DeductFromSales: boolean;
  Active: boolean;
  TimeStamp?: any;
  pageType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnTypeService {
  private apiBase = '/api/SOMNT24';
  private errorSource = new Subject<any>();
  error$ = this.errorSource.asObservable();

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
          break;
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied. You don\'t have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later or contact support.';
          break;
        default:
          errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }
    
    console.error('API Error:', error);
    this.errorSource.next({ message: errorMessage, details: error });
    return throwError(() => ({ message: errorMessage, original: error }));
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  GetModulePromptData(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetModulePromptData`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  GetModulePromptDataForNew(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetModulePromptDataForNew`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  GetCategoryPromptData(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetCategoryPromptData`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  ListReturnTypeData(selectionCriteria: SelectionCriteria): Observable<any> {
    return this.http.post(`${this.apiBase}/ListReturnTypeData`, selectionCriteria, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  SeletedReturnType(moduleCode: string, returnType: string): Observable<any> {
    return this.http.get(`${this.apiBase}/SeletedReturnType?moduleCode=${encodeURIComponent(moduleCode)}&returnType=${encodeURIComponent(returnType)}`)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  InsertReturnType(formData: any): Observable<any> {
    return this.http.post(`${this.apiBase}/InsertReturnType`, formData, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  ExistTransaction(formData: any): Observable<any> {
    const objectData = { formData };
    return this.http.post(`${this.apiBase}/ExistTransaction`, JSON.stringify(objectData), { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  GetDisplayErrorMessage(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetDisplayErrorMessage`)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }
}