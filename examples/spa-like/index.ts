import path from "node:path";

const encoder = new TextEncoder();
const names: Record<string, string> = {
  "/foo": "Foo",
  "/bar": "Bar",
};

const server = Bun.serve({
  port: 1234,
  fetch(req: Request) {
    let suspensePromise;
    const url = new URL(req.url);
    const name = names[url.pathname] ?? "Hello, World";

    if (url.pathname === "/code") {
      return new Response(Bun.file(path.join(import.meta.dir, "code.js")));
    }

    if (url.pathname === "/style.css") {
      return new Response(Bun.file(path.join(import.meta.dir, "style.css")));
    }

    return new Response(
      new ReadableStream({
        async start(controller) {
          controller.enqueue(
            encoder.encode(`
          <html>
            <head>
              <title>SPA-like navigation with Diff DOM Streaming</title>
              <link rel="stylesheet" href="style.css">
            </head>
            <body>
              <nav>
                <a href="/">Home</a>
                <a href="/foo">Foo</a>
                <a href="/bar">Bar</a>
              </nav>
              <h1>${name}!</h1>
            `),
          );

          // Add "Suspense" placeholder
          controller.enqueue(
            encoder.encode('<div id="suspense">Loading...</div>'),
          );

          // Expensive chunk:
          suspensePromise = Bun.sleep(2000).then(handleExpensiveChunk);

          // "Unsuspense" code
          function handleExpensiveChunk() {
            controller.enqueue(
              encoder.encode(`
            <template id="suspensed-content"><div>Expensive content</div></template>
            `),
            );
            controller.enqueue(
              encoder.encode(`
              <script>
                async function unsuspense() {
                  if (window.lastDiffTransition) await window.lastDiffTransition.finished;
                  const suspensedElement = document.getElementById('suspense');
                  const ususpensedTemplate = document.getElementById('suspensed-content');

                  if (suspensedElement && ususpensedTemplate) {
                   document.startViewTransition(() => {             
                      suspensedElement.replaceWith(ususpensedTemplate.content.cloneNode(true));
                      ususpensedTemplate.remove();
                  });
                  }
                }
                unsuspense();
              </script>
            `),
            );
          }
          controller.enqueue(
            encoder.encode(`
              <counter-component></counter-component>
              <script>console.log('${name}')</script>
              <script src="/code"></script>
          `),
          );

          await suspensePromise;
          controller.close();
        },
      }),
    );
  },
});

console.log(`Done! http://${server.hostname}:${server.port}`);
