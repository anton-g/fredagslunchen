import { useAsyncList } from "@react-stately/data"
import type { ExternalLocation, LocationSuggestion } from "~/services/google.server"
import { ComboBox, Item, Label } from "./ComboBox"

export const LocationAutocomplete = ({
  label,
  onSelect,
  origin,
}: {
  label: string
  onSelect: (location: ExternalLocation) => void
  origin?: {
    lat: number
    lng: number
  }
}) => {
  const list = useAsyncList<LocationSuggestion>({
    async load({ signal, filterText }) {
      const searchParams = new URLSearchParams({
        query: filterText || "",
      })
      if (origin) {
        searchParams.append("lat", origin.lat.toString())
        searchParams.append("lng", origin.lng.toString())
      }

      const res = await fetch(`/api/location-search?${searchParams.toString()}`, { signal })
      const json = await res.json()

      return {
        items: json,
      }
    },
  })

  const handleSelect = async (key: React.Key) => {
    if (!key) return

    const res = await fetch(`/api/location-details?id=${key}`)
    const json = (await res.json()) as ExternalLocation

    onSelect(json)
  }

  return (
    <ComboBox
      label={label}
      items={list.items}
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      onSelectionChange={handleSelect}
      allowsCustomValue={false}
      hideButton
    >
      {(item) => (
        <Item textValue={item.name} key={item.externalId}>
          <div>
            <Label>{item.name}</Label>
          </div>
        </Item>
      )}
    </ComboBox>
  )
}
