describe('Auth', function () {
  let workbench;
  before(async () => {
    workbench = await browser.getWorkbench();
  });

  it('should be able to load VSCode', async () => {
    // const hubspotViewControl = await workbench
    //   .getActivityBar()
    //   .getViewControl('HubSpot');
    // const hubspotSidebarView = await hubspotViewControl?.openView();
    // (await hubspotSidebarView.getVisibleItems())[0].openContextMenu();

    const sidebarSections = await workbench
      .getSideBar()
      .getContent()
      .getSection('ACCOUNTS');
    const visibleItems = await sidebarSections.getVisibleItems();
    const visibleItem = visibleItems[0];

    console.log(await Promise.all(visibleItems.map((i) => i.getLabel())));

    expect((await visibleItem.getLabel()).trim()).toEqual(
      'DesignersDotHubSpot - 327485'
    );
  });
});
