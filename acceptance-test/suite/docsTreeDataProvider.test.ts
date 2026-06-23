import * as assert from 'assert';
import * as vscode from 'vscode';
import { DocsTreeDataProvider } from '../../src/providers/treeData/DocsTreeDataProvider';

suite('DocsTreeDataProvider', () => {
  suiteSetup(async () => {
    await vscode.extensions.getExtension('HubSpot.hubl')!.activate();
  });

  test('getChildren returns 6 items', async () => {
    const provider = new DocsTreeDataProvider();
    const items = await provider.getChildren();
    assert.strictEqual(items.length, 6);
  });

  test('URL items produce tree items with url-link-tree-item contextValue', () => {
    const provider = new DocsTreeDataProvider();
    const urlItems = [
      {
        label: 'Get started with HubSpot development',
        url: 'https://developers.hubspot.com/docs/getting-started/quickstart',
      },
    ];
    for (const raw of urlItems) {
      const item = provider.getTreeItem(raw);
      assert.strictEqual(item.contextValue, 'url-link-tree-item');
      assert.ok(item.iconPath instanceof vscode.ThemeIcon);
      assert.strictEqual(
        (item.iconPath as vscode.ThemeIcon).id,
        'link-external'
      );
    }
  });

  test('feedback item produces command-tree-item with correct command', () => {
    const provider = new DocsTreeDataProvider();
    const feedbackRaw = {
      title: 'Submit feedback',
      command: 'hubspot.modals.openFeedbackPanel',
    };
    const item = provider.getTreeItem(feedbackRaw);
    assert.strictEqual(item.contextValue, 'command-tree-item');
    assert.strictEqual(
      item.command?.command,
      'hubspot.modals.openFeedbackPanel'
    );
  });
});
