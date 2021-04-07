import { InstaAutoBotTemplatePage } from './app.po';

describe('InstaAutoBot App', function() {
  let page: InstaAutoBotTemplatePage;

  beforeEach(() => {
    page = new InstaAutoBotTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
