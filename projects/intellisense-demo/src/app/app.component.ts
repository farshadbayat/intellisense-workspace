import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { IIntellisenseState, IEventData, IntellisenseMenuComponent, IntellisenseDirective } from 'projects/intellisense/src/public-api';
// import { IIntellisenseState, IEventData, IntellisenseMenuComponent, IntellisenseDirective } from 'intellisense'; // import from dist

const IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'intellisense-demo';
  textOutput: string;
  htmlOutput: string;
  public state: IIntellisenseState = {
    fieldName: 'name',
    items: [],
    triggerList: ['@', '.'],
  };

  fruits = [
      {
        name : 'Apple',
        image : IMAGE_URL + '/1/15/Red_Apple.jpg/265px-Red_Apple.jpg',
        price : 35,
      },
      {
        name : 'Banana',
        image : IMAGE_URL + '/4/44/Bananas_white_background_DS.jpg/320px-Bananas_white_background_DS.jpg',
        price : 12,
      },
      {
        name : 'Grapes',
        image : IMAGE_URL + '/b/bb/Table_grapes_on_white.jpg/320px-Table_grapes_on_white.jpg',
        weight: 0.1,
        price : 45
      },
      {
        name : 'Pineapple',
        image : IMAGE_URL + '/c/cb/Pineapple_and_cross_section.jpg/286px-Pineapple_and_cross_section.jpg',
        price : 200
      }
    ];
    @ViewChild('menu', {static: false}) public menu: IntellisenseMenuComponent;
    @ViewChild(IntellisenseDirective, { static: false}) public intellisense: IntellisenseDirective;

  constructor() {
    this.state.items = this.fruits;
  }

  ngAfterViewInit(): void {
    console.log('<b> This is a sample...<\b>');
    this.intellisense.html = `
      <h1><strong>Angular Intellisense Auto Complate</strong></h1>
      <p>Hi,</p>
      <p>This menu contains a list of fruits and will be shown by pressing @ and . or CTRL+SPACE.</p>
    `;
  }

  input_onChangeContent(e) {
    this.textOutput = e.Text;
    this.htmlOutput = e.Html;
  }

  input_onEventChange(eventData: IEventData) {
    const search = [eventData.sender.textBeforCaret.toLowerCase() , eventData.sender.textAfterCaret.toLowerCase()];
    if (this.state.currentTrigger === '@') {
      this.state.fieldName = 'name';
      this.state.items = this.fruits.filter( (f) =>
      f.name.toLowerCase().indexOf(search[0]) >= 0 || f.name.toLowerCase().indexOf(search[1]) >= search[0].length);

    } else if (this.state.currentTrigger === '.') {
      const masterName = eventData.data.beforWords.length >= 1 ? eventData.data.beforWords[eventData.data.beforWords.length - 1] : null;
      const properties = ['name' , 'image', 'price'];
      this.state.fieldName = null;
      this.state.items = properties.filter( p => p.indexOf(search[0]) >= 0 || p.indexOf(search[1]) >= search[0].length);
    }
  }

  menuItem_onClick(menu: IntellisenseMenuComponent, i) {
    this.intellisense.item_select(menu, i);
  }
}
