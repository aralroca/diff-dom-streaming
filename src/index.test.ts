import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from 'bun:test';
import { chromium, type Browser, type Page } from 'playwright'; 
import diff from './index';
import {join} from 'node:path';

const transpiler = new Bun.Transpiler({ loader: 'ts', target: 'browser' });
const content = await transpiler.transform((await Bun.file(join(import.meta.dir, 'index.ts')).text()).replace('export default', ''));

describe('Diffing Algorithm Test', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  })

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should update the DOM correctly', async () => {
    await page.setContent('<div id="test">Old Node</div>');
    await page.evaluate(async ([content]) => {
      eval(content)
      const encoder = new TextEncoder();
      const readable = new ReadableStream({ start: (controller) => {
        controller.enqueue(encoder.encode('<div id="test">'));
        controller.enqueue(encoder.encode('New Node Content'));
        controller.enqueue(encoder.encode("</div>"));
        controller.close();
      }});
      const reader = readable.getReader();
 
      await diff(document.getElementById('test')!, reader)
    }, [content]);

    const newNode = await page.$eval('#test', (node: Node) => node.textContent!.trim());
    expect(newNode).toBe('New Node Content');
  });
});
