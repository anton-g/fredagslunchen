import { AddressType, Client, PlaceAutocompleteType, Status } from "@googlemaps/google-maps-services-js"
import { findLocation } from "~/models/location.server"

const client = new Client({})

export type LocationSuggestion = {
  name: string
  extra: string
  externalId: string
}

type AutocompleteOptions = {
  lat: number
  lng: number
}

export async function autocomplete(
  input: string,
  options?: AutocompleteOptions
): Promise<LocationSuggestion[]> {
  if (!ENV.GOOGLE_PLACES_API_KEY) throw "Missing Google Places API key"

  const result = await client.placeAutocomplete({
    params: {
      input,
      key: ENV.GOOGLE_PLACES_API_KEY,
      types: PlaceAutocompleteType.establishment,
      location: options
        ? {
            lat: options.lat,
            lng: options.lng,
          }
        : undefined,
      radius: 10_000,
    },
  })

  if (result.status !== 200 || result.data.status !== Status.OK) {
    throw "Something went wrong.."
  }

  return result.data.predictions.map((x) => ({
    name: x.structured_formatting.main_text,
    extra: x.structured_formatting.secondary_text,
    externalId: x.place_id,
  }))
}

export type ExternalLocation = {
  name?: string
  lon?: string
  lat?: string
  address?: string
  city?: string
  zipCode?: string
  id?: number
}

export async function details(placeId: string): Promise<ExternalLocation> {
  if (!ENV.GOOGLE_PLACES_API_KEY) throw "Missing Google Places API key"

  const details = await client.placeDetails({
    params: {
      place_id: placeId,
      key: ENV.GOOGLE_PLACES_API_KEY,
      fields: ["address_components", "name", "geometry"],
    },
  })

  const components = details.data.result.address_components

  const name = details.data.result.name
  const lon = details.data.result.geometry?.location.lng.toString()
  const lat = details.data.result.geometry?.location.lat.toString()

  const route = components?.find((x) => x.types.includes(AddressType.route))?.long_name
  const streetNumber = components?.find((x) => x.types.includes(AddressType.street_number))?.long_name
  const address = `${route} ${streetNumber}`
  const city = components?.find((x) => x.types.includes(AddressType.postal_town))?.long_name
  const zipCode = components?.find((x) => x.types.includes(AddressType.postal_code))?.long_name

  const existingLocation = await findLocation({
    address,
    city,
    lat,
    lon,
    zipCode,
  })

  return { name, lon, lat, address, city, zipCode, id: existingLocation?.id }
}
