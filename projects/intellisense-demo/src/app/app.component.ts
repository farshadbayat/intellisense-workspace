import { Component, ViewChild } from '@angular/core';
import { IntellisenseState, IntellisenseDirective, IntellisenseMenuComponent, EventData } from 'intellisense';
// import { IntellisenseState, EventData } from './intellisense/model';
// import { IntellisenseMenuComponent } from './intellisense/intellisense-menu.component';
// import { IntellisenseDirective } from './intellisense/intellisense.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'intellisense-demo';
  textOutput: string;
  htmlOutput: string;
  public state: IntellisenseState = {
    triggerList: ['@', '.'],
    items: [],
    fieldName: 'name'
  };

  fruits = [
      {
        name : 'Apple',
        image : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/265px-Red_Apple.jpg',
        price : 35
      },
      {
        name : 'Banana',
        image : 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Bananas_white_background_DS.jpg/320px-Bananas_white_background_DS.jpg',
        price : 12
      },
      {
        name : 'Grapes',
        image : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Table_grapes_on_white.jpg/320px-Table_grapes_on_white.jpg',
        weight: 0.1,
        price : 45
      },
      {
        name : 'Pineapple',
        image : 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Pineapple_and_cross_section.jpg/286px-Pineapple_and_cross_section.jpg',
        price : 200
      }
    ];
    @ViewChild('menu') menu: IntellisenseMenuComponent;
    @ViewChild(IntellisenseDirective, { static: false}) intellisense: IntellisenseDirective;

  constructor() {
    this.state.items = this.fruits;
  }

  input_onChangeContent(e) {
    this.textOutput = e.Text;
    this.htmlOutput = e.Html;
  }

  input_onEventChange(eventData: EventData) {
    const search = [eventData.sender.textBeforCaret.toLowerCase() , eventData.sender.textAfterCaret.toLowerCase()];
    if (this.state.currentTrigger === '@') {
      this.state.fieldName = 'name';
      this.state.items = this.fruits.filter( f => f.name.toLowerCase().indexOf(search[0]) >= 0 || f.name.toLowerCase().indexOf(search[1]) >= search[0].length);

    } else if (this.state.currentTrigger === '.') {
      const masterName = eventData.data.beforWords.length >= 1 ? eventData.data.beforWords[eventData.data.beforWords.length - 1] : null;
      const properties = ['name' , 'image', 'price'];
      this.state.fieldName = null;
      this.state.items = properties.filter( p => p.indexOf(search[0]) >= 0 || p.indexOf(search[1]) >= search[0].length);
    }
    console.log(this.state.items);
  }

  menuItem_onClick(menu: IntellisenseMenuComponent, i) {
    this.intellisense.item_select(menu, i);
  }

  test_onClick(e) {
    console.log(e);
    console.log(this.intellisense);
  }
}
