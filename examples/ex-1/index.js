import diff from "https://unpkg.com/diff-dom-streaming@latest/build/index.js";

async function refresh() {
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
            <div><a href="/">Come back to examples</a></div>
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

document.querySelector("button").addEventListener("click", refresh);
