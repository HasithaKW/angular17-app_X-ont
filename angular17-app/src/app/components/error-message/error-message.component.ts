import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" *ngIf="error">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ error }}</div>
        <button class="error-close" (click)="close()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    }
    
    .error-content {
      background: #fff3f3;
      border-left: 4px solid #dc3545;
      border-radius: 4px;
      padding: 12px 20px;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .error-icon {
      font-size: 20px;
    }
    
    .error-message {
      flex: 1;
      color: #721c24;
      font-size: 14px;
    }
    
    .error-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #721c24;
      padding: 0 4px;
    }
    
    .error-close:hover {
      opacity: 0.7;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ErrorMessageComponent {
  error: string | null = null;
  private timeout: any;

  showError(message: string, duration: number = 5000) {
    this.error = message;
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.error = null;
    }, duration);
  }

  close() {
    this.error = null;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}