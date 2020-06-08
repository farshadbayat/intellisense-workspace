export const closeMenuKeyDown = [ 'Escape', 'ArrowLeft', 'ArrowRight'];

export interface IntellisenseState {
  triggerList: string[];
  currentTrigger?: string;
  items: any[];
  fieldName?: string;
  // selectedIndex: number;
  textBeforCaret?: string;
  textAfterCaret?: string;
}

export interface EventData {
  sender: IntellisenseState;
  data: any;
  trigger?: string;
}
