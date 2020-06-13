import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { IntellisenseModule } from 'projects/intellisense/src/public-api';
// import { IntellisenseModule } from 'intellisense'; // import from dist

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
