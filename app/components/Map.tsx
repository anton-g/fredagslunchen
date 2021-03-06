import { Link } from "@remix-run/react";
import { useState } from "react";
import MapPrimitive, { Layer, Popup, Source } from "react-map-gl";
import styled from "styled-components";
import { formatNumber } from "~/utils";
import { Spacer } from "./Spacer";
import { Stat } from "./Stat";

type Location = {
  id: number;
  lon: string;
  lat: string;
  name: string;
  address: string;
  lunchCount: number;
  averageScore: number;
  highestScore?: number;
  lowestScore?: number;
};

type MapProps = {
  locations: Location[];
};

// TODO disable maps by default in dev?
// TODO make generic with popup as render prop child?
export const Map = ({ locations }: MapProps) => {
  const [cursor, setCursor] = useState<"auto" | "pointer">("auto");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const geojson = {
    type: "FeatureCollection" as const,
    features: locations.map((loc) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [parseFloat(loc.lon), parseFloat(loc.lat)],
      },
      properties: {
        ...loc,
        averageScore: formatNumber(loc.averageScore),
        highestScore: loc.highestScore
          ? formatNumber(loc.highestScore)
          : undefined,
        lowestScore: loc.lowestScore
          ? formatNumber(loc.lowestScore)
          : undefined,
      },
    })),
  };

  return (
    <MapPrimitive
      reuseMaps
      initialViewState={{
        longitude: 18.055201,
        latitude: 59.333761,
        zoom: 11,
      }}
      style={{ width: "100%", height: 400 }}
      mapStyle="mapbox://styles/mapbox/light-v10"
      interactiveLayerIds={["places"]}
      onClick={(e) => {
        if (!e.features?.length) return;
        setSelectedLocation(e.features[0].properties as Location);
      }}
      onMouseEnter={() => setCursor("pointer")}
      onMouseLeave={() => setCursor("auto")}
      cursor={cursor}
    >
      <Source id="my-data" type="geojson" data={geojson}>
        <Layer
          id="places"
          type="circle"
          paint={{
            "circle-radius": 10,
            "circle-color": "black",
          }}
        />
        <Layer
          id="scores"
          type="symbol"
          layout={{
            "text-field": ["get", "averageScore"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0],
            "text-anchor": "center",
            "text-size": 12,
          }}
          paint={{
            "text-color": "white",
          }}
        />
      </Source>
      {selectedLocation && (
        <StyledPopup
          latitude={parseFloat(selectedLocation.lat)}
          longitude={parseFloat(selectedLocation.lon)}
          onClose={() => setSelectedLocation(null)}
          closeButton={false}
          maxWidth={"450px"}
          offset={8}
        >
          <LocationPopupContent location={selectedLocation} />
        </StyledPopup>
      )}
    </MapPrimitive>
  );
};

const StyledPopup = styled(Popup)`
  &.mapboxgl-popup-anchor-top .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip {
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
  &.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip {
    border-top-color: ${({ theme }) => theme.colors.primary};
  }
  &.mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
    border-right-color: ${({ theme }) => theme.colors.primary};
  }
  &.mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
    border-left-color: ${({ theme }) => theme.colors.primary};
  }

  .mapboxgl-popup-content {
    border: 2px solid black;
    border-radius: 4px;
  }
`;

const LocationPopupContent = ({ location }: { location: Location }) => {
  return (
    <div>
      <Link to={`/locations/${location.id}`}>
        <LocationTitle>{location.name}</LocationTitle>
      </Link>
      {location.address}
      <Spacer size={4} />
      <Stats>
        <Stat size="small" label="Lunches" value={location.lunchCount} />
        <Stat
          size="small"
          label="Average score"
          value={location.averageScore}
        />
        {location.highestScore && (
          <Stat
            size="small"
            label="Highest score"
            value={location.highestScore}
          />
        )}
        {location.lowestScore && (
          <Stat
            size="small"
            label="Lowest score"
            value={location.lowestScore}
          />
        )}
      </Stats>
    </div>
  );
};

const LocationTitle = styled.h4`
  margin: 0;
  font-size: 24px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  width: 100%;
`;
