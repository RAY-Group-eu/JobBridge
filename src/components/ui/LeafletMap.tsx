"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// Fix for default marker icon in Leaflet with Next.js
import L from "leaflet";

// Dark Matter tiles from CartoDB
const DARK_TILES_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DARK_TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface LeafletMapProps {
    center: [number, number];
    zoom?: number;
    className?: string;
}

// Component to handle map resizing and updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
        map.invalidateSize();
    }, [map, center]);
    return null;
}

export default function LeafletMap({ center, zoom = 13, className }: LeafletMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className={`bg-[#121217] flex items-center justify-center ${className}`}>
                <div className="flex flex-col items-center text-slate-500 animate-pulse">
                    <MapPin size={24} className="mb-2 opacity-50" />
                    <span className="text-xs uppercase tracking-widest">Karte wird geladen...</span>
                </div>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            className={`z-0 ${className}`}
            style={{ height: "100%", width: "100%", background: "#121217" }}
            dragging={false} // Static feel as per "screenshot" look, but interactive enough if user wants
            zoomControl={false} // Cleaner look
            doubleClickZoom={false}
        >
            <style jsx global>{`
                .leaflet-control-attribution {
                    background: rgba(0, 0, 0, 0.4) !important;
                    color: #52525b !important; /* zinc-600 */
                    font-size: 10px;
                    border-radius: 4px;
                    padding: 0 4px;
                }
                .leaflet-control-attribution a {
                    color: #71717a !important; /* zinc-500 */
                    text-decoration: none;
                }
            `}</style>
            <TileLayer
                attribution={DARK_TILES_ATTRIBUTION}
                url={DARK_TILES_URL}
            />
            {/* Using a Circle to indicate approximate location comfortably */}
            <Circle
                center={center}
                pathOptions={{
                    fillColor: '#6366f1', // Indigo-500
                    fillOpacity: 0.2,
                    color: '#6366f1',
                    weight: 1,
                    opacity: 0.5
                }}
                radius={800} // 800 meters radius for "approximate" location
            />
            {/* Center visual dot */}
            <Circle
                center={center}
                pathOptions={{
                    fillColor: '#818cf8', // Indigo-400
                    fillOpacity: 1,
                    color: '#fff',
                    weight: 2,
                    opacity: 0.8
                }}
                radius={50}
            />
            <MapUpdater center={center} />
        </MapContainer>
    );
}
