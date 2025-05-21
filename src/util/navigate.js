import {useState, useEffect} from 'react';
import axios from 'axios';
import {pem as polyline} from "node-forge";

export function useDirections(origin, destination) {
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // origin/destination이 모두 있어야 실행
        if (!origin || !destination) return;

        setLoading(true);
        setError(null);
        console.log(origin, destination, DIRECTIONS_API_KEY);
        axios.get('https://ansimnuri-357149454857.asia-northeast3.run.app/api/map/directions', {

            params: {
                originLat: origin.latitude,
                originLng: origin.longitude,
                destLat: destination.latitude,
                destLng: destination.longitude,
            }
        })
            .then(response => {
                console.log(response)
                if (response.data && response.data.routes && response.data.routes.length > 0) {
                    // 경로 데이터 처리
                    const route = response.data.routes[0];
                    return route;
                } else {
                    throw new Error('경로를 찾을 수 없습니다.');
                }
                /*
                const encoded = res.data.routes?.[0]?.overview_polyline?.points;
                if (!encoded) throw new Error('경로를 찾을 수 없습니다');
                const coords = polyline.decode(encoded).map(([lat, lng]) => [lng, lat]);
                setRouteGeoJSON({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: coords },
                    properties: {}
                });

                 */
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