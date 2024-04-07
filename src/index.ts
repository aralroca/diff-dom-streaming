/**
 * This file contains a diffing algorithm that is used to update the DOM
 * inspired by the set-dom library https://github.com/DylanPiercey/set-dom
 * but using streaming.
 */
type Walker = {
  rootNode: Node | null;
  firstChild: (node: Node) => Promise<Node | null>;
  nextSibling: (node: Node) => Promise<Node | null>;
};

type Callback = (node: Node) => void;

const ELEMENT_TYPE = 1;
const DOCUMENT_TYPE = 9;
const DOCUMENT_FRAGMENT_TYPE = 11;
const IS_LAST_CHUNK = "i-l-c";
const decoder = new TextDecoder();
const wait = () => new Promise((resolve) => requestAnimationFrame(resolve));

export default async function diff(
  oldNode: Node,
  reader: ReadableStreamDefaultReader,
  callback?: Callback,
) {
  const walker = await htmlStreamWalker(reader, callback);
  const newNode = walker.rootNode!;

  if (oldNode.nodeType === DOCUMENT_TYPE) {
    oldNode = (oldNode as Document).documentElement;
  }

  if (newNode.nodeType === DOCUMENT_FRAGMENT_TYPE) {
    await setChildNodes(oldNode, newNode, walker);
  } else {
    await updateNode(oldNode, newNode, walker);
  }
}

/**
 * Updates a specific htmlNode and does whatever it takes to convert it to another one.
 */
async function updateNode(oldNode: Node, newNode: Node, walker: Walker) {
  if (oldNode.nodeType !== newNode.nodeType) {
    return oldNode.parentNode!.replaceChild(newNode.cloneNode(true), oldNode);
  }

  if (oldNode.nodeType === ELEMENT_TYPE) {
    await setChildNodes(oldNode, newNode, walker);

    if (oldNode.nodeName === newNode.nodeName) {
      setAttributes(
        (oldNode as Element).attributes,
        (newNode as Element).attributes,
      );
    } else {
      const clonedNewNode = newNode.cloneNode(true);
      while (oldNode.firstChild) clonedNewNode.appendChild(oldNode.firstChild);
      oldNode.parentNode!.replaceChild(clonedNewNode, oldNode);
    }
  } else if (oldNode.nodeValue !== newNode.nodeValue) {
    oldNode.nodeValue = newNode.nodeValue;
  }
}

/**
 * Utility that will update one list of attributes to match another.
 */
function setAttributes(
  oldAttributes: NamedNodeMap,
  newAttributes: NamedNodeMap,
) {
  let i, oldAttribute, newAttribute, namespace, name;

  // Remove old attributes.
  for (i = oldAttributes.length; i--; ) {
    oldAttribute = oldAttributes[i];
    namespace = oldAttribute.namespaceURI;
    name = oldAttribute.localName;
    newAttribute = newAttributes.getNamedItemNS(namespace, name);

    if (!newAttribute) oldAttributes.removeNamedItemNS(namespace, name);
  }

  // Set new attributes.
  for (i = newAttributes.length; i--; ) {
    oldAttribute = newAttributes[i];
    namespace = oldAttribute.namespaceURI;
    name = oldAttribute.localName;
    newAttribute = oldAttributes.getNamedItemNS(namespace, name);

    if (!newAttribute) {
      // Add a new attribute.
      newAttributes.removeNamedItemNS(namespace, name);
      oldAttributes.setNamedItemNS(oldAttribute);
    } else if (newAttribute.value !== oldAttribute.value) {
      // Update existing attribute.
      newAttribute.value = oldAttribute.value;
    }
  }
}

/**
 * Utility that will nodes childern to match another nodes children.
 */
