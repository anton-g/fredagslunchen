import * as turf from "@turf/turf"

export type LocationSuggestion = {
  name: string
  lon: string
  lat: string
  address: string
  city: string
  zipCode: string
  externalId: string
  osmId: string
  countryCode: string
}

type AutocompleteOptions = {
  lat: number
  lng: number
}
export async function autocomplete(
  input: string,
  options?: AutocompleteOptions
): Promise<LocationSuggestion[]> {
  if (!ENV.LOCATIONIQ_API_KEY) throw "Missing LocationIQ API key"

  let viewbox = ""
  if (options) {
    const p = turf.point([options.lat, options.lng])
    const buffer = turf.buffer(p, 5, { units: "kilometers" })
    const [minX, minY, maxX, maxY] = turf.bbox(buffer)
    // const poly = turf.bboxPolygon(bbox)
    viewbox = `&max_lon=${maxY}&max_lat=${maxX}&min_lon=${minY}&min_lat=${minX}`
  }

  const tag = `tag=amenity:bar,amenity:biergarten,amenity:cafe,amenity:fast_food,amenity:food_court,amenity:ice_cream,amenity:pub,amenity:restaurant`

  const result = await fetch(
    `https://api.locationiq.com/v1/autocomplete?key=${ENV.LOCATIONIQ_API_KEY}&${tag}&accept-language=sv&q=${input}${viewbox}`
  ).then((x) => x.json())

  if (!result || result.error) {
    console.log(result.error)
    throw "Something went wrong.."
  }

  return result.map((x: any) => ({
    osmId: x.osm_id,
    name: x.display_place,
    lon: x.lon,
    lat: x.lat,
    address: `${x.address.road || ""} ${x.address.house_number ? " " + x.address.house_number : ""}`.trim(),
    city: x.address.city,
    zipCode: x.address.postcode,
    externalId: x.place_id,
    countryCode: x.address.country_code,
  }))
}
