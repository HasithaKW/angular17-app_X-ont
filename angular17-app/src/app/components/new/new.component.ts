import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReturnTypeService, ReturnTypeData } from '../../services/returntype.service';
import { MessagePromptComponent, ListPromptComponent } from '../placeholders/placeholders.component';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MessagePromptComponent,
    ListPromptComponent
  ],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {
  private pageType: string = '';
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
    SalableReturn: true,
    DeductFromSales: true,
    Active: true,
    pageType: ''  // Added pageType property
  };

  formDataProperties = {
    ReturnType: { Enable: true },
    ModuleCode: { Enable: true },
    btnModuleCode: { Enable: true },
    ModuleCodeDesc: { Enable: true }
  };

  @ViewChild('msgPrompt') msgPrompt: any;
  @ViewChild('msgAlert') msgAlert: any;
  @ViewChild('lpmtModule') lpmtModule: any;
  @ViewChild('lpmtReturnCategory') lpmtReturnCategory: any;

  ReturnTypeDataArray: any[] = [];
  private RVVcheck: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private returnTypeService: ReturnTypeService
  ) {
    this.returnTypeService.error$.subscribe((error) => {
      if (this.msgPrompt) {
        this.msgPrompt.show(error, 'SOMNT24');
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pageType = params['pageType'];
      this.RetnType = params['retnType'];
      this.ModuleCode = params['moduleCode'];
      this.formData.pageType = this.pageType;
      this.loadView();
    });
  }

  msgAlert_OkClick(): void {
    // Handle OK button click on alert
  }

  msgAlert_OnCancel(): void {
    // Handle Cancel button click on alert
  }

  loadView(): void {
    if (this.pageType === 'newBasedOn' || this.pageType === 'edit') {
      this.busy = true;
      this.returnTypeService.SeletedReturnType(this.ModuleCode, this.RetnType)
        .subscribe({
          next: (returnTypeJsonData: any) => {
            this.ReturnTypeDataArray = returnTypeJsonData;
            this.formData.Description = returnTypeJsonData.Description;
            this.formData.ReturnCategory = returnTypeJsonData.ReturnCategory;
            this.formData.CategoryDesc = returnTypeJsonData.ReturnCategoryDesc;
            this.formData.ModuleCode = returnTypeJsonData.ModuleCode;
            this.formData.ModuleCodeDesc = returnTypeJsonData.ModuleCodeDesc;
            this.formData.TimeStamp = returnTypeJsonData.TimeStamp;
            this.formData.SalableReturn = returnTypeJsonData.ProcessingRequired === '1';
            this.formData.Active = returnTypeJsonData.Status === '1';
            this.formData.DeductFromSales = returnTypeJsonData.ReturnDeductionType !== '0';

            const validation = returnTypeJsonData.ValidateReturnValue;
            if (validation === '0') {
              this.formData.ReturnValueValidation = 'No';
              this.RVVcheck = '0';
            } else if (validation === '1') {
              this.formData.ReturnValueValidation = 'Mandatory';
              this.RVVcheck = '1';
            } else {
              this.formData.ReturnValueValidation = 'WithConfirmation';
              this.RVVcheck = '2';
            }

            if (this.pageType === 'edit') {
              this.formData.ReturnType = returnTypeJsonData.RetnType;
              this.formDataProperties.ReturnType.Enable = false;
              this.formDataProperties.ModuleCode.Enable = false;
              this.formDataProperties.btnModuleCode.Enable = false;
              this.formDataProperties.ModuleCodeDesc.Enable = false;
            }
            if (this.pageType === 'newBasedOn') {
              this.formData.ReturnType = '';
            }
            this.busy = false;
          },
          error: (err) => {
            if (this.msgPrompt) this.msgPrompt.show(err, 'SOMNT24');
            this.busy = false;
          }
        });
    } else {
      this.formData.ReturnValueValidation = 'No';
    }
  }

  lpmtModule_DataBind(): void {
    if (this.lpmtModule) {
      this.lpmtModule.dataSourceObservable = this.returnTypeService.GetModulePromptDataForNew();
    }
  }

  lpmtReturnCategory_DataBind(): void {
    if (this.lpmtReturnCategory) {
      this.lpmtReturnCategory.dataSourceObservable = this.returnTypeService.GetCategoryPromptData();
    }
  }

  ChangeReturnValueValidation(entry: string): void {
    this.formData.ReturnValueValidation = entry;
    this.clickRadtionButton();
  }

  clickRadtionButton(): void {
    if (this.pageType === 'edit') {
      this.busy = true;
      this.returnTypeService.ExistTransaction(this.formData)
        .subscribe({
          next: (response: any) => {
            if (response !== '') {
              if (this.RVVcheck === '0') {
                this.formData.ReturnValueValidation = 'No';
              } else if (this.RVVcheck === '1' && response === '0') {
                this.formData.ReturnValueValidation = 'Mandatory';
              } else if (this.RVVcheck === '2' && response === '0') {
                this.formData.ReturnValueValidation = 'WithConfirmation';
              }
            }
            this.busy = false;
          },
          error: (err) => {
            if (this.msgPrompt) this.msgPrompt.show(err, 'SOMNT24');
            this.busy = false;
          }
        });
    }
  }

  btnOk_OnClick(formData: any): void {
    this.busy = true;
    this.returnTypeService.InsertReturnType(formData)
      .subscribe({
        next: (jsonData: any) => {
          if (jsonData === true) {
            this.router.navigateByUrl('/list');
          } else {
            if (this.msgAlert) this.msgAlert.showAlert('Data Submitted Failed');
          }
          this.busy = false;
        },
        error: (err) => {
          if (this.msgPrompt) this.msgPrompt.show(err, 'SOMNT24');
          this.busy = false;
        }
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/list');
  }
}