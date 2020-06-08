import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IntellisenseModule } from 'intellisense';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IntellisenseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
