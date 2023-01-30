describe('WDIO VSCode Service', function () {
  let workbench;
  before(async () => {
    workbench = await browser.getWorkbench();
  });

  it('should be able to load VSCode development host', async () => {
    expect(await workbench.getTitleBar().getTitle()).toContain(
      '[Extension Development Host]'
    );
  });

  it('HubSpot extension should load and appear in sidebar', async () => {
    const hubspotViewControl = await workbench
      .getActivityBar()
      .getViewControl('HubSpot');

    expect(hubspotViewControl).toBeTruthy();
  });
});
