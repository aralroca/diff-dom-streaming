export default function diff(
  oldNode: Node,
  reader: ReadableStreamDefaultReader,
  options?: Options,
): Promise<void>;

declare global {
  interface Window {
    lastDiffTransition?: ViewTransition;
  }
}

type NextNodeCallback = (node: Node) => void;

type Options = {
  onNextNode?: NextNodeCallback;
  transition?: boolean;
};
