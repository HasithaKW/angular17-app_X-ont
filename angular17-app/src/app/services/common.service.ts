import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommonService {
  getAPIPrefix(module: string): string {
    return ''; // returns empty string, so URLs are relative (proxy will handle)
  }
}