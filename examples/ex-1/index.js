import diff from "https://unpkg.com/diff-dom-streaming@0.1.1/build/index.js";

async function refresh() {
  // This is a simple example. Normally the stream comes from a fetch request.
  const encoder = new TextEncoder();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const stream = new ReadableStream({
    async start(controller) {
      let epochStart = Date.now();
      controller.enqueue(encoder.encode("<!doctype html>"));
      controller.enqueue(encoder.encode("<html>"));
      controller.enqueue(encoder.encode("<head>"));
      controller.enqueue(encoder.encode("<title>Example 1</title>"));
      controller.enqueue(
        encoder.encode(
          "<style>.container { display: flex; justify-content: space-between; } .box { width: 30%; padding: 20px; border: 1px solid #000; margin: 10px; }</style>",
        ),
      );
      controller.enqueue(
        encoder.encode(
          '<script crossorigin="anonymous" src="/ex-1/index.js" type="module"></script>',
        ),
      );
      controller.enqueue(encoder.encode("</head>"));
      controller.enqueue(encoder.encode("<body>"));
      controller.enqueue(encoder.encode('<div class="container">'));
      controller.enqueue(encoder.encode('<div class="box">'));
      controller.enqueue(encoder.encode("<h1>Box 1</h1>"));
      controller.enqueue(
        encoder.encode(`<p>${Date.now() - epochStart} milliseconds</p>`),
      );
      controller.enqueue(
        encoder.encode(`<p>Random number: ${Math.random()}</p>`),
      );
      controller.enqueue(encoder.encode("</div>"));
      await wait(500);
      controller.enqueue(encoder.encode('<div class="box">'));
      controller.enqueue(encoder.encode("<h1>Box 2</h1>"));
      controller.enqueue(
        encoder.encode(`<p>${Date.now() - epochStart} milliseconds</p>`),
      );
      controller.enqueue(
        encoder.encode(`<p>Random number: ${Math.random()}</p>`),
      );
      controller.enqueue(encoder.encode("</div>"));
      await wait(500);
      controller.enqueue(encoder.encode('<div class="box">'));
      controller.enqueue(encoder.encode("<h1>Box 3</h1>"));
      controller.enqueue(
        encoder.encode(`<p>${Date.now() - epochStart} milliseconds</p>`),
      );
      controller.enqueue(
        encoder.encode(`<p>Random number: ${Math.random()}</p>`),
      );
      controller.enqueue(encoder.encode("</div>"));
      controller.enqueue(encoder.encode("</div>"));
      controller.enqueue(
        encoder.encode('<button onclick="refresh">Refresh</button>'),
      );
      controller.enqueue(
        encoder.encode('<a href="/">Come back to examples</a>'),
      );
      controller.enqueue(encoder.encode("</body>"));
      controller.enqueue(encoder.encode("</html>"));
      controller.close();
    },
  });
  await diff(document, stream.getReader());
}

document.querySelector("button").addEventListener("click", refresh);
