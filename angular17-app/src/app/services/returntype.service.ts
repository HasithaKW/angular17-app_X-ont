import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

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
      errorMessage = `Error: ${error.error.message}`;
    } else {
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
          errorMessage = 'Access denied.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
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

  // GET - Module Prompt Data
  GetModulePromptData(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetModulePromptData`, { headers: this.getHeaders() })
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // GET - Module Prompt Data for New
  GetModulePromptDataForNew(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetModulePromptDataForNew`, { headers: this.getHeaders() })
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // GET - Category Prompt Data
  GetCategoryPromptData(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetCategoryPromptData`, { headers: this.getHeaders() })
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // POST - List Return Type Data
  ListReturnTypeData(selectionCriteria: SelectionCriteria): Observable<any> {
    return this.http.post(`${this.apiBase}/ListReturnTypeData`, selectionCriteria, { headers: this.getHeaders() })
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // GET - Get Single Return Type
  SeletedReturnType(moduleCode: string, returnType: string): Observable<any> {
    const url = `${this.apiBase}/SeletedReturnType?moduleCode=${encodeURIComponent(moduleCode)}&returnType=${encodeURIComponent(returnType)}`;
    return this.http.get(url)
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // POST - Insert or Update Return Type
  InsertReturnType(formData: any): Observable<any> {
    const payload = {
      ReturnType: formData.ReturnType || '',
      Description: formData.Description || '',
      ModuleCode: formData.ModuleCode || '',
      ModuleCodeDesc: formData.ModuleCodeDesc || '',
      ReturnCategory: formData.ReturnCategory || '',
      CategoryDesc: formData.CategoryDesc || '',
      ReturnValueValidation: formData.ReturnValueValidation || 'No',
      SalableReturn: formData.SalableReturn || false,
      DeductFromSales: formData.DeductFromSales || false,
      Active: formData.Active || false,
      pageType: formData.pageType || 'new'
    };
    
    console.log('Sending payload to backend:', payload);
    
    return this.http.post(`${this.apiBase}/InsertReturnType`, payload, { headers: this.getHeaders() })
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // POST - Check if transaction exists
  ExistTransaction(formData: any): Observable<any> {
    const objectData = { formData };
    return this.http.post(`${this.apiBase}/ExistTransaction`, JSON.stringify(objectData), { headers: this.getHeaders() })
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }

  // GET - Display Error Message
  GetDisplayErrorMessage(): Observable<any> {
    return this.http.get(`${this.apiBase}/GetDisplayErrorMessage`)
      .pipe(
        timeout(30000),
        catchError(error => this.handleError(error))
      );
  }
}