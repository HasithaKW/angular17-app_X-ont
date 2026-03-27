// ============================================================
// MIGRATION: new.component.ts — Angular 4 → Angular 17
//
// KEY CHANGES:
// 1. NgModule declaration         → standalone: true
// 2. Http                         → HttpClient via ReturnTypeService
// 3. ActivatedRoute params        → inject(ActivatedRoute) + takeUntilDestroyed
// 4. busy: Subscription           → isLoading signal
// 5. ViewChild msgPrompt          → errorMsg/alertMsg signals
// 6. ViewChild lpmtModule         → moduleOptions signal (native <select>)
// 7. ViewChild lpmtReturnCategory → categoryOptions signal (native <select>)
// 8. xont-ventura-message-prompt  → inline alert div
// 9. formData as plain object     → typed ReturnTypeFormData interface
// 10. RxJS 5 subscribe            → subscribe with takeUntilDestroyed
//
// PRESERVED:
// - pageType logic: 'new', 'newBasedOn', 'edit'
// - formDataProperties enable/disable logic for edit mode
// - ReturnValueValidation radio button logic (No/Mandatory/WithConfirmation)
// - ExistTransaction check on radio change during edit
// - Exact router.navigateByUrl paths
// - TimeStamp concurrency token handling
// ============================================================

