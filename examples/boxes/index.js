import diff from "https://unpkg.com/diff-dom-streaming@0.6.0";

async function diffStreamReader(e) {
  e?.preventDefault();

  // This is a simple example. Normally the stream comes from a fetch request.
  const encoder = new TextEncoder();
  const ms = +document.querySelector("#ms").value ?? 0;
  const numBoxes = +document.querySelector("#box").value ?? 3;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const stream = new ReadableStream({
    async start(controller) {
      let epochStart = Date.now();
      controller.enqueue(
        encoder.encode(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Example 1</title>
          <link rel="stylesheet" href="/ex-1/styles.css">
          <script crossorigin="anonymous" src="/ex-1/index.js" type="module"></script>
        </head>
        <body>
          <header>
            <form>
              <label for="ms">Milliseconds between boxes</label>
              <input
              id="ms"
              placeholder="Milliseconds between boxes"
              value="0"
              type="number"
              />
              <label for="box">Number of boxes</label>
              <input id="box" placeholder="Number of boxes" value="3" type="number" />
              <button>Diff</button>
              <a href="/ex-1">Reload</a>
              <a href="/">Come back to examples</a>
              <a href="https://github.com/aralroca/diff-dom-streaming" target="_blank">GitHub</a>
            </form>
          </header>
          <div class="container">
        `),
      );

      // BOXES
      for (let i = 0; i < numBoxes; i++) {
        controller.enqueue(
          encoder.encode(`
          <div class="box">
            <h1>Box ${i + 1}</h1>
            <p>${Date.now() - epochStart} milliseconds</p>
            <p>Random number: ${Math.random()}</p>
          </div>
        `),
        );
        if (ms) await wait(ms);
      }

      controller.enqueue(
        encoder.encode(`
            </div>
          </body>
        </html>
      `),
      );
      controller.close();
    },
  });

  await diff(document, stream.getReader());
}

document.querySelector("form").addEventListener("submit", diffStreamReader);
