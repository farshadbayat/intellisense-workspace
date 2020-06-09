# Intellisense

angular intellisense menu which can be used in html tags or html editor with customizable option.
<br>
Features:
<br>
1.directive: can be used in evrey tag such as div, html editor.
<br>
2.Ability to customize the menu.
<br>
3.Extract useful information at event raise.

## Events Outputs

(contentChange): raise when character typing in tag.
Output: { Text: string, Html: string}

(eventCapture): raise when menu open or current word changed.
Output: 
```javascript
export interface EventData {
  sender: IntellisenseState;
  data: any;
  trigger?: string;
}
```

## Installation

> npm i angular-intellisense --save

---
## Import this module to your angular app

```javascript
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
```

---

<br>

## Angular Intellisense
# Configuration
```javascript
public state: IntellisenseState = {
    triggerList: ['@', '.'],
    items: [{ name : 'Apple',price : 35}, { name : 'Banana',price : 45}, { name : 'Grapes',price : 68}],
    fieldName: 'name'
  };
```

---

<br>

## HTML Tag
```html
<div class="form-control" intellisense [editable]='true' [menuRef]="menu" [state]='state'
    (contentChange)="input_onChangeContent($event)"
    (eventCapture)="input_onEventChange($event)">
</div>
```
## Menu
```html
<intellisense-menu #menu >
  <a *ngFor="let item of state.items; let i = index;" [class.select]="i === intellisense?.itemIndex" (click)="menuItem_onClick(menu, i)">
    {{ item.name || item}}
  </a>
</intellisense-menu>
```
---
