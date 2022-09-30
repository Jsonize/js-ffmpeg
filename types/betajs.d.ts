export type BetaJSPromise<T> = {
    toNativePromise: () => Promise<T>
}
