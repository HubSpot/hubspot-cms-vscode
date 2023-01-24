describe('Auth', function () {
  let workbench;
  before(async () => {
    workbench = await browser.getWorkbench();
  });

  it('should be able to load VSCode', async () => {
    const hubspotViewControl = await workbench
      .getActivityBar()
      .getViewControl('HubSpot');
    const hubspotSidebarView = await hubspotViewControl?.openView();

    // await browser.pause(5000);

    // await browser.executeWorkbench(
    //   (vscode, param1, param2) => {
    //     console.log('vscode: ', vscode, Object.keys(vscode));
    //     vscode.window.showInformationMessage(`I am an ${param1} ${param2}!`);
    //   },
    //   'API',
    //   'call'
    // );

    const sidebarSections = await workbench
      .getSideBar()
      .getContent()
      .getSection('ACCOUNTS');

    // console.log(
    //   await Promise.all(sidebarSections.map((section) => section.getTitle()))
    // );
    // console.log('sidebarSection: ', sidebarSections);

    const visibleItems = await sidebarSections.getVisibleItems();
    const visibleItem = visibleItems[0];

    console.log(await visibleItem.getLabel());

    console.log(await Promise.all(visibleItems.map((i) => i.getLabel())));
    // console.log(1111, Object.keys(visibleItems[0].viewPart.content.view));

    // console.log('visibleItems: ', {
    //   // actionLabel$: await visibleItems[0].actionLabel$,
    //   buttonLabel$,
    //   // expandedAttr$: await visibleItems[0].expandedAttr$,
    //   // expandedValue$: await visibleItems[0].expandedValue$,
    //   title$,
    //   title$$: visibleItems[0].title$$,
    //   titleText$,
    //   titleText$$: visibleItems[0].titleText$$,
    // });

    // await visibleItems[0].openContextMenu();
    expect((await visibleItem.getLabel()).trim()).toEqual(
      'DesignersDotHubSpot - 327485'
    );
  });
});
