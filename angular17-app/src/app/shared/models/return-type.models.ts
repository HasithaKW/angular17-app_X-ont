// ============================================================
// return-type.models.ts
// TypeScript interfaces matching .NET 8 API response shapes.
// ============================================================

// Main domain model — matches ReturnType.cs on backend
export interface ReturnType {
  businessUnit: string;
  moduleCode: string;
  moduleCodeDesc: string;
  returnType: string;         // maps to RetnType on .NET side
  description: string;
  returnCategory: string;
  returnCategoryDesc: string;
  processingRequired: string;
  status: string;
  timeStamp?: string;         // base64 byte[] for SQL Server concurrency
  returnDeductionType: string;
  validateReturnValue: string;
}

// Search/filter criteria — matches Selection.cs on backend
export interface SelectionCriteria {
  moduleCode: string;
  moduleCodeDesc: string;
  retnType: string;
  description: string;
  status: boolean;
  firstRow: number;
  lastRow: number;
}

// Prompt dropdown item (module code, category)
export interface PromptItem {
  code: string;
  description: string;
}

// Wrapper around all API responses from .NET 8 ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: number;
  totalRows: number;
}

// Paged list result — matches PagedResult<T> on backend
export interface PagedResult<T> {
  items: T[];
  totalRows: number;
}

// Form data model for New / Edit component
export interface ReturnTypeFormData {
  pageType: string;
  timeStamp: string;
  returnType: string;
  description: string;
  moduleCode: string;
  moduleCodeDesc: string;
  returnCategory: string;
  categoryDesc: string;
  returnValueValidation: 'No' | 'Mandatory' | 'WithConfirmation';
  salableReturn: boolean;
  deductFromSales: boolean;
  active: boolean;
}
