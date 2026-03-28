import { Component, AfterViewInit, OnInit } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
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
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['returnType', 'description', 'moduleCode', 'status', 'actions'];
  returnType: any[] = [];
  busy = false;
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  
  // Add these missing properties
  moduleList: any[] = [];
  selectedModule: string = '';

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
      console.error('Service error:', error);
      this.showError(error.message || 'An error occurred');
    });
  }

  ngOnInit(): void {
    this.loadModuleList();
    this.loadSavedCriteria();
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Keep for any ViewChild initialization if needed
  }

  loadModuleList(): void {
    this.returnTypeService.GetModulePromptData().subscribe({
      next: (response: any) => {
        console.log('Module list response:', response);
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            this.moduleList = response.data;
          } else if (response.data && typeof response.data === 'object') {
            this.moduleList = Object.values(response.data);
          } else {
            this.moduleList = response.data || [];
          }
          console.log('Module list loaded:', this.moduleList);
        }
      },
      error: (err: any) => {
        console.error('Error loading modules:', err);
        this.showError('Failed to load modules');
      }
    });
  }

  onModuleChange(moduleCode: string): void {
    this.selectionCriteria.ModuleCode = moduleCode;
    const selectedModule = this.moduleList.find(m => m.ModuleCode === moduleCode || m['Module Code'] === moduleCode);
    if (selectedModule) {
      this.selectionCriteria.ModuleCodeDesc = selectedModule.Description || selectedModule['Description'] || '';
    } else {
      this.selectionCriteria.ModuleCodeDesc = '';
    }
    this.currentPage = 0;
    this.loadData();
  }

  loadSavedCriteria(): void {
    const stored = localStorage.getItem('SOMNT24_SelectionCriteria');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed) {
          this.selectionCriteria = { ...this.selectionCriteria, ...parsed };
          this.selectedModule = parsed.ModuleCode || '';
        }
      } catch (e) {
        console.warn('Failed to parse stored criteria');
      }
    }
  }

  loadData(): void {
    this.selectionCriteria.FirstRow = this.currentPage * this.pageSize + 1;
    this.selectionCriteria.LastRow = (this.currentPage + 1) * this.pageSize;
    
    localStorage.setItem('SOMNT24_SelectionCriteria', JSON.stringify(this.selectionCriteria));

    this.busy = true;
    console.log('Loading data with criteria:', this.selectionCriteria);
    
    this.returnTypeService.ListReturnTypeData(this.selectionCriteria)
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          this.busy = false;
          
          if (response && response.data) {
            this.returnType = Array.isArray(response.data) ? response.data : [];
            this.totalRecords = response.totalRow || 0;
          } else if (Array.isArray(response)) {
            this.returnType = response[0] || [];
            this.totalRecords = response[1] || 0;
          } else {
            this.returnType = [];
            this.totalRecords = 0;
          }
          
          console.log('Processed data:', this.returnType);
          console.log('Total records:', this.totalRecords);
          
          if (this.returnType.length === 0) {
            this.snackBar.open('No data found for the given criteria', 'Close', { duration: 3000 });
          }
        },
        error: (err: any) => {
          this.busy = false;
          console.error('Error loading data:', err);
          this.showError('Failed to load data. Please check the console for details.');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData();
  }

  openModulePrompt(): void {
    this.snackBar.open('Please select a module from the dropdown', 'Close', { duration: 3000 });
  }

  openCategoryPrompt(): void {
    this.snackBar.open('Category selection coming soon', 'Close', { duration: 3000 });
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
    this.selectedModule = '';
    this.currentPage = 0;
    this.loadData();
  }

  exportToExcel(): void {
    this.snackBar.open('Export feature coming soon', 'Close', { duration: 3000 });
  }

  btnNewBased_onClick(item: any): void {
    console.log('NewBasedOn clicked for item:', item);
    const returnType = item.ReturnType || item.retnType;
    const moduleCode = item.ModuleCode || item.moduleCode;
    if (returnType && moduleCode) {
      this.router.navigateByUrl(`new/newBasedOn/${returnType}/${moduleCode}`);
    } else {
      this.showError('Unable to create new based on this record');
    }
  }

  btnEdit_onClick(item: any): void {
    console.log('Edit clicked for item:', item);
    const returnType = item.ReturnType || item.retnType;
    const moduleCode = item.ModuleCode || item.moduleCode;
    
    console.log(`Navigating to: new/edit/${returnType}/${moduleCode}`);
    
    if (returnType && moduleCode) {
      this.router.navigateByUrl(`new/edit/${returnType}/${moduleCode}`);
    } else {
      console.error('Missing data for navigation:', { returnType, moduleCode });
      this.showError('Unable to edit this record - missing data');
    }
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