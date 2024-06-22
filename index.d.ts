export default function diff(
  oldNode: Node,
  reader: ReadableStreamDefaultReader,
  options?: Options,
): Promise<void>;

type NextNodeCallback = (node: Node) => void;

type Options = {
  onNextNode?: NextNodeCallback;
  transition?: boolean;
  shouldIgnoreNode?: (node: Node | null) => boolean;
};
