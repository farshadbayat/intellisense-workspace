import { Component, Input, HostBinding, ViewChild } from '@angular/core';

@Component({
  selector: 'intellisense-menu',
  template: `<div #menu class="dropdown-content" [class.dropdown-show-content]="visible">
    <ng-content></ng-content>
  </div>`,
  styles: [
  `:host {
    position: absolute;
    display: inline-block;
    user-select: none;
  }
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }
  .dropdown-show-content {
    display: block;
  }`]
})
export class IntellisenseMenuComponent {
  @ViewChild('menu') menu;
  @Input() visible: boolean;
  @HostBinding('style.left.px') x: number;
  @HostBinding('style.top.px') y: number;

  constructor() {
  }

  public location(value: {x: number, y: number}) {
    this.x = value.x;
    this.y = value.y;
  }

  public width(): number {
    return Math.max(this.menu.nativeElement.clientWidth, 160);
  }

}
