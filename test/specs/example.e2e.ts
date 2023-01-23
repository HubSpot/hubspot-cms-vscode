describe('WDIO VSCode Service', function () {
  it('should be able to load VSCode', async () => {
    const workbench = await browser.getWorkbench();
    expect(await workbench.getTitleBar().getTitle()).toBe(
      '[Extension Development Host] hubspot-cms-vscode'
    );
  });

  it('extension should appear in sidebar', async () => {
    const workbench = await browser.getWorkbench();
    const viewControls = await workbench.getActivityBar().getViewControls();
    const viewControlTitles = await Promise.all(
      viewControls.map((vc) => vc.getTitle())
    );

    const hubspotViewControlExists =
      viewControlTitles.indexOf('HubSpot') !== -1;

    expect(hubspotViewControlExists).toBe(true);
  });
});