async function setChildNodes(oldParent: Node, newParent: Node, walker: Walker) {
  let checkOld;
  let oldKey;
  let newKey;
  let foundNode;
  let keyedNodes: Record<string, Node> | null = null;
  let oldNode = oldParent.firstChild;
  let newNode = await walker.firstChild(newParent);
  let extra = 0;

  // Extract keyed nodes from previous children and keep track of total count.
  while (oldNode) {
    extra++;
    checkOld = oldNode;
    oldKey = getKey(checkOld);
    oldNode = oldNode.nextSibling;

    if (oldKey) {
      if (!keyedNodes) keyedNodes = {};
      keyedNodes[oldKey] = checkOld;
    }
  }

  oldNode = oldParent.firstChild;

  // Loop over new nodes and perform updates.
  while (newNode) {
    let insertedNode;
    extra--;

    if (
      keyedNodes &&
      (newKey = getKey(newNode)) &&
      (foundNode = keyedNodes[newKey])
    ) {
      delete keyedNodes[newKey];
      if (foundNode !== oldNode) {
        oldParent.insertBefore(foundNode, oldNode);
      } else {
        oldNode = oldNode.nextSibling;
      }

      await updateNode(foundNode, newNode, walker);
    } else if (oldNode) {
      checkOld = oldNode;
      oldNode = oldNode.nextSibling;
      if (getKey(checkOld)) {
        insertedNode = newNode.cloneNode(true);
        oldParent.insertBefore(insertedNode, checkOld);
      } else {
        await updateNode(checkOld, newNode, walker);
      }
    } else {
      const clonedNewNode = newNode.cloneNode(true);
      oldParent.appendChild(clonedNewNode);
    }

    if (insertedNode?.nodeType === ELEMENT_TYPE) {
      const lastChunk = (newNode as Element).querySelector(
        `[${IS_LAST_CHUNK}]`,
      );

      while (lastChunk?.hasAttribute(IS_LAST_CHUNK)) await wait();
      if (lastChunk) await updateNode(insertedNode, newNode, walker);
    }

    newNode = (await walker.nextSibling(newNode)) as ChildNode;
  }

  // Remove old keyed nodes.
  for (oldKey in keyedNodes) {
    extra--;
    oldParent.removeChild(keyedNodes![oldKey]!);
  }

  // If we have any remaining unkeyed nodes remove them from the end.
  while (--extra >= 0) oldParent.removeChild(oldParent.lastChild!);
}

function getKey(node: Node) {
  return (node as Element)?.getAttribute?.("key") || (node as Element).id;
}

async function htmlStreamWalker(
  streamReader: ReadableStreamDefaultReader,
  callback: (node: Node) => void = () => {},
): Promise<Walker> {
  const doc = document.implementation.createHTMLDocument();
  let lastNodeAdded: Element | null = null;

  const observer = new MutationObserver((mutationList) => {
    const el = mutationList[mutationList.length - 1].addedNodes[0] as Element;
    if (lastNodeAdded) lastNodeAdded.removeAttribute(IS_LAST_CHUNK);
    lastNodeAdded =
      (el?.nodeType === 1
        ? el
        : el?.previousElementSibling || el?.parentElement) || null;
    if (!lastNodeAdded) return;
    lastNodeAdded.setAttribute(IS_LAST_CHUNK, "t");
  });

  observer.observe(doc, { childList: true, subtree: true });
  doc.open();
  streamReader.read().then(processChunk);

  function processChunk({ done, value }: any) {
    if (done) {
      doc.close();
      if (lastNodeAdded) lastNodeAdded.removeAttribute(IS_LAST_CHUNK);
      observer.disconnect();
      return;
    }

    doc.write(decoder.decode(value));
    streamReader.read().then(processChunk);
  }

  while (!doc.documentElement) await wait();

  const rootNode = doc.documentElement;

  function next(field: "firstChild" | "nextSibling") {
    return async (node: Node) => {
      if (!node) return null;

      let nextNode = node[field];

      if (nextNode) callback(nextNode);

      while ((nextNode as Element)?.hasAttribute?.(IS_LAST_CHUNK)) {
        lastNodeAdded = nextNode as Element;
        await wait();
      }

      return nextNode;
    };
  }

  return {
    rootNode,
    firstChild: next("firstChild"),
    nextSibling: next("nextSibling"),
  };
}
