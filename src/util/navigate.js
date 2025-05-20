import {useState, useEffect} from 'react';
import axios from 'axios';
import {pem as polyline} from "node-forge";

const DIRECTIONS_API_KEY = process.env.GOOGLE_DIRECTIONS_API_KEY;

export function useDirections(origin, destination) {
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(origin, destination);
        // origin/destination이 모두 있어야 실행
        if (!origin || !destination) return;

        setLoading(true);
        setError(null);

        axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin:      `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                key:         DIRECTIONS_API_KEY,
            }
        })
            .then(res => {
                const encoded = res.data.routes?.[0]?.overview_polyline?.points;
                if (!encoded) throw new Error('경로를 찾을 수 없습니다');
                const coords = polyline.decode(encoded).map(([lat, lng]) => [lng, lat]);
                setRouteGeoJSON({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: coords },
                    properties: {}
                });
            })
            .catch(err => {
                console.error(err);
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [origin, destination]);

    return { routeGeoJSON, loading, error };
}