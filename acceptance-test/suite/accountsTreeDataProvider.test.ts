import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { AccountsTreeDataProvider } from '../../src/providers/treeData/AccountsTreeDataProvider';

suite('AccountsTreeDataProvider', () => {
  let savedConfigPath: string | undefined;

  suiteSetup(async () => {
    // Point HUBSPOT_CONFIG_PATH at the fixture so tests see exactly one
    // account (accountId 99999, name test-portal) regardless of whether
    // the developer has a real ~/.hubspot.config.yml on their machine.
    const wf = vscode.workspace.workspaceFolders?.[0];
    if (wf) {
      savedConfigPath = process.env.HUBSPOT_CONFIG_PATH;
      process.env.HUBSPOT_CONFIG_PATH = path.join(
        wf.uri.fsPath,
        'hubspot.config.yml'
      );
    }
    await vscode.extensions.getExtension('HubSpot.hubl')!.activate();
  });

  suiteTeardown(() => {
    process.env.HUBSPOT_CONFIG_PATH = savedConfigPath;
  });

  test('getChildren returns the fixture account', async () => {
    const provider = new AccountsTreeDataProvider();
    const accounts = await provider.getChildren();
    assert.strictEqual(accounts?.length, 1);
    assert.strictEqual(accounts![0].accountId, 99999);
    assert.strictEqual(accounts![0].name, 'test-portal');
  });

  test('getTreeItem returns a TreeItem with accountTreeItem contextValue', async () => {
    const provider = new AccountsTreeDataProvider();
    const accounts = (await provider.getChildren())!;
    const item = provider.getTreeItem(accounts[0]);
    assert.ok(item instanceof vscode.TreeItem);
    assert.strictEqual(item.contextValue, 'accountTreeItem');
  });

  test('getTreeItem sets star-full icon for the default account', async () => {
    const provider = new AccountsTreeDataProvider();
    const accounts = (await provider.getChildren())!;
    const item = provider.getTreeItem(accounts[0]);
    assert.ok(item.iconPath instanceof vscode.ThemeIcon);
    assert.strictEqual((item.iconPath as vscode.ThemeIcon).id, 'star-full');
  });

  test('getTreeItem label includes account name', async () => {
    const provider = new AccountsTreeDataProvider();
    const accounts = (await provider.getChildren())!;
    const item = provider.getTreeItem(accounts[0]);
    assert.ok(
      typeof item.label === 'string' && item.label.includes('test-portal')
    );
  });

  test('getChildren returns empty array when config has no accounts', async () => {
    // Write a minimal config with an empty accounts list to a temp file so
    // the provider reads [] rather than the developer's real config.
    const tmpConfig = path.join(os.tmpdir(), `hubspot_test_${Date.now()}.yml`);
    fs.writeFileSync(tmpConfig, 'accounts: []\n');
    const saved = process.env.HUBSPOT_CONFIG_PATH;
    process.env.HUBSPOT_CONFIG_PATH = tmpConfig;
    try {
      const provider = new AccountsTreeDataProvider();
      const accounts = await provider.getChildren();
      assert.deepStrictEqual(accounts, []);
    } finally {
      process.env.HUBSPOT_CONFIG_PATH = saved;
      fs.unlinkSync(tmpConfig);
    }
  });
});
