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
  public returnTypeCode: string = '';
  public moduleCodeParam: string = '';
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
    Active: true,
    pageType: '',
    TimeStamp: null
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
      console.error('Service error:', error);
      this.showError(error.message || 'An error occurred');
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('=== ROUTE PARAMS ===');
      console.log('All params:', params);
      
      this.pageType = params['pageType'] || 'new';
      this.returnTypeCode = params['retnType'] || '';
      this.moduleCodeParam = params['moduleCode'] || '';
      this.formData.pageType = this.pageType;
      
      console.log('Page Type:', this.pageType);
      console.log('Return Type Code:', this.returnTypeCode);
      console.log('Module Code:', this.moduleCodeParam);
      
      if (this.pageType === 'edit' || this.pageType === 'newBasedOn') {
        console.log('Loading data for edit/newBasedOn...');
        this.loadExistingData();
      }
    });
  }

  loadExistingData(): void {
    if (!this.moduleCodeParam || !this.returnTypeCode) {
      console.error('Missing parameters:', { moduleCodeParam: this.moduleCodeParam, returnTypeCode: this.returnTypeCode });
      this.showError('Unable to load data - missing parameters');
      return;
    }
    
    this.busy = true;
    console.log(`Calling SeletedReturnType with: moduleCode=${this.moduleCodeParam}, returnType=${this.returnTypeCode}`);
    
    // Use SeletedReturnType (the method that exists in your service)
    this.returnTypeService.SeletedReturnType(this.moduleCodeParam, this.returnTypeCode)
      .subscribe({
        next: (response: any) => {
          console.log('=== API RESPONSE ===');
          console.log('Full response:', response);
          this.busy = false;
          
          if (response && response.data) {
            const data = response.data;
            console.log('Data object:', data);
            
            // Map the data to form fields
            this.formData.ReturnType = data.retnType || data.ReturnType || this.returnTypeCode;
            this.formData.Description = data.description || data.Description || '';
            this.formData.ModuleCode = data.moduleCode || data.ModuleCode || this.moduleCodeParam;
            this.formData.ModuleCodeDesc = data.moduleCodeDesc || data.ModuleCodeDesc || '';
            this.formData.ReturnCategory = data.returnCategory || data.ReturnCategory || '';
            this.formData.CategoryDesc = data.returnCategoryDesc || data.ReturnCategoryDesc || '';
            this.formData.TimeStamp = data.timeStamp || data.TimeStamp || null;
            
            // Set checkboxes
            this.formData.SalableReturn = (data.processingRequired === '1' || data.ProcessingRequired === '1');
            this.formData.Active = (data.status === '1' || data.Status === '1');
            this.formData.DeductFromSales = (data.returnDeductionType === '1' || data.ReturnDeductionType === '1');
            
            // Set validation type
            const validation = data.validateReturnValue || data.ValidateReturnValue;
            if (validation === '0') {
              this.formData.ReturnValueValidation = 'No';
            } else if (validation === '1') {
              this.formData.ReturnValueValidation = 'Mandatory';
            } else if (validation === '2') {
              this.formData.ReturnValueValidation = 'WithConfirmation';
            }
            
            // For edit mode, disable Return Type and Module Code fields
            if (this.pageType === 'edit') {
              this.formDataProperties.ReturnType.Enable = false;
              this.formDataProperties.ModuleCode.Enable = false;
              this.formDataProperties.btnModuleCode.Enable = false;
              this.formDataProperties.ModuleCodeDesc.Enable = false;
            }
            
            console.log('=== MAPPED FORM DATA ===');
            console.log('ReturnType:', this.formData.ReturnType);
            console.log('Description:', this.formData.Description);
            console.log('ModuleCode:', this.formData.ModuleCode);
            console.log('ModuleCodeDesc:', this.formData.ModuleCodeDesc);
            console.log('ReturnCategory:', this.formData.ReturnCategory);
            console.log('CategoryDesc:', this.formData.CategoryDesc);
            console.log('ReturnValueValidation:', this.formData.ReturnValueValidation);
            console.log('SalableReturn:', this.formData.SalableReturn);
            console.log('DeductFromSales:', this.formData.DeductFromSales);
            console.log('Active:', this.formData.Active);
            
            // Force change detection
            this.formData = { ...this.formData };
            
            if (this.formData.Description) {
              this.snackBar.open('Data loaded successfully', 'Close', { duration: 2000 });
            } else {
              console.warn('No description found in response');
            }
          } else {
            console.error('Invalid response format:', response);
            this.showError('No data found for this record');
          }
        },
        error: (err: any) => {
          this.busy = false;
          console.error('=== API ERROR ===');
          console.error('Error details:', err);
          this.showError('Failed to load data: ' + (err.message || 'Unknown error'));
        }
      });
  }

  openModulePrompt(): void {
    this.snackBar.open('Module selection coming soon', 'Close', { duration: 3000 });
  }

  openCategoryPrompt(): void {
    this.snackBar.open('Category selection coming soon', 'Close', { duration: 3000 });
  }

  // This method is called from the HTML
  btnOk_OnClick(formData: any): void {
    console.log('=== SAVING FORM DATA ===');
    console.log('Form data before save:', formData);
    
    this.busy = true;
    
    // Prepare data for saving
    const saveData = {
      ReturnType: formData.ReturnType,
      Description: formData.Description,
      ModuleCode: formData.ModuleCode,
      ModuleCodeDesc: formData.ModuleCodeDesc,
      ReturnCategory: formData.ReturnCategory,
      CategoryDesc: formData.CategoryDesc,
      ReturnValueValidation: formData.ReturnValueValidation,
      SalableReturn: formData.SalableReturn,
      DeductFromSales: formData.DeductFromSales,
      Active: formData.Active,
      TimeStamp: formData.TimeStamp,
      pageType: this.pageType
    };
    
    // Use InsertReturnType (the method that exists in your service)
    this.returnTypeService.InsertReturnType(saveData)
      .subscribe({
        next: (response: any) => {
          this.busy = false;
          console.log('Save response:', response);
          
          if (response === true || response === 'true' || response?.success === true) {
            this.snackBar.open('Record saved successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            setTimeout(() => this.router.navigateByUrl('/list'), 2000);
          } else {
            this.showError('Failed to save record: ' + (response?.message || 'Unknown error'));
          }
        },
        error: (err: any) => {
          this.busy = false;
          console.error('Save error:', err);
          this.showError('Failed to save record: ' + (err.message || 'Unknown error'));
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