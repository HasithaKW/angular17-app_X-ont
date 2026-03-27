// MIGRATION: main.ts — Angular 4 → Angular 17
//
// Angular 4:
//   platformBrowserDynamic().bootstrapModule(AppModule)
//   Loaded via SystemJS: System.import('main.js')
//
// Angular 17:
//   bootstrapApplication(AppComponent, appConfig)
//   Bundled by Angular CLI (webpack/esbuild) — no SystemJS needed

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
