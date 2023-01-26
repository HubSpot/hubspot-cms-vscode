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
    // await browser.pause(10000);
    const sidebarSections = await workbench
      .getSideBar()
      .getContent()
      .getSection('ACCOUNTS');
    const visibleItems = await sidebarSections.getVisibleItems();

    expect(await Promise.all(visibleItems.map((i) => i.getLabel()))).toEqual([
      'DesignersDotHubSpot - 327485 ',
      'InspireQA - 882457564 [QA]',
      'InspiredPortalQA - 884144367 [QA]',
      'MikeQA - 101867970 [QA]',
      'MikeProd - 6597896 ',
      'VSCodeFeedbackHandler - 23748177 ',
      'DobbyFreeElf - 882194316 [QA]',
    ]);
  });

  // it('loads context menu', async () => {
  //   // https://github.com/webdriverio-community/wdio-vscode-service/issues/57
  //   const sidebarSections = await workbench
  //     .getSideBar()
  //     .getContent()
  //     .getSection('ACCOUNTS');
  //   const visibleItems = await sidebarSections.getVisibleItems();
  //   // // const hubspotViewControl = await workbench
  //   // //   .getActivityBar()
  //   // //   .getViewControl('HubSpot');
  //   // // const hubspotSidebarView = await hubspotViewControl?.openView();
  //   // const menuMaybe = await (
  //   //   await hubspotSidebarView.getVisibleItems()
  //   // )[0].openContextMenu();
  //   // const menuMaybe = await visibleItems[0].openContextMenu();
  //   await visibleItems[0].select();

  //   // browser.debug;

  //   // await browser.pause(5000);

  //   // const sidebarSections = await workbench
  //   //   .getSideBar()
  //   //   .getContent()
  //   //   .getSection('ACCOUNTS');
  //   // const visibleItems = await sidebarSections.getVisibleItems();
  //   // const visibleItem = visibleItems[0];

  //   // console.log(await Promise.all(visibleItems.map((i) => i.getLabel())));

  //   expect(visibleItems[0]).toEqual(1);
  // });
});
