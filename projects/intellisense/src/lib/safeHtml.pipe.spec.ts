import { SafeHtmlPipe } from './safeHtml.pipe';

describe('Pipe: SafeHtmle', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipe(null);
    expect(pipe).toBeTruthy();
  });
});