import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReturnTypeService } from '../../../core/services/returntype.service';
import { ReturnTypeFormData, PromptItem, ReturnType } from '../../../shared/models/return-type.models';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {

  private svc        = inject(ReturnTypeService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private destroyRef = inject(DestroyRef);

  // ── Route Params (preserved from original) ─────────────
  private pageType   = '';
  private retnType   = '';
  private moduleCode = '';

  // ── Form Data ───────────────────────────────────────────
  // MIGRATION: loosely-typed formData object → typed interface
  formData: ReturnTypeFormData = {
    pageType: '',
    timeStamp: '',
    returnType: '',
    description: '',
    moduleCode: '',
    moduleCodeDesc: '',
    returnCategory: '',
    categoryDesc: '',
    returnValueValidation: 'No',
    salableReturn: true,
    deductFromSales: true,
    active: true
  };

  // MIGRATION: formDataProperties preserved — controls field enable/disable in edit mode
  formDataProperties = {
    returnType:     { enable: true },
    moduleCode:     { enable: true },
    btnModuleCode:  { enable: true },
    moduleCodeDesc: { enable: true }
  };

  // ── Prompt Options ──────────────────────────────────────
  // MIGRATION: xont-ventura-list-prompt → native <select> with loaded options
  moduleOptions   = signal<PromptItem[]>([]);
  categoryOptions = signal<PromptItem[]>([]);

  // ── UI State ────────────────────────────────────────────
  isLoading  = signal(false);
  errorMsg   = signal('');
  alertMsg   = signal('');     // MIGRATION: msgAlert → alertMsg signal
  showAlert  = signal(false);

  // Tracks previous RVV value for ExistTransaction rollback logic (preserved)
  private rvvCheck: string = '0';

  ngOnInit(): void {
    // MIGRATION: route.params.subscribe preserved; takeUntilDestroyed replaces manual unsubscribe
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.pageType   = params['pageType']   ?? '';
        this.retnType   = params['retnType']   ?? '';
        this.moduleCode = params['moduleCode'] ?? '';
        this.formData.pageType = this.pageType;
        this.loadView();
      });
  }

  loadView(): void {
    this.loadModulePrompt();
    this.loadCategoryPrompt();

    if (this.pageType === 'newBasedOn' || this.pageType === 'edit') {
      // MIGRATION: Preserved SeletedReturnType API call logic exactly
      this.isLoading.set(true);
      this.svc.getSelectedReturnType(this.moduleCode, this.retnType)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => {
            this.isLoading.set(false);
            if (!res.success || !res.data) {
              this.errorMsg.set(res.message ?? 'Failed to load record.');
              return;
            }
            const d = res.data;

            // MIGRATION: Preserved all field mappings from original loadView()
            this.formData.description     = d.description;
            this.formData.returnCategory  = d.returnCategory;
            this.formData.categoryDesc    = d.returnCategoryDesc;
            this.formData.moduleCode      = d.moduleCode;
            this.formData.moduleCodeDesc  = d.moduleCodeDesc;
            this.formData.timeStamp       = d.timeStamp ?? '';

            // MIGRATION: processingRequired '1'→true preserved
            this.formData.salableReturn    = d.processingRequired === '1';
            this.formData.active           = d.status === '1';
            this.formData.deductFromSales  = d.returnDeductionType !== '0';

            // MIGRATION: ValidateReturnValue mapping preserved exactly
            if (d.validateReturnValue === '0') {
              this.formData.returnValueValidation = 'No';
              this.rvvCheck = '0';
            } else if (d.validateReturnValue === '1') {
              this.formData.returnValueValidation = 'Mandatory';
              this.rvvCheck = '1';
            } else {
              this.formData.returnValueValidation = 'WithConfirmation';
              this.rvvCheck = '2';
            }

            if (this.pageType === 'edit') {
              // MIGRATION: Preserved edit-mode field disabling exactly
              this.formData.returnType = d.returnType;
              this.formDataProperties.returnType.enable    = false;
              this.formDataProperties.moduleCode.enable    = false;
              this.formDataProperties.btnModuleCode.enable = false;
              this.formDataProperties.moduleCodeDesc.enable = false;
            } else {
              // newBasedOn — clear return type for new entry
              this.formData.returnType = '';
            }
          },
          error: () => {
            this.isLoading.set(false);
            this.errorMsg.set('Failed to load record. Please try again.');
          }
        });
    } else {
      // pageType === 'new'
      this.formData.returnValueValidation = 'No';
    }
  }

  // ── Prompt Loaders ──────────────────────────────────────
  // MIGRATION: lpmtModule_DataBind() → loadModulePrompt() called on init
  loadModulePrompt(): void {
    this.svc.getModulePromptDataForNew()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.moduleOptions.set(
              res.data.map((r: ReturnType) => ({ code: r.moduleCode, description: r.moduleCodeDesc }))
            );
          }
        },
        error: () => {}
      });
  }

  // MIGRATION: lpmtReturnCategory_DataBind() → loadCategoryPrompt()
  loadCategoryPrompt(): void {
    this.svc.getCategoryPromptData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.categoryOptions.set(
              res.data.map((r: ReturnType) => ({ code: r.returnCategory, description: r.returnCategoryDesc }))
            );
          }
        },
        error: () => {}
      });
  }

  // ── RVV Radio Buttons ───────────────────────────────────
  // MIGRATION: ChangeReturnValueValidation() preserved exactly
  changeReturnValueValidation(value: 'No' | 'Mandatory' | 'WithConfirmation'): void {
    this.formData.returnValueValidation = value;
    this.checkRvvTransaction();
  }

  // MIGRATION: clickRadtionButton() → checkRvvTransaction() (renamed; logic preserved exactly)
  private checkRvvTransaction(): void {
    if (this.pageType !== 'edit') return;

    this.svc.checkExists(this.formData.returnType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            // MIGRATION: Preserved rollback logic for each rvvCheck state
            if (this.rvvCheck === '0') {
              this.formData.returnValueValidation = 'No';
              this.alertMsg.set('Cannot change Return Value Validation — existing transactions found.');
              this.showAlert.set(true);
            } else if (this.rvvCheck === '1' && !res.data) {
              this.formData.returnValueValidation = 'Mandatory';
            } else if (this.rvvCheck === '2' && !res.data) {
              this.formData.returnValueValidation = 'WithConfirmation';
            }
          }
        },
        error: () => {}
      });
  }

  // ── Save ────────────────────────────────────────────────
  // MIGRATION: btnOk_OnClick(formData) preserved exactly
  btnOk_OnClick(form: NgForm): void {
    if (form.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.svc.saveReturnType(this.formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            // MIGRATION: navigateByUrl('/list') preserved
            this.router.navigateByUrl('/list');
          } else {
            this.alertMsg.set(res.message ?? 'Data Submit Failed');
            this.showAlert.set(true);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMsg.set('Save failed. Please try again.');
        }
      });
  }

  // ── Navigation ──────────────────────────────────────────
  // MIGRATION: goBack() and btnClose_OnClick() preserved
  goBack(): void {
    this.router.navigateByUrl('/list');
  }

  btnClose_OnClick(): void {
    this.goBack();
  }

  dismissError(): void  { this.errorMsg.set('');  }
  dismissAlert(): void  { this.showAlert.set(false); this.alertMsg.set(''); }

  // Module/Category dropdown handlers
  onModuleSelect(event: Event): void {
    const val  = (event.target as HTMLSelectElement).value;
    const item = this.moduleOptions().find(m => m.code === val);
    this.formData.moduleCode     = item?.code ?? '';
    this.formData.moduleCodeDesc = item?.description ?? '';
  }

  onCategorySelect(event: Event): void {
    const val  = (event.target as HTMLSelectElement).value;
    const item = this.categoryOptions().find(c => c.code === val);
    this.formData.returnCategory = item?.code ?? '';
    this.formData.categoryDesc   = item?.description ?? '';
  }
}
