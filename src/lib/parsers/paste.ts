import type { Parser, RawMessage } from './types';
import { parseTextLines } from './util';

export const paste: Parser = {
  id: 'paste',
  detect() {
    return false; // explicit-only; never auto-detected
  },
  parse(raw, { myUsername }): RawMessage[] {
    return parseTextLines(raw, myUsername);
  },
};
