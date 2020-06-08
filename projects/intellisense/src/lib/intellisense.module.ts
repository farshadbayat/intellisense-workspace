import { NgModule } from '@angular/core';
import { IntellisenseDirective } from './intellisense.directive';
import { IntellisenseMenuComponent } from './intellisense-menu.component';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './safeHtml.pipe';

@NgModule({
   declarations: [
      IntellisenseDirective,
      IntellisenseMenuComponent,
      SafeHtmlPipe
   ],
   imports: [
      CommonModule
   ],
   exports: [
      IntellisenseDirective,
      IntellisenseMenuComponent,
      SafeHtmlPipe
   ]
})
export class IntellisenseModule { }
