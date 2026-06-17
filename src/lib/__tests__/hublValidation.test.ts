import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerValidate } from '../hublValidation';

vi.mock('fs');

vi.mock('@hubspot/local-dev-lib/config', () => ({
  getConfigDefaultAccountIfExists: vi.fn().mockReturnValue(null),
}));

vi.mock('@hubspot/local-dev-lib/api/validateHubl', () => ({
  validateHubl: vi.fn().mockResolvedValue({ data: { renderingErrors: [] } }),
}));

vi.mock('@hubspot/local-dev-lib/cms/templates', () => ({
  isCodedFile: vi.fn().mockReturnValue(false),
  getAnnotationValue: vi.fn().mockReturnValue(null),
  ANNOTATION_KEYS: {
    isAvailableForNewContent: 'isAvailableForNewContent',
    templateType: 'templateType',
  },
  TEMPLATE_TYPES: { unmapped: 0 },
}));

vi.mock('@hubspot/local-dev-lib/cms/modules', () => ({
  isModuleHTMLFile: vi.fn().mockReturnValue(false),
}));

const makeDocument = (
  languageId: string,
  overrides: Record<string, any> = {}
) => ({
  languageId,
  uri: { toString: () => `mock-uri:${languageId}` },
  getText: vi.fn().mockReturnValue(''),
  lineAt: vi.fn().mockReturnValue({ range: {}, text: '' }),
  lineCount: 1,
  fileName: 'test.html',
  getWordRangeAtPosition: vi.fn().mockReturnValue(undefined),
  ...overrides,
});

const makeCollection = () => ({
  set: vi.fn(),
  clear: vi.fn(),
  delete: vi.fn(),
  dispose: vi.fn(),
  forEach: vi.fn(),
  get: vi.fn(),
  has: vi.fn(),
  name: 'test-collection',
});

describe('triggerValidate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('non-HubL language IDs trigger immediate clearValidation', () => {
    it('clears validation for "javascript"', () => {
      const doc = makeDocument('javascript');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });

    it('clears validation for "html" (not html-hubl)', () => {
      const doc = makeDocument('html');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });

    it('clears validation for "css" (not css-hubl)', () => {
      const doc = makeDocument('css');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });

    it('clears validation for "typescript"', () => {
      const doc = makeDocument('typescript');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });

    it('clears validation for "json"', () => {
      const doc = makeDocument('json');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });

    it('clears validation for empty string language ID', () => {
      const doc = makeDocument('');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });
  });

  describe('HubL language IDs defer validation via setTimeout', () => {
    it('does NOT call collection.set immediately for "html-hubl"', () => {
      const doc = makeDocument('html-hubl');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).not.toHaveBeenCalled();
    });

    it('does NOT call collection.set immediately for "css-hubl"', () => {
      const doc = makeDocument('css-hubl');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);
      expect(col.set).not.toHaveBeenCalled();
    });

    it('calls clearValidation after 1000ms for "html-hubl" when no account configured', async () => {
      const doc = makeDocument('html-hubl');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);

      expect(col.set).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);

      // No accountId → getRenderingErrors returns undefined → clearValidation is called
      expect(col.set).toHaveBeenCalledTimes(1);
      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });

    it('calls clearValidation after 1000ms for "css-hubl" when no account configured', async () => {
      const doc = makeDocument('css-hubl');
      const col = makeCollection();
      triggerValidate(doc as any, col as any);

      await vi.advanceTimersByTimeAsync(1000);

      expect(col.set).toHaveBeenCalledWith(doc.uri, undefined);
    });
  });

  describe('debouncing behavior', () => {
    it('cancels a pending timer when called again before it fires', async () => {
      const doc = makeDocument('html-hubl');
      const col = makeCollection();

      triggerValidate(doc as any, col as any);
      await vi.advanceTimersByTimeAsync(500); // halfway through

      // Call again — should reset the 1000ms timer
      triggerValidate(doc as any, col as any);
      await vi.advanceTimersByTimeAsync(500); // original would have fired, but shouldn't

      expect(col.set).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(500); // now the second timer fires

      expect(col.set).toHaveBeenCalledTimes(1);
    });

    it('fires only once after rapid consecutive calls', async () => {
      const doc = makeDocument('html-hubl');
      const col = makeCollection();

      triggerValidate(doc as any, col as any);
      triggerValidate(doc as any, col as any);
      triggerValidate(doc as any, col as any);
      triggerValidate(doc as any, col as any);
      triggerValidate(doc as any, col as any);

      await vi.advanceTimersByTimeAsync(1000);

      expect(col.set).toHaveBeenCalledTimes(1);
    });

    it('a non-HubL call immediately clears even if a HubL timer is pending', async () => {
      const hublDoc = makeDocument('html-hubl');
      const jsDoc = makeDocument('javascript');
      const col = makeCollection();

      // Queue up a HubL validation
      triggerValidate(hublDoc as any, col as any);

      // Immediately call with a non-HubL document
      triggerValidate(jsDoc as any, col as any);

      // The clearTimeout on the second call cancels the HubL timer,
      // then clearValidation is called immediately for the JS doc
      expect(col.set).toHaveBeenCalledTimes(1);
      expect(col.set).toHaveBeenCalledWith(jsDoc.uri, undefined);

      // Advancing the timer should not produce a second call
      await vi.advanceTimersByTimeAsync(1000);
      expect(col.set).toHaveBeenCalledTimes(1);
    });
  });
});
