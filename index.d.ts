type Callback = (node: Node) => void;

export default function diff(
  oldNode: Node,
  reader: ReadableStreamDefaultReader,
  forEachStreamNode?: Callback,
): Promise<void>;
