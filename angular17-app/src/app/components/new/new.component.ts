import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReturnTypeService } from '../../services/returntype.service';

@Component({
  selector: 'app-new',
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
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {
  pageType: string = '';
  private RetnType: string = '';
  private ModuleCode: string = '';
  busy = false;

  formData: any = {
    ReturnType: '',
    Description: '',
    ModuleCode: '',
    ModuleCodeDesc: '',
    ReturnCategory: '',
    CategoryDesc: '',
    ReturnValueValidation: 'No',
    SalableReturn: false,
    DeductFromSales: false,
    Active: true
  };

  formDataProperties = {
    ReturnType: { Enable: true },
    ModuleCode: { Enable: true },
    btnModuleCode: { Enable: true },
    ModuleCodeDesc: { Enable: true }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private returnTypeService: ReturnTypeService,
    private snackBar: MatSnackBar
  ) {
    this.returnTypeService.error$.subscribe((error: any) => {
      this.showError(error.message || 'An error occurred');
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pageType = params['pageType'] || 'new';
      this.RetnType = params['retnType'];
      this.ModuleCode = params['moduleCode'];
      
      if (this.pageType === 'newBasedOn' || this.pageType === 'edit') {
        this.loadExistingData();
      }
    });
  }

  loadExistingData(): void {
    this.busy = true;
    this.returnTypeService.SeletedReturnType(this.ModuleCode, this.RetnType)
      .subscribe({
        next: (data: any) => {
          this.formData.Description = data.Description;
          this.formData.ReturnCategory = data.ReturnCategory;
          this.formData.CategoryDesc = data.ReturnCategoryDesc;
          this.formData.ModuleCode = data.ModuleCode;
          this.formData.ModuleCodeDesc = data.ModuleCodeDesc;
          this.formData.TimeStamp = data.TimeStamp;
          this.formData.SalableReturn = data.ProcessingRequired === '1';
          this.formData.Active = data.Status === '1';
          this.formData.DeductFromSales = data.ReturnDeductionType !== '0';

          const validation = data.ValidateReturnValue;
          if (validation === '0') this.formData.ReturnValueValidation = 'No';
          else if (validation === '1') this.formData.ReturnValueValidation = 'Mandatory';
          else this.formData.ReturnValueValidation = 'WithConfirmation';

          if (this.pageType === 'edit') {
            this.formData.ReturnType = data.RetnType;
            this.formDataProperties.ReturnType.Enable = false;
            this.formDataProperties.ModuleCode.Enable = false;
          }
          this.busy = false;
        },
        error: (err) => {
          this.busy = false;
          this.showError('Failed to load data');
          console.error(err);
        }
      });
  }

  openModulePrompt(): void {
    this.snackBar.open('Module selection coming soon', 'Close', { duration: 3000 });
  }

  openCategoryPrompt(): void {
    this.snackBar.open('Category selection coming soon', 'Close', { duration: 3000 });
  }

  btnOk_OnClick(formData: any): void {
    this.busy = true;
    this.returnTypeService.InsertReturnType(formData)
      .subscribe({
        next: (response: any) => {
          this.busy = false;
          if (response === true || response.success === true) {
            this.snackBar.open('Record saved successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            setTimeout(() => this.router.navigateByUrl('/list'), 2000);
          } else {
            this.showError('Failed to save record');
          }
        },
        error: (err) => {
          this.busy = false;
          this.showError('Failed to save record');
          console.error(err);
        }
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/list');
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