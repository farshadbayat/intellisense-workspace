import { Component, OnInit, Input, HostBinding, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

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
export class IntellisenseMenuComponent implements OnChanges {
  @ViewChild('menu') menu;
  @Input() visible: boolean;
  @Input() location: {x: number, y: number};
  @HostBinding('style.left.px') x: number;
  @HostBinding('style.top.px') y: number;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.location) {
      this.x = this.location.x;
      this.y = this.location.y;
    }
  }

  public width(): number {
    return Math.max(this.menu.nativeElement.clientWidth, 160);
  }

}
