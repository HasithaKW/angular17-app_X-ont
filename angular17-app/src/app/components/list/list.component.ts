import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReturnTypeService, SelectionCriteria } from '../../services/returntype.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements AfterViewInit {
  displayedColumns: string[] = ['returnType', 'description', 'moduleCode', 'status', 'actions'];
  returnType: any[] = [];
  busy = false;
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  selectionCriteria: SelectionCriteria = {
    ModuleCode: '',
    ModuleCodeDesc: '',
    RetnType: '',
    Description: '',
    Status: true,
    FirstRow: 1,
    LastRow: 10,
    Collapsed: true
  };

  constructor(
    private returnTypeService: ReturnTypeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.returnTypeService.error$.subscribe((error: any) => {
      this.showError(error.message || 'An error occurred');
    });
  }

  ngAfterViewInit(): void {
    this.loadSavedCriteria();
    this.list(true);
  }

  loadSavedCriteria(): void {
    const stored = localStorage.getItem('SOMNT24_SelectionCriteria');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed) {
          this.selectionCriteria = { ...this.selectionCriteria, ...parsed };
        }
      } catch (e) {
        console.warn('Failed to parse stored criteria');
      }
    }
  }

  list(isInit: boolean): void {
    this.selectionCriteria.FirstRow = this.currentPage * this.pageSize + 1;
    this.selectionCriteria.LastRow = (this.currentPage + 1) * this.pageSize;
    
    localStorage.setItem('SOMNT24_SelectionCriteria', JSON.stringify(this.selectionCriteria));

    this.busy = true;
    this.returnTypeService.ListReturnTypeData(this.selectionCriteria)
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.returnType = response.data;
            this.totalRecords = response.totalRow || 0;
          } else if (Array.isArray(response)) {
            this.returnType = response[0] || [];
            this.totalRecords = response[1] || 0;
          }
          this.busy = false;
        },
        error: (err) => {
          this.busy = false;
          this.showError('Failed to load data. Please try again.');
          console.error(err);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.list(false);
  }

  openModulePrompt(): void {
    this.snackBar.open('Module selection feature coming soon', 'Close', { duration: 3000 });
  }

  clearFilters(): void {
    this.selectionCriteria = {
      ModuleCode: '',
      ModuleCodeDesc: '',
      RetnType: '',
      Description: '',
      Status: true,
      FirstRow: 1,
      LastRow: this.pageSize,
      Collapsed: true
    };
    this.currentPage = 0;
    this.list(false);
  }

  exportToExcel(): void {
    this.snackBar.open('Export feature coming soon', 'Close', { duration: 3000 });
  }

  btnNewBased_onClick(item: any): void {
    const returnType = item.ReturnType || item.retnType;
    const moduleCode = item.ModuleCode || item.moduleCode;
    this.router.navigateByUrl(`new/newBasedOn/${returnType}/${moduleCode}`);
  }

  btnEdit_onClick(item: any): void {
    const returnType = item.ReturnType || item.retnType;
    const moduleCode = item.ModuleCode || item.moduleCode;
    this.router.navigateByUrl(`new/edit/${returnType}/${moduleCode}`);
  }

  newClick(): void {
    this.router.navigateByUrl('new/new');
  }

  closeTab(): void {
    window.close();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}