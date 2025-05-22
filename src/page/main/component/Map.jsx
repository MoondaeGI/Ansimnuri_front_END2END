import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import { useNoteStore } from "../../../store";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import axios from 'axios';
import { Map as MapGL, Marker, Popup } from 'react-map-gl/mapbox';
import * as mapboxgl from 'mapbox-gl';
import { SearchBox } from '@mapbox/search-js-react';
import { useDirections } from "../../../util";
import { NoteList } from "../../../component";
import { Button } from "react-bootstrap";
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import './css/Map.css';

export const Map = () => {
    const { setNoteList, connect } = useNoteStore()

    useEffect(() => {
        axios.get('http://ansimnuri.site/api/note')
            .then(resp => {
                setNoteList(resp.data)
            })
    }, [])

    useEffect(() => {
        const reConnect = setInterval(() => {
            connect()
        }, 1000)

        return () => clearInterval(reConnect)
    }, [connect])

    const SEOUL_BOUNDS = {
        minLng: 126.764,
        maxLng: 127.184,
        minLat: 37.428,
        maxLat: 37.701
    };

    const SEOUL_CENTER = {
        latitude: 37.5785,
        longitude: 126.9768
    };

    const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

    const SeoulMap3D = () => {
        const [userLocation, setUserLocation] = useState(null);
        const [searchMarker, setSearchMarker] = useState(null);
        const mapRef = useRef(null);
        const [markerPos, setMarkerPos] = useState(null);
        const [streetlights, setStreetlights] = useState([]);
        const [sexOffenders, setSexOffenders] = useState([]);
        const [cctvs, setCctvs] = useState([]);
        const [showLights, setShowLights] = useState(false);
        const [showOffenders, setShowOffenders] = useState(false);
        const [showNavigation, setShowNavigation] = useState(false);
        const directionsRef = useRef(null);
        const [viewState, setViewState] = useState({
            ...SEOUL_CENTER,
            zoom: 11,
            pitch: 0,
            bearing: 0
        });

        const { routeGeoJSON, loading, error } = useDirections(searchMarker, userLocation);

        const toGeoJSON = items => ({
            type: 'FeatureCollection',
            features: items.map(p => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [p.longitude, p.latitude]
                },
                properties: { id: p.id, name: p.name, address: p.address, type: p.type }
            }))
        });

        const handleGeolocate = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    ({ coords }) => {
                        const { latitude, longitude } = coords;
                        setUserLocation({ latitude, longitude });
                        setViewState(vs => ({ ...vs, latitude, longitude, zoom: 14 }));
                    },
                    err => {
                        alert('현재 위치를 가져올 수 없습니다.');
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                alert('GPS를 지원하지 않는 브라우저입니다.');
            }
        };

        useEffect(() => {
            axios.get("http://localhost/api/map/sexOffender")
                .then(res => {
                    setSexOffenders(res.data);
                })
        }, [])

        useEffect(() => {
            axios.get("http://localhost/api/map/cctv")
                .then(res => {
                    setCctvs(res.data);
                })
        }, []);

        useEffect(() => {
            axios.get("http://localhost/api/map/police").then((resp => {
                console.log(resp.data);
                setStreetlights(resp.data);
            }))
        }, []);

        const constrainView = vs => {
            const c = { ...vs };
            if (c.longitude < SEOUL_BOUNDS.minLng) c.longitude = SEOUL_BOUNDS.minLng;
            if (c.longitude > SEOUL_BOUNDS.maxLng) c.longitude = SEOUL_BOUNDS.maxLng;
            if (c.latitude < SEOUL_BOUNDS.minLat) c.latitude = SEOUL_BOUNDS.minLat;
            if (c.latitude > SEOUL_BOUNDS.maxLat) c.latitude = SEOUL_BOUNDS.maxLat;
            if (c.zoom < 10) c.zoom = 10;
            if (c.zoom > 18) c.zoom = 18;
            return c;
        };
        const calculatePitch = useCallback(z => {
            if (z <= 11) return 0;
            if (z >= 16) return 60;
            return ((z - 11) / (16 - 11)) * 60;
        }, []);
        const handleMove = useCallback(evt => {
            const pitch = calculatePitch(evt.viewState.zoom);
            setViewState(constrainView({ ...evt.viewState, pitch }));
        }, [calculatePitch]);

        const onMapLoad = useCallback((e) => {
            const map = mapRef.current?.getMap();
            if (!map || map.getLayer('3d-buildings')) return;
            if (!map || directionsRef.current) return;

            map.addControl(new MapboxLanguage({
                defaultLanguage: 'ko',
                supportedLanguages: ['ko', 'ko-Hang', 'ko-KR']
            }));

            if (!directionsRef.current) {
                directionsRef.current = new MapboxDirections({
                    accessToken: MAPBOX_TOKEN,
                    unit: 'metric',
                    profile: 'mapbox/driving',
                    language: 'ko',
                    placeholderOrigin: '출발지를 입력하세요',
                    placeholderDestination: '도착지를 입력하세요',
                    controls: { inputs: true, instructions: true, profileSwitcher: true },
                    flyTo: false
                });
            }

            map.on('style.load', () => {
                map.getStyle().layers.forEach(layer => {
                    if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                        map.setLayoutProperty(
                            layer.id,
                            'text-field',
                            ['coalesce', ['get', 'name_ko'], ['get', 'name']]
                        );
                    }
                });
                map.setLight({
                    anchor: 'viewport',
                    color: '#f5e0b7',
                    intensity: 0.6,
                    position: [1.15, 210, 30]  // [radial, azimuthal, polar]
                });
            });

            map.addSource('police-stations', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.addLayer({
                id: 'police-layer',
                type: 'circle',
                source: 'police-stations',
                layout: { visibility: showLights ? 'visible' : 'none' },
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#4287f5',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            map.addSource('sex-offender', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.addLayer({
                id: 'offender-layer',
                type: 'circle',
                source: 'sex-offender',
                layout: { visibility: showLights ? 'visible' : 'none' },
                paint: {
                    'circle-radius': 4,
                    'circle-color': '#645394',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            map.addSource('cctv', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.addLayer({
                id: 'cctv-layer',
                type: 'circle',
                source: 'cctv',
                layout: { visibility: showLights ? 'visible' : 'none' },
                paint: {
                    'circle-radius': 4,
                    'circle-color': '#c4c4c4',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            map.on('style.load', () => {
                map.setConfigProperty('basemap', 'lightPreset', 'night'); // 밤
            });

            // 3D 건물 레이어
            if (map.getSource('composite')) {
                map.addLayer({
                    'id': '3d-buildings', 'source': 'composite', 'source-layer': 'building',
                    'filter': ['has', 'height'], 'type': 'fill-extrusion', 'minzoom': 12,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'min_height'],
                        'fill-extrusion-opacity': 0.6
                    }
                });
            }
            // 클릭 시 팝업
            map.on('click', 'police-layer', e => {
                const f = e.features[0];
                const [lng, lat] = f.geometry.coordinates;
                const { name, address, type } = f.properties;
                new mapboxgl.Popup()
                    .setLngLat([lng, lat])
                    .setHTML(`이름 : ${name} ${type} <br/> 주소 : ${address}`)
                    .addTo(map);
            });
            // 커서 포인터
            map.on('mouseenter', 'police-layer', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'police-layer', () => map.getCanvas().style.cursor = '');

            // 지형 설정
            try {
                map.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 14
                });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.0 });
            } catch (error) {
                console.error('Terrain setup failed:', error);
            }

            setTimeout(() => {
                const style = map.getStyle();
                if (!style?.layers) return;
                style.layers.forEach(layer => {
                    if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                        map.setLayoutProperty(
                            layer.id,
                            'text-field',
                            ['coalesce', ['get', 'name_ko'], ['get', 'name']]
                        );
                    }
                });
            }, 1000);

            // 지도 이동 제한 설정
            map.setMaxBounds([
                [SEOUL_BOUNDS.minLng, SEOUL_BOUNDS.minLat],
                [SEOUL_BOUNDS.maxLng, SEOUL_BOUNDS.maxLat]
            ]);
        }, [showLights]);

        useEffect(() => {
            const map = mapRef.current?.getMap();
            if (!map || !map.getSource('police-stations')) return;
            map.getSource('police-stations').setData(toGeoJSON(streetlights));
            map.setLayoutProperty(
                'police-layer',
                'visibility',
                showLights ? 'visible' : 'none'
            );
        }, [streetlights, showLights]);

        useEffect(() => {
            const map = mapRef.current?.getMap();
            if (!map || !map.getSource('sex-offender')) return;
            map.getSource('sex-offender').setData(toGeoJSON(sexOffenders));
            map.setLayoutProperty(
                'offender-layer',
                'visibility',
                showLights ? 'visible' : 'none'
            );
        }, [sexOffenders, showLights]);

        useEffect(() => {
            const map = mapRef.current?.getMap();
            if (!map || !map.getSource('cctv')) return;
            map.getSource('cctv').setData(toGeoJSON(cctvs));
            map.setLayoutProperty(
                'cctv-layer',
                'visibility',
                showLights ? 'visible' : 'none'
            );
        }, [sexOffenders, showLights]);

        const toggleView = useCallback(() => {
            setViewState(prev => constrainView({
                ...prev,
                pitch: prev.pitch > 0 ? 0 : 60,
                zoom: prev.pitch > 0 ? 11 : 16,
                ...SEOUL_CENTER
            }));
        }, []);

        const toggleNavigation = useCallback(() => {
            const map = mapRef.current?.getMap();
            const dir = directionsRef.current;
            if (!map || !dir) return;
            const isAttached = Boolean(dir._map);
            if (!isAttached) {
                map.addControl(dir, 'top-left');
            } else {
                map.removeControl(dir);
            }
            setShowNavigation(!isAttached);
        }, []);



        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {mapRef.current?.getMap() && (
                    <SearchBox
                        accessToken={MAPBOX_TOKEN}
                        map={mapRef.current.getMap()}
                        mapboxgl={mapboxgl}
                        marker={true}
                        icon={false}
                        options={{
                            countries: ['kr'],
                            languages: ['ko'],
                            types: ['address', 'street', 'postcode', 'district', 'place', 'locality', 'neighborhood'],
                            proximity: { lng: SEOUL_CENTER.longitude, lat: SEOUL_CENTER.latitude },
                            bbox: [
                                126.764,
                                37.428,
                                127.184,
                                37.701
                            ],
                            autocomplete: true,
                            fuzzyMatch: true
                        }}
                        placeholder='주소 또는 지역명 검색'
                        onRetrieve={(result) => {
                            console.log(result);

                            const [lon, lat] = result.features[0].geometry.coordinates;

                            console.log(lon, lat)

                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const { latitude, longitude } = position.coords;
                                        setUserLocation({ latitude, longitude });
                                        setSearchMarker({
                                            longitude: lon,
                                            latitude: lat
                                        });
                                    },
                                    (error) => {
                                        console.error('GPS 위치를 가져올 수 없습니다:', error);
                                    }
                                );
                            }
                        }}
                    />
                )}
                <MapGL
                    {...viewState}
                    ref={mapRef}
                    onMove={handleMove}
                    onLoad={onMapLoad}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    transitionDuration={500}
                    minZoom={10}
                    maxZoom={18}
                >
                    {markerPos && (
                        <Marker
                            longitude={markerPos.longitude}
                            latitude={markerPos.latitude}
                            anchor="bottom"
                        >
                            <div style={{
                                width: '24px', height: '24px',
                                backgroundColor: '#e74c3c',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }} />
                        </Marker>
                    )}
                    {searchMarker && (
                        <Marker
                            longitude={searchMarker.longitude}
                            latitude={searchMarker.latitude}
                            anchor="bottom"
                        >
                            <div className="search-marker" />
                        </Marker>
                    )}
                    {userLocation && (
                        <Marker
                            longitude={userLocation.longitude}
                            latitude={userLocation.latitude}
                            anchor="bottom"
                        >
                            <div className="user-marker" />
                        </Marker>
                    )}
                </MapGL>
                <button
                    onClick={toggleView}
                    style={{
                        position: 'absolute', top: 95, right: 10, zIndex: 1,
                        padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #ddd',
                        borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'black',
                        cursor: 'pointer', fontSize: '14px'
                    }}>
                    {viewState.pitch > 0 ? '2D' : '3D'}
                </button>
                <button
                    onClick={() => setShowLights(v => !v)}
                    style={{
                        position: 'absolute', top: 50, right: 10, zIndex: 1,
                        padding: '8px 12px', background: '#fff', border: '1px solid #ddd', color: 'black',
                        cursor: 'pointer'
                    }}
                >
                    {showLights ? '지구대 숨기기' : '지구대'}
                </button>
                <button
                    className="gps-button"
                    onClick={handleGeolocate}
                    title="현재 위치 보기"
                    style={{
                        position: 'absolute',
                        top: 140,
                        right: 15,
                        zIndex: 2,
                        padding: '8px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: 'black'
                    }}
                >GPS
                </button>
                <button
                    onClick={toggleNavigation}
                    style={{
                        position: 'absolute',
                        top: 190,
                        right: 10,
                        zIndex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        color: 'black',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}>
                    {showNavigation ? '네비게이션 숨기기' : '네비게이션'}
                </button>
            </div>
        );
    };

    return (
        <div style={{ height: '100%' }}>
            <SeoulMap3D />
        </div>
    );
};