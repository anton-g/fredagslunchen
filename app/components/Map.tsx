import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

export const Map = () => {
  const map = useRef<mapboxgl.Map>();
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-70.9, 42.35],
      zoom: 9,
    });
  });

  return <div style={{ width: 500, height: 500 }} ref={mapContainer}></div>;
};
