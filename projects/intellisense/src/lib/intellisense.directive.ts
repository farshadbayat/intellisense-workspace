import { Directive, Input, Output, EventEmitter, HostListener, ViewContainerRef, HostBinding, OnChanges, SimpleChanges } from '@angular/core';
import { EventData, IntellisenseState, closeMenuKeyDown } from './model';
import { IntellisenseMenuComponent } from './intellisense-menu.component';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';


@Directive({
  selector: '[intellisense]',
})
export class IntellisenseDirective {
  private maxWidth: number;
  public itemIndex: number;
  @Input()
  public set editable( value: boolean) {
    this.editor.element.nativeElement.contentEditable = value;
  }
  @Output() contentChange = new EventEmitter<any>();
  @Output() eventCapture = new EventEmitter<EventData>();
  @Input() splitterChar = [ String.fromCharCode(160) /* &nbsp; */, ' ', '-' , '+', '\\' , '/' , '[', ']' , '{', '}' , '.' , ','];
  @Input() state?: IntellisenseState = null;
  @Input() menuRef: IntellisenseMenuComponent;
  @HostBinding('style') style: SafeStyle;

  constructor(public editor: ViewContainerRef, public sanitizer: DomSanitizer) {
    this.inputStyle();
  }

  @HostListener('document:keyup.control.space', ['$event'])
  onCtrlSpaceKeyup(event: KeyboardEvent) {
    this.initCaret();
    this.showMenu();
  }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const e = { Text: this.editor.element.nativeElement.textContent, Html: this.editor.element.nativeElement.innerHTML};
    this.contentChange.emit(e);
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    this.processEvent(event);
  }

  @HostListener('keyup', ['$event']) onKeyUp(event: KeyboardEvent) {
    this.processEvent(event);
  }

  @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    this.processEvent(event);
  }

  @HostListener('click', ['$event']) onClick(event: any) {
    this.closeMenu();
  }

  inputStyle() {
    const styles = [];
    styles.push('border: 1px lightgrey solid');
    styles.push('border-radius: 4px');
    styles.push('display: block');
    styles.push('box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075)');
    styles.push('height: 200px');
    styles.push('overflow-y: auto');
    styles.push('background-color: white');
    styles.push('outline: none');
    styles.push('padding: 8px');
    this.style = this.sanitizer.bypassSecurityTrustStyle(styles.join(';'));
  }

  public item_select(menu: IntellisenseMenuComponent, index: number) {
    this.itemIndex = Math.min( this.state.items.length - 1, index);
    this.injectText(this.menuItemContent(this.state.items[this.itemIndex]));
    this.onInput(null);
    setTimeout(() => this.closeMenu(), 100);
  }

  initCaret() {
    const caret = this.getCaret();
    if ( caret === null) {
      console.log('This browser does not support intellisense.');
      return;
    }

    let range: Range = caret.Range;
    const sel: Selection = caret.Selection;
    const endContainer = range.endContainer;
    const offset = range.endOffset;
    const isSameStartEnd = range.startContainer === range.endContainer;
    const diff = range.startOffset - range.endOffset ;
    const el = document.createElement('div');

    el.innerHTML = `<span contenteditable=false id='c0'></span>`;
    const frag = document.createDocumentFragment();

    let lastNode: any;
    let firstNode: any = null;
    for (const [_, node] of Object.entries(el.children)) {
      lastNode = frag.appendChild(node);
      if (firstNode === null) {
        firstNode = lastNode;
      }
    }

    range.insertNode(frag);
    // const caretTag = document.getElementById('c0' );
    const caretTag = this.editor.element.nativeElement.querySelector('#c0');
    if (caretTag && !(isSameStartEnd === true && diff !== 0)) {
      range = range.cloneRange();
      range.setEnd(firstNode, 0);
      range.setEnd(endContainer, offset);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  getCaret( index: number = 0): {Range: Range, Selection: Selection} {
    let sel: Selection;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return {Range: sel.getRangeAt(index), Selection: sel};
      }
    }
    return null;
  }

  deleteCaret() {
    const caret = this.editor.element.nativeElement.querySelector('#c0');
    if (caret) {
      caret.parentNode.removeChild(caret);
    }
  }

  showMenu() {
    this.updateMaxVisibleWidth();
    this.updateSearchTrigger(true);
    this.itemIndex = 0;
    this.updateLocation();
    this.menuRef.visible = true;
  }

  closeMenu() {
    this.deleteCaret();
    this.menuRef.visible = false;
  }

  // Extract Search Text & Current Trigger
  updateSearchTrigger(raiseEvent: boolean = false) {
    const result = { startNode : null , startOffset : 0, endNode: null , endOffset: 0 };
    const caret = this.getCaret();
    if ( caret === null) {
      console.log('This browser does not support intellisense.');
      return;
    }
    const range: Range = caret.Range;

    let complated = false;
    let element = range.startContainer;
    this.state.textAfterCaret = '';
    this.state.textBeforCaret = '';
    // extract word befor Caret
    do {
      const textLen = element.textContent.length;
      result.startNode = element;
      for (let i = 1; i <= textLen; i++) {
        const ch = element.textContent.substring(textLen - i, textLen - i + 1);
        const isSplit = this.splitterChar.filter( p => p === ch).length > 0 ? true : false;
        const isTrigger = this.state.triggerList.filter( p => p === ch).length > 0 ? true : false;
        result.startOffset = textLen - i + 1;
        if (isTrigger === true || isSplit === true) {
          this.state.currentTrigger = isTrigger === true ? ch : null;
          complated = true;
          break;
        } else {
          this.state.textBeforCaret = ch + this.state.textBeforCaret;
        }
      }
      element = element.previousSibling;
    } while (element && complated === false && this.isBlockElement(element) === false);
    // extract word after Caret
    complated = false;
    result.endNode = result.startOffset;
    result.endOffset = 0;
    element = (range.startContainer === range.endContainer) ? range.endContainer.nextSibling : range.endContainer;
    while (element && complated === false &&  this.isBlockElement(element) === false) {
      const textLen = element.textContent.length;
      result.endNode = element;
      result.endOffset = textLen;
      for (let i = 0; i <= textLen; i++) {
        const ch = element.textContent.substring(i, i + 1);
        const isSplit = [...this.splitterChar , ...this.state.triggerList].filter( p => p === ch).length > 0 ? true : false;
        if (isSplit === true) {
          complated = true;
          result.endOffset = i;
          break;
        } else {
          this.state.textAfterCaret += ch;
        }
      }
      element = element.nextSibling;
    }
    if (raiseEvent === true) {
      this.eventCapture.emit({sender: this.state, data: this.getCurrentLineInfo(), trigger: this.state.currentTrigger});
    }
    return result;
  }

  isBlockElement(node: any) {
    const blockTags = ['TD', 'TH' , 'CAPTION', 'BR'];
    const inlineDisply = ['contents', 'initial' , 'table-cell', 'unset'];
    if ( node.nodeType !== 1) { // if type is not element so blocking false;
      return false;
    }
    if (blockTags.filter( b => b === node.nodeName).length > 0 ) {
      return true;
    }
    const compStyles = window.getComputedStyle(node);
    const displyStyle = compStyles.getPropertyValue('display');
    if (displyStyle.startsWith('inline') || inlineDisply.filter( d => d === displyStyle).length > 0 ) {
      return false;
    } else {
      return true;
    }
  }

  updateLocation() {
    // const caret = document.getElementById('c0');
    const caret = this.editor.element.nativeElement.querySelector('#c0');
    // const menu = document.getElementById('menu');
    if (caret && this.menuRef) {
      const offset = this.getTotalOffset(caret);
      // const mw = (menu.firstChild as HTMLDivElement).clientWidth;
      const x1 = Math.min(offset.offsetLeft - this.editor.element.nativeElement.scrollLeft , this.maxWidth - this.menuRef.width());
      const y1 = offset.offsetTop - this.editor.element.nativeElement.scrollTop  + 25;
      this.menuRef.location = {x: x1, y: y1};
    }
  }

  // Importand Node:
  // 1) https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
  // 2) https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent
  getTotalOffset(element: HTMLElement) {
    let top = element.offsetTop;
    let left = element.offsetLeft;
    while ( element.offsetParent !== this.editor.element.nativeElement.offsetParent) {
      element = element.offsetParent as HTMLElement;
      top += element.offsetTop;
      left += element.offsetLeft;
    }
    return {offsetTop: top, offsetLeft: left};
  }

  getCurrentLineInfo(): any {
    const result = {beforWords: [], beforText: '', afterText: ''};
    const caret = this.getCaret();
    if ( caret === null) {
      console.log('This browser does not support intellisense');
      return;
    }
    const range: Range = caret.Range;
    let element = range.startContainer;
    // find befor text
    do {
      const textLen = element.textContent.length;
      for (let i = 1; i <= textLen; i++) {
        const ch = element.textContent.substring(textLen - i, textLen - i + 1);
        result.beforText = ch + result.beforText;
      }
      element = element.previousSibling;
    } while (element && element.nodeName !== 'DIV' && element.nodeName !== 'BR');
    // find after text
    element = (range.startContainer === range.endContainer) ? range.endContainer.nextSibling : range.endContainer;
    while (element && element.nodeName !== 'DIV' && element.nodeName !== 'BR') {
      const textLen = element.textContent.length;
      for (let i = 0; i <= textLen; i++) {
        const ch = element.textContent.substring(i, i + 1);
        result.afterText += ch;
      }
      element = element.nextSibling;
    }
    // extract all word
    let beforText = result.beforText;
    // insert space befor trigger
    this.state.triggerList.forEach(t => {
      beforText = this.replaceAll(beforText, t, ' ' + t);
    });
    // split normalized
    this.splitterChar.forEach(s => {
      beforText = this.replaceAll(beforText, s, ' ');
    });
    beforText = this.replaceAll(beforText, '  ', ' ').trim();
    result.beforWords = beforText.split(' ');
    return result;
  }

  replaceAll(text: string, search: string, replace: string): string {
    return text.split(search).join(replace);
  }

  injectText(text: string) {
    const caret = this.getCaret();
    if ( caret === null) {
      console.log('This browser does not support intellisense.');
      return;
    }

    let range: Range = caret.Range;
    let sel: Selection = caret.Selection;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        const searchRange = document.createRange();
        const cursorLocation = this.updateSearchTrigger();
        searchRange.setStart(cursorLocation.startNode, cursorLocation.startOffset);
        searchRange.setEnd(cursorLocation.endNode, cursorLocation.endOffset);
        searchRange.deleteContents();

        const newNode = document.createTextNode(text);
        const frag = document.createDocumentFragment();
        const lastNode = frag.appendChild(newNode);

        range.insertNode(frag);

        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        this.closeMenu();
      }
    }
  }

  updateMaxVisibleWidth(): number {
    let parent = this.editor.element.nativeElement;
    while (parent.parentElement) {
      parent = parent.parentElement;
      const compStyles = window.getComputedStyle(parent);
      this.maxWidth = parent.clientWidth;
      if (compStyles.getPropertyValue('overflow-x') === 'hidden') {
        return this.maxWidth;
      }
    }
    // if there isn't any container with hidden overflow style then return vw (width of viewport)
    this.maxWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return this.maxWidth;
  }

  processEvent(e: KeyboardEvent) {
    if (this.state === null) {
      console.warn('[menuData] field is not exist in tag.');
      return;
    }
    if (this.menuRef === null) {
      console.warn('refrence to the menu is not set.');
      return;
    }
    let preventDefualt = false;
    if (this.menuRef.visible === true) {
      if (e.type === 'keydown' && e.key === 'Enter') {
        preventDefualt = true;
        this.item_select(this.menuRef, this.itemIndex);
      } else if ( e.type === 'keydown' && e.key === 'ArrowDown' && this.itemIndex < this.state.items.length - 1 ) {
        this.itemIndex++;
        preventDefualt = true;
      } else if ( e.type === 'keydown' && e.key === 'ArrowUp' && this.itemIndex > 0) {
        this.itemIndex--;
      } else if ( e.type === 'keydown' && [...closeMenuKeyDown, ...this.splitterChar].filter( k => k === e.key).length > 0 ) {
        this.closeMenu();
      } else if ( e.key === 'Backspace') {
        if (this.state.textBeforCaret.length === 0 && this.state.textAfterCaret.length === 0) {
          this.closeMenu();
        } else {
          this.updateSearchTrigger(true);
        }
      }

      if (e.type === 'keyup' && this.visibleCharachter(e) === true) {
        this.updateSearchTrigger(true);
      }

      if ( e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        preventDefualt = true;
      }
      this.updateLocation();
    }

    if (e.type === 'keyup' && this.state.triggerList.filter( t => t === e.key).length > 0) {
      this.deleteCaret();
      this.onCtrlSpaceKeyup(null);
      this.state.currentTrigger = e.key;
      this.updateSearchTrigger(false);
      // this.eventCapture.emit({sender: this.state, data: this.getCurrentLineInfo(), trigger: e.key});
    }

    if ( preventDefualt === true ) {
      e.preventDefault();
    }
  }

  visibleCharachter(e) {
    const charCode = (e.charCode) ? e.charCode : ((e.keyCode) ? e.keyCode : ((e.which) ? e.which : 0));
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode >= 48 && charCode <= 57) ) {
      return true;
    } else {
      return false;
    }
  }

  menuItemContent(item: any) {
    if (this.state.fieldName !== null ) {
      return item[this.state.fieldName];
    } else {
      return item;
    }
  }

}
