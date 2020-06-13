export const CloseMenuKeyDown = [ 'Escape', 'ArrowLeft', 'ArrowRight'];

export interface IIntellisenseState {
  triggerList: string[];
  currentTrigger?: string;
  items: any[];
  fieldName?: string;
  // selectedIndex: number;
  textBeforCaret?: string;
  textAfterCaret?: string;
}

export interface IEventData {
  sender: IIntellisenseState;
  data: any;
  trigger?: string;
}
