import type { LoaderFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import type { LocationSuggestion } from "~/services/locationiq.server"
import { autocomplete } from "~/services/locationiq.server"
import { requireUserId } from "~/auth.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireUserId(request)

  const url = new URL(request.url)
  const query = url.searchParams.get("query")
  const lat = url.searchParams.get("lat")
  const lng = url.searchParams.get("lng")

  if (!query || query.length === 0) {
    return json<LocationSuggestion[]>([])
  }

  const latNumber = Number(lat)
  if (lat && isNaN(latNumber)) {
    return json<LocationSuggestion[]>([])
  }

  const lngNumber = Number(lng)
  if (lng && isNaN(lngNumber)) {
    return json<LocationSuggestion[]>([])
  }

  const options = latNumber && lngNumber ? { lat: latNumber, lng: lngNumber } : undefined

  const data = await autocomplete(query, options)

  return json<LocationSuggestion[]>(data)
}
