describe('WDIO VSCode Service', function () {
  let workbench;
  before(async () => {
    workbench = await browser.getWorkbench();
  });

  it('should be able to load VSCode', async () => {
    expect(await workbench.getTitleBar().getTitle()).toBe(
      '[Extension Development Host] hubspot-cms-vscode'
    );
  });

  it('extension should appear in sidebar', async () => {
    const hubspotViewControl = await workbench
      .getActivityBar()
      .getViewControl('HubSpot');

    expect(hubspotViewControl).toBeTruthy();
  });
});
