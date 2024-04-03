import {
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  it,
  expect,
} from "bun:test";
import { chromium, type Browser, type Page } from "playwright";
import diff from "./index";
import { join } from "node:path";

const transpiler = new Bun.Transpiler({ loader: "ts", target: "browser" });
const diffCode = await transpiler.transform(
  (await Bun.file(join(import.meta.dir, "index.ts")).text()).replace(
    "export default",
    "",
  ),
);
const normalize = (t: string) =>
  t.replace(/\s*\n\s*/g, "").replaceAll("'", '"');

describe("Diffing Algorithm Test", () => {
  let browser: Browser;
  let page: Page;

  async function testDiff({
    oldHTMLString,
    newHTMLStringChunks,
  }: {
    oldHTMLString: string;
    newHTMLStringChunks: string[];
  }): Promise<[string, any[]]> {
    await page.setContent(normalize(oldHTMLString));
    const mutations = await page.evaluate(
      async ([diffCode, newHTMLStringChunks]) => {
        eval(diffCode as string);
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          start: (controller) => {
            for (const chunk of newHTMLStringChunks) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          },
        });
        const allMutations: any[] = [];
        const reader = readable.getReader();
        const observer = new MutationObserver((mutations) => {
          allMutations.push(
            ...mutations.map((mutation) => ({
              type: mutation.type,
              addedNodes: Array.from(mutation.addedNodes).map((node) => ({
                nodeName: node.nodeName,
                nodeValue: node.nodeValue,
              })),
              removedNodes: Array.from(mutation.removedNodes).map((node) => ({
                nodeName: node.nodeName,
                nodeValue: node.nodeValue,
              })),
              attributeName: mutation.attributeName,
              tagName: (mutation.target as Element).tagName,
              outerHTML: (mutation.target as Element).outerHTML,
              oldValue: mutation.oldValue,
            })),
          );
        });

        observer.observe(document.documentElement, {
          childList: true,
          attributes: true,
          subtree: true,
          attributeOldValue: true,
          characterData: true,
          characterDataOldValue: true,
        });

        await diff(document.documentElement!, reader);

        observer.disconnect();

        return allMutations;
      },
      [diffCode, newHTMLStringChunks],
    );

    return [
      (await page.content()).replace(/\s*\n\s*/g, "").replaceAll("'", '"'),
      mutations,
    ];
  }

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should replace only the body content", async () => {
    const [newHTML, mutations] = await testDiff({
      oldHTMLString: `
        <html>
          <head></head>
          <body>
            <div>hello world</div>
          </body>
        </html>
      `,
      newHTMLStringChunks: ["something else"],
    });
    expect(newHTML).toBe(
      normalize(`
      <html>
        <head></head>
        <body>
          something else
        </body>
      </html>
    `),
    );
    expect(mutations).toEqual([
      {
        addedNodes: [
          {
            nodeName: "#text",
            nodeValue: "something else",
          },
        ],
        attributeName: null,
        oldValue: null,
        outerHTML: "<body>something else</body>",
        removedNodes: [
          {
            nodeName: "DIV",
            nodeValue: null,
          },
        ],
        tagName: "BODY",
        type: "childList",
      },
    ]);
  });

  it("should update only one element of the body", async () => {
    const [newHTML, mutations] = await testDiff({
      oldHTMLString: `
        <html>
          <head></head>
          <body>
            <h1>TEST</h1>
            <div id="test">Old Node Content</div>
          </body>
        </html>
      `,
      newHTMLStringChunks: [
        "<h1>TEST</h1>",
        '<div id="test">',
        "New Node Content",
        "</div>",
      ],
    });
    expect(newHTML).toBe(
      normalize(`
      <html>
        <head></head>
        <body>
          <h1>TEST</h1>
          <div id="test">New Node Content</div>
        </body>
      </html>
    `),
    );
    expect(mutations).toEqual([
      {
        addedNodes: [],
        attributeName: null,
        oldValue: "Old Node Content",
        outerHTML: undefined,
        removedNodes: [],
        tagName: undefined,
        type: "characterData",
      },
    ]);
  });
});
