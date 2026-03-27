// ============================================================
// MIGRATION: list.component.ts — Angular 4 → Angular 17
//
// KEY CHANGES:
// 1. NgModule declaration         → standalone: true
// 2. Http + response.json()       → HttpClient (auto JSON)
// 3. RxJS 5 subscribe pattern     → takeUntilDestroyed() operator
// 4. angular2-busy (Subscription) → isLoading signal
// 5. angular2-datatable           → native *ngFor + sort
// 6. xont-ventura-gridloader      → custom pagination signals
// 7. xont-ventura-message-prompt  → inline error/alert div
// 8. xont-ventura-list-prompt     → native <select> dropdown
// 9. commonService.getAPIPrefix() → ReturnTypeService (DI)
// 10. ViewChild for gridLoader    → signals for page state
// 11. ComponentFactoryResolver    → removed (not needed in Angular 17)
// ============================================================

import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReturnTypeService } from '../../../core/services/returntype.service';
import {
  SelectionCriteria,
  ReturnType,
  PromptItem
} from '../../../shared/models/return-type.models';

const PAGE_SIZE    = 10;   // rows shown per page
const LOAD_SIZE    = 100;  // rows fetched per server call (preserved from gridLoader logic)
const STORAGE_KEY  = 'SOMNT24_SelectionCriteria'; // preserved from original

@Component({
  selector: 'app-list',
  standalone: true,                          // MIGRATION: no NgModule needed
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  private svc        = inject(ReturnTypeService);
  private router     = inject(Router);
  private destroyRef = inject(DestroyRef);   // MIGRATION: replaces ngOnDestroy + unsubscribe

  // ── Data ────────────────────────────────────────────────
  // MIGRATION: public returnType: any[] → typed signal
  returnTypes  = signal<ReturnType[]>([]);
  totalRows    = signal(0);
  modulePrompt = signal<PromptItem[]>([]);

  // ── Loading / Error ────────────────────────────────────
  // MIGRATION: busy: Subscription + [ngBusy] → isLoading signal
  isLoading  = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');

  // ── Selection Criteria ─────────────────────────────────
  // MIGRATION: Preserved exact field semantics from original selectionCriteria object
  criteria: SelectionCriteria = {
    moduleCode: '',
    moduleCodeDesc: '',
    retnType: '',
    description: '',
    status: true,
    firstRow: 1,
    lastRow: LOAD_SIZE
  };

  // ── Sorting ─────────────────────────────────────────────
  // MIGRATION: angular2-datatable mfSortBy/mfSortOrder → local sort signals
  sortBy    = signal<string>('returnType');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // ── Pagination ──────────────────────────────────────────
  // MIGRATION: xont-ventura-gridloader → native page signals
  currentPage = signal(1);
  pageSize    = signal(PAGE_SIZE);
  collapsed   = signal(true);   // selection criteria panel collapse state

  get totalPages(): number {
    return Math.ceil(this.totalRows() / this.pageSize()) || 1;
  }

  get pagedData(): ReturnType[] {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedData.slice(start, start + this.pageSize());
  }

  get sortedData(): ReturnType[] {
    const col   = this.sortBy() as keyof ReturnType;
    const order = this.sortOrder() === 'asc' ? 1 : -1;
    return [...this.returnTypes()].sort((a, b) => {
      const av = (a[col] ?? '') as string;
      const bv = (b[col] ?? '') as string;
      return av.localeCompare(bv) * order;
    });
  }

  ngOnInit(): void {
    // MIGRATION: Preserved localStorage restore from original ngAfterViewInit v3002 logic
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed) this.criteria = parsed;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    this.loadModulePrompt();
    this.list(true);
  }

  // ── Load Module Prompt (for dropdown) ──────────────────
  // MIGRATION: lpmtModule.dataSourceObservable → loadModulePrompt() into signal
  loadModulePrompt(): void {
    this.svc.getModulePromptData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.modulePrompt.set(
              res.data.map((r: ReturnType) => ({ code: r.moduleCode, description: r.moduleCodeDesc }))
            );
          }
        },
        error: () => {} // error already handled in service
      });
  }

  // ── Main List ───────────────────────────────────────────
  // MIGRATION: list(isInit) preserved exactly, gridLoader API replaced with signals
  list(isInit: boolean): void {
    if (isInit) {
      this.currentPage.set(1);
      this.criteria.firstRow = 1;
      this.criteria.lastRow  = LOAD_SIZE;
    } else {
      this.criteria.firstRow = ((this.currentPage() - 1) * LOAD_SIZE) + 1;
      this.criteria.lastRow  = this.criteria.firstRow + LOAD_SIZE - 1;
    }

    // MIGRATION: localStorage.setItem preserved from original
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.criteria));

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.svc.listReturnTypeData(this.criteria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            // MIGRATION: jsonData[0] → res.data.items, jsonData[1] → res.totalRows
            this.returnTypes.set(res.data.items);
            this.totalRows.set(res.totalRows);
          } else {
            this.errorMsg.set(res.message ?? 'Failed to load data.');
          }
        },
        error: err => {
          this.isLoading.set(false);
          this.errorMsg.set('Connection error. Please try again.');
        }
      });
  }

  // ── Sort ────────────────────────────────────────────────
  // MIGRATION: mfDefaultSorter → setSort()
  setSort(col: string): void {
    if (this.sortBy() === col) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(col);
      this.sortOrder.set('asc');
    }
  }

  getSortIcon(col: string): string {
    if (this.sortBy() !== col) return '↕';
    return this.sortOrder() === 'asc' ? '↑' : '↓';
  }

  // ── Pagination ──────────────────────────────────────────
  // MIGRATION: gridLoader_OnChange → page change methods
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage.set(page);
  }

  // ── Navigation ──────────────────────────────────────────
  // MIGRATION: Preserved exact router.navigateByUrl() paths from original
  newClick(): void {
    this.router.navigateByUrl('new/new');
  }

  btnNewBased_onClick(item: ReturnType): void {
    this.router.navigateByUrl(`new/newBasedOn/${item.returnType}/${item.moduleCode}`);
  }

  btnEdit_onClick(item: ReturnType): void {
    this.router.navigateByUrl(`new/edit/${item.returnType}/${item.moduleCode}`);
  }

  // MIGRATION: closeTab() preserved as method
  closeTab(): void {
    window.close();
  }

  dismissError(): void  { this.errorMsg.set(''); }
  toggleCollapse(): void { this.collapsed.set(!this.collapsed()); }

  // Module code selection from dropdown
  onModuleSelect(event: Event): void {
    const val  = (event.target as HTMLSelectElement).value;
    const item = this.modulePrompt().find(m => m.code === val);
    this.criteria.moduleCode     = item?.code ?? '';
    this.criteria.moduleCodeDesc = item?.description ?? '';
  }
}
