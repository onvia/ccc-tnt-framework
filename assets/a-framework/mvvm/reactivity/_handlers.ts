import { baseHandlers } from "./_baseHandlers";
import { Raw, RawType } from "./_internals";

const handlers = new Map([
    [RawType.COMMON,baseHandlers],
]);

/** 获取Proxy的handlers */
export function getHandlers(type: RawType) {
  return handlers.get(type);
}
