import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SketchPadComponent } from './modules/sketch-pad/sketch-pad.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/sketch', pathMatch: 'full' },
  { path: 'sketch', component: SketchPadComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
