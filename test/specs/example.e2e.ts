describe('WDIO VSCode Service', () => {
    it('should be able to load VSCode', async () => {
        const workbench = await browser.getWorkbench()
        expect(await workbench.getTitleBar().getTitle())
            .toBe('[Extension Development Host] hubspot-cms-vscode')
    })
    
    it('should show all activity bar items', async () => {
        const workbench = await browser.getWorkbench()
        const viewControls = await workbench.getActivityBar().getViewControls()
        expect(await Promise.all(viewControls.map((vc) => vc.getTitle()))).toEqual([
            'Explorer',
            'Search',
            'Source Control',
            'Run and Debug',
            'Extensions',
            'HubSpot'
        ])
    })
})