import type { LoaderFunction, V2_MetaFunction } from "@remix-run/node"

export const mergeMeta = <
  Loader extends LoaderFunction | unknown = unknown,
  ParentsLoaders extends Record<string, LoaderFunction> = Record<string, LoaderFunction>
>(
  leafMetaFn: V2_MetaFunction<Loader, ParentsLoaders>
): V2_MetaFunction<Loader, ParentsLoaders> => {
  return (arg) => {
    let leafMeta = leafMetaFn(arg)

    return arg.matches.reduceRight((acc, match) => {
      for (let parentMeta of match.meta) {
        // This can't be the way to do it..
        let index = acc.findIndex(
          (meta) =>
            ("name" in meta && "name" in parentMeta && meta.name === parentMeta.name) ||
            ("property" in meta && "property" in parentMeta && meta.property === parentMeta.property) ||
            ("title" in meta && "title" in parentMeta) ||
            ("twitter:title" in meta && "twitter:title" in parentMeta) ||
            ("twitter:card" in meta && "twitter:card" in parentMeta) ||
            ("twitter:description" in meta && "twitter:description" in parentMeta) ||
            ("og:title" in meta && "og:title" in parentMeta) ||
            ("og:image" in meta && "og:image" in parentMeta) ||
            ("og:description" in meta && "og:description" in parentMeta)
        )
        if (index == -1) {
          // Parent meta not found in acc, so add it
          acc.push(parentMeta)
        }
      }
      return acc
    }, leafMeta)
  }
}
