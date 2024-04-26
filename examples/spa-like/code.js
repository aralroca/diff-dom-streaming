const scripts = new Set();

function spaNavigation(event) {
  const url = new URL(event.destination.url);

  if (location.origin !== url.origin) return;

  event.intercept({
    async handler() {
      const res = await fetch(url.pathname, { signal: event.signal });

      if (res.ok) {
        const diffModule = await import(
          "https://unpkg.com/diff-dom-streaming@0.3.0"
        );
        const diff = diffModule.default;
        registerCurrentScripts();

        await diff(document, res.body.getReader(), {
          onNextNode: loadScripts,
          transition: true,
        });
      }
    },
  });
}

if ("navigation" in window) {
  window.navigation.addEventListener("navigate", spaNavigation);
}

// Counter Web Component
class CounterComponent extends HTMLElement {
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    let count = 0;

    shadowRoot.innerHTML = `
      <button id="inc">Increment</button>
      <button id="dec">Decrement</button>
      <p id="count">Count: ${count}</p>
    `;
    const countEl = shadowRoot.querySelector("#count");
    shadowRoot.querySelector("#inc").addEventListener("click", () => {
      count++;
      countEl.textContent = `Count: ${count}`;
    });
    shadowRoot.querySelector("#dec").addEventListener("click", () => {
      count--;
      countEl.textContent = `Count: ${count}`;
    });
  }
}

// Register Counter Web Component
if (!customElements.get("counter-component")) {
  customElements.define("counter-component", CounterComponent);
}

// Register current scripts
function registerCurrentScripts() {
  for (let script of document.scripts) {
    if (script.id || script.hasAttribute("src")) {
      scripts.add(script.id || script.getAttribute("src"));
    }
  }
}

// Load new scripts
function loadScripts(node) {
  if (node.nodeName !== "SCRIPT") return;

  const src = node.getAttribute("src");

  if (scripts.has(src) || scripts.has(node.id)) return;

  const script = document.createElement("script");

  if (src) script.src = src;

  script.innerHTML = node.innerHTML;

  // Remove after load the script
  script.onload = script.onerror = () => script.remove();

  document.head.appendChild(script);

  // Remove after append + execute (only for inline script)
  if (!src) script.remove();
}
