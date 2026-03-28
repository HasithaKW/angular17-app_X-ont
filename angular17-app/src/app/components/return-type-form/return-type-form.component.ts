import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'xont-ventura-message-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-prompt" *ngIf="visible">
      <div class="message-content">{{ message }}</div>
      <button (click)="close()">Close</button>
    </div>
  `,
  styles: [`
    .message-prompt {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #ccc;
      padding: 20px;
      z-index: 1000;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
  `]
})
export class MessagePromptComponent {
  @Input() messageType?: string;
  @Output() onOK = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  
  visible = false;
  message = '';
  
  show(msg: any, title?: string) {
    this.message = typeof msg === 'string' ? msg : JSON.stringify(msg);
    this.visible = true;
  }
  
  showAlert(msg: string) {
    this.message = msg;
    this.visible = true;
  }
  
  close() {
    this.visible = false;
    if (this.onOK) this.onOK.emit();
  }
}

@Component({
  selector: 'xont-ventura-collapsible',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="collapsible">
      <button (click)="toggle()">{{ collapsed ? collapsedText : expandedText }}</button>
      <div [hidden]="collapsed">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class CollapsibleComponent {
  @Input() collapsed = false;
  @Input() collapsedText = 'Expand';
  @Input() expandedText = 'Collapse';
  @Input() targetElementID?: string;
  @Output() onChange = new EventEmitter<boolean>();
  
  toggle() {
    this.collapsed = !this.collapsed;
    this.onChange.emit(this.collapsed);
  }
}

@Component({
  selector: 'xont-ventura-list-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <input type="text" [(ngModel)]="searchText" placeholder="Search..." />
      <select multiple>
        <option *ngFor="let item of items" [value]="item.code">
          {{ item.description }}
        </option>
      </select>
    </div>
  `
})
export class ListPromptComponent implements OnInit {
  @Input() maxLengths?: number[];
  @Input() inputWidths?: number[];
  @Input() gridHeaders?: string[];
  @Input() gridFields?: string[];
  @Input() strict = false;
  @Input() mandatory = false;
  @Input() modelProps?: string[];
  @Input() dataFields?: string[];
  @Input() disabled = false;
  @Output() onDataBind = new EventEmitter<void>();
  
  @Input() ngModel: any;
  @Output() ngModelChange = new EventEmitter<any>();
  
  searchText = '';
  items: any[] = [];
  dataSourceObservable?: any;
  valid = true;
  
  ngOnInit() {
    if (this.dataSourceObservable) {
      this.dataSourceObservable.subscribe((data: any) => {
        this.items = data;
        this.valid = this.items.length > 0;
      });
    }
    if (this.onDataBind) {
      this.onDataBind.emit();
    }
  }
}

@Component({
  selector: 'xont-ventura-gridexport',
  standalone: true,
  imports: [CommonModule],
  template: `<button (click)="export()">Export to Excel</button>`
})
export class GridExportComponent {
  @Input() id?: string;
  @Input() gridId?: string;
  @Input() gridName?: string;
  
  export() {
    alert('Export functionality - to be implemented');
  }
}

@Component({
  selector: 'xont-ventura-gridloader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <label>Page Size: {{ pageSize }}</label>
      <button (click)="previous()">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button (click)="next()">Next</button>
    </div>
  `
})
export class GridLoaderComponent {
  @Output() onChange = new EventEmitter<any>();
  
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  totalRows = 0;
  
  init(module: string) {
    // Initialize logic
  }
  
  getPageSize(): number {
    return this.pageSize;
  }
  
  getLoadSize(): number {
    return this.pageSize;
  }
  
  getRowStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }
  
  getRowEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }
  
  setCurrentPage(page: number) {
    this.currentPage = page;
    this.onChange.emit();
  }
  
  setRowCount(count: number) {
    this.totalRows = count;
    this.totalPages = Math.ceil(count / this.pageSize);
  }
  
  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onChange.emit();
    }
  }
  
  next() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onChange.emit();
    }
  }
}