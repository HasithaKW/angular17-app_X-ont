import { Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { NewComponent } from './components/new/new.component';

export const routes: Routes = [
  { path: '', redirectTo: '/list', pathMatch: 'full' },
  { path: 'list', component: ListComponent },
  { path: 'new/:pageType', component: NewComponent },
  { path: 'new/:pageType/:retnType/:moduleCode', component: NewComponent }
];