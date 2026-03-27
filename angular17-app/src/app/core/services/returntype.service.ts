import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PagedResult,
  ReturnType,
  SelectionCriteria,
  PromptItem,
  ReturnTypeFormData
} from '../../shared/models/return-type.models';  // FIX: was ../shared (wrong — service is 2 levels deep)

@Injectable({ providedIn: 'root' })
export class ReturnTypeService {

  private readonly apiBase = `${environment.apiUrl}/returntype`;

  // Broadcast HTTP errors to components (preserved from Angular 4 pattern)
  private errorSource = new Subject<string>();
  readonly error$ = this.errorSource.asObservable();

  constructor(private http: HttpClient) {}

  private get jsonHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  private handleError(error: any): Observable<never> {
    const message = error?.error?.message ?? error?.message ?? 'Unknown error';
    this.errorSource.next(message);
    return throwError(() => error);
  }

  // GET /api/returntype/module-prompt  (was: GET /api/SOMNT24/GetModulePromptData)
  getModulePromptData(): Observable<ApiResponse<ReturnType[]>> {
    return this.http
      .get<ApiResponse<ReturnType[]>>(`${this.apiBase}/module-prompt`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // GET /api/returntype/module-prompt-new  (was: GET /api/SOMNT24/GetModulePromptDataForNew)
  getModulePromptDataForNew(): Observable<ApiResponse<ReturnType[]>> {
    return this.http
      .get<ApiResponse<ReturnType[]>>(`${this.apiBase}/module-prompt-new`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // GET /api/returntype/category-prompt  (was: GET /api/SOMNT24/GetCategoryPromptData)
  getCategoryPromptData(): Observable<ApiResponse<ReturnType[]>> {
    return this.http
      .get<ApiResponse<ReturnType[]>>(`${this.apiBase}/category-prompt`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // POST /api/returntype/grid  (was: POST /api/SOMNT24/ListReturnTypeData)
  // Old shape: jsonData[0]=items, jsonData[1]=count
  // New shape: ApiResponse<PagedResult<ReturnType>>
  listReturnTypeData(criteria: SelectionCriteria): Observable<ApiResponse<PagedResult<ReturnType>>> {
    return this.http
      .post<ApiResponse<PagedResult<ReturnType>>>(
        `${this.apiBase}/grid`,
        criteria,
        { headers: this.jsonHeaders }
      )
      .pipe(catchError(err => this.handleError(err)));
  }

  // GET /api/returntype/{moduleCode}/{returnType}
  // (was: GET /api/SOMNT24/SeletedReturnType?moduleCode=&returnType=)
  getSelectedReturnType(moduleCode: string, returnType: string): Observable<ApiResponse<ReturnType>> {
    return this.http
      .get<ApiResponse<ReturnType>>(`${this.apiBase}/${moduleCode}/${returnType}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // POST /api/returntype  (new record)
  // PUT  /api/returntype  (edit record)
  // (was: POST /api/SOMNT24/InsertReturnType for both create and update)
  saveReturnType(formData: ReturnTypeFormData): Observable<ApiResponse<boolean>> {
    const payload = this.mapFormDataToPayload(formData);

    if (formData.pageType === 'edit') {
      return this.http
        .put<ApiResponse<boolean>>(`${this.apiBase}`, payload, { headers: this.jsonHeaders })
        .pipe(catchError(err => this.handleError(err)));
    } else {
      return this.http
        .post<ApiResponse<boolean>>(`${this.apiBase}`, payload, { headers: this.jsonHeaders })
        .pipe(catchError(err => this.handleError(err)));
    }
  }

  // GET /api/returntype/check-exists/{returnType}
  // (was: POST /api/SOMNT24/ExistTransaction)
  checkExists(returnType: string): Observable<ApiResponse<boolean>> {
    return this.http
      .get<ApiResponse<boolean>>(`${this.apiBase}/check-exists/${returnType}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Map UI form model → API payload
  private mapFormDataToPayload(form: ReturnTypeFormData): Partial<ReturnType> {
    return {
      returnType:         form.returnType,
      description:        form.description,
      moduleCode:         form.moduleCode,
      moduleCodeDesc:     form.moduleCodeDesc,
      returnCategory:     form.returnCategory,
      returnCategoryDesc: form.categoryDesc,
      processingRequired: form.salableReturn    ? '1' : '0',
      status:             form.active           ? '1' : '0',
      timeStamp:          form.timeStamp,
      returnDeductionType: form.deductFromSales ? '1' : '0',
      validateReturnValue: this.mapRVV(form.returnValueValidation)
    };
  }

  private mapRVV(val: 'No' | 'Mandatory' | 'WithConfirmation'): string {
    const m: Record<string, string> = { 'No': '0', 'Mandatory': '1', 'WithConfirmation': '2' };
    return m[val] ?? '0';
  }
}
