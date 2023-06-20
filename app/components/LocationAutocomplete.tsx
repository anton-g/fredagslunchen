import { useAsyncList } from "@react-stately/data"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useDebounce } from "~/hooks/useDebounce"
import type { LocationSuggestion } from "~/services/locationiq.server"
import { ComboBox, Item, Label } from "./ComboBox"

export const LocationAutocomplete = ({
  label,
  onSelect,
  origin,
}: {
  label: string
  onSelect: (location: LocationSuggestion) => void
  origin?: {
    lat: number
    lng: number
  }
}) => {
  const [inputValue, setInputValue] = useState("")
  const debouncedInputValue = useDebounce(inputValue, 350)

  const { items, setFilterText } = useAsyncList<LocationSuggestion>({
    load: async ({ signal, filterText }) => {
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

  useEffect(() => {
    setFilterText(debouncedInputValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue])

  const handleSelect = async (key: React.Key) => {
    if (!key) return

    const location = items.find((x) => x.externalId === key)

    if (!location) return

    onSelect(location)
  }

  return (
    <ComboBox
      label={label}
      items={items}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSelectionChange={handleSelect}
      allowsCustomValue={false}
      hideButton
    >
      {(item) => (
        <Item textValue={item.name} key={item.externalId}>
          <div>
            <Label>{item.name}</Label>
            <Subtitle>
              {item.address}, {item.city}
            </Subtitle>
          </div>
        </Item>
      )}
    </ComboBox>
  )
}

const Subtitle = styled.span`
  opacity: 0.5;
`
