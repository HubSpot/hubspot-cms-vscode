describe('Auth', function () {
  let workbench;
  let hubspotViewControl;
  before(async () => {
    workbench = await browser.getWorkbench();
    hubspotViewControl = await workbench
      .getActivityBar()
      .getViewControl('HubSpot');
    await hubspotViewControl?.openView();
  });

  it('loads accounts list from hubspot.config.yml file', async () => {
    const sidebarSections = await workbench
      .getSideBar()
      .getContent()
      .getSection('ACCOUNTS');
    const visibleItems = await sidebarSections.getVisibleItems();

    // This depends on the content in /test/hubspot.config.yml
    expect(await Promise.all(visibleItems.map((i) => i.getLabel()))).toEqual([
      'hubspot-cms-vscodeE2ETesting - 23876139 ',
    ]);
  });

  it('loads context menu', async () => {
    // https://github.com/webdriverio-community/wdio-vscode-service/issues/57
    const sidebarSections = await workbench
      .getSideBar()
      .getContent()
      .getSection('ACCOUNTS');
    const visibleItems = await sidebarSections.getVisibleItems();
    // // const hubspotViewControl = await workbench
    // //   .getActivityBar()
    // //   .getViewControl('HubSpot');
    // // const hubspotSidebarView = await hubspotViewControl?.openView();
    // const menuMaybe = await (
    //   await hubspotSidebarView.getVisibleItems()
    // )[0].openContextMenu();
    // const menuMaybe = await visibleItems[0].openContextMenu();
    await visibleItems[0].elem.click({ button: 'right' });

    // browser.debug;

    // await browser.pause(5000);

    // const sidebarSections = await workbench
    //   .getSideBar()
    //   .getContent()
    //   .getSection('ACCOUNTS');
    // const visibleItems = await sidebarSections.getVisibleItems();
    // const visibleItem = visibleItems[0];

    // console.log(await Promise.all(visibleItems.map((i) => i.getLabel())));

    await browser.saveScreenshot('./foo.png');

    expect(visibleItems[0]).toEqual(1);
  });
});
