/**
 * Walks the DOM upward from `start`, following each element's React fiber chain,
 * and returns the first appId found in any component's memoizedProps.
 *
 * Steam's library rows don't expose the appId as a DOM attribute, but the React fiber
 * chain carries it in several shapes depending on which component renders the row.
 */
export function findAppId(start: Element | null): number | null {
    for (let el: Element | null = start; el; el = el.parentElement) {
        const fiberKey = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
        if (!fiberKey) continue;

        for (let fiber: any = (el as any)[fiberKey]; fiber; fiber = fiber.return) {
            const props = fiber.memoizedProps;
            if (!props || typeof props !== "object") continue;

            if (typeof props.appid === "number")                            return props.appid;
            if (typeof props.appId === "number")                            return props.appId;
            if (props.overview && typeof props.overview.appid === "number") return props.overview.appid;
            if (props.item     && typeof props.item.appid    === "number")  return props.item.appid;
        }
    }

    return null;
}
