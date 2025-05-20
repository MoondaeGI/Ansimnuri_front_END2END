import './css/Map.css';
import { NoteList } from "../../../component";
import { useNoteStore } from "../../../store";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import axios from 'axios';
import { Map as MapGL, Marker, Popup } from 'react-map-gl/mapbox';
import * as mapboxgl from 'mapbox-gl';
import { SearchBox } from '@mapbox/search-js-react';


export const Map = () => {
    const { setNoteList, connect } = useNoteStore()

    useEffect(() => {
        axios.get('http://localhost:80/api/note')
            .then(resp => {
                setNoteList(resp.data)
            })
    }, [])

    useEffect(() => {
        const reConnect = setInterval(() => {
            connect()
        }, 1000)

        return clearInterval(reConnect)
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
        const [showLights, setShowLights] = useState(false);
        const [viewState, setViewState] = useState({
            ...SEOUL_CENTER,
            zoom: 11,
            pitch: 0,
            bearing: 0
        });

        const toGeoJSON = items => ({
            type: 'FeatureCollection',
            features: items.map(p => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [p.latitude, p.longitude]
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

        // 검색박스 선택
        const handleSearchSelect = useCallback(({ result }) => {
            if (!result?.geometry) return;
            const [lon, lat] = result.geometry.coordinates;
            setViewState({ longitude: lon, latitude: lat, zoom: 14, pitch: 45, bearing: 0 });
        }, []);

        const onMapLoad = useCallback((e) => {
            const map = mapRef.current?.getMap();
            if (!map || map.getLayer('3d-buildings')) return;

            map.addControl(new MapboxLanguage({
                defaultLanguage: 'ko',
                supportedLanguages: ['ko', 'ko-Hang', 'ko-KR']
            }));

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

            // 눈 효과 적용 (한 번만 호출)
            // map.on('style.load', () => {
            //   map.setRain({
            //     density: ['interpolate', ['linear'], ['zoom'], 11, 0, 13, 0.7],
            //     intensity: 1.0,
            //     color: '#ffffff',
            //     'flake-size': 1.2,
            //     opacity: 0.9,
            //     vignette: ['interpolate', ['linear'], ['zoom'], 11, 0, 13, 0.4]
            //   });
            // });
            // // 초기 스타일에도 바로 눈 내리기
            // map.setRain({
            //   density: 0.7,
            //   intensity: 1.0,
            //   color: '#ffffff',
            //   'flake-size': 1.2,
            //   opacity: 0.9,
            //   vignette: 0.4
            // });

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

            map.on('style.load', () => {
                //map.setConfigProperty('basemap', 'lightPreset', 'dawn');  // 일출
                // map.setConfigProperty('basemap', 'lightPreset', 'day');   // 낮
                // map.setConfigProperty('basemap', 'lightPreset', 'dusk');  // 일몰
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

        const toggleView = useCallback(() => {
            setViewState(prev => constrainView({
                ...prev,
                pitch: prev.pitch > 0 ? 0 : 60,
                zoom: prev.pitch > 0 ? 11 : 16,
                ...SEOUL_CENTER
            }));
        }, []);


        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {mapRef.current?.getMap() && (
                    <SearchBox
                        accessToken={MAPBOX_TOKEN}
                        map={mapRef.current.getMap()}
                        mapboxgl={mapboxgl}
                        marker={true}
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
                    <NoteList />
                </MapGL>
                <button
                    onClick={toggleView}
                    style={{
                        position: 'absolute', top: 95, right: 10, zIndex: 1,
                        padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #ddd',
                        borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer', fontSize: '14px'
                    }}>
                    {viewState.pitch > 0 ? '2D 보기' : '3D 보기'}
                </button>
                <button
                    onClick={() => setShowLights(v => !v)}
                    style={{
                        position: 'absolute', top: 45, right: 10, zIndex: 1,
                        padding: '8px 12px', background: '#fff', border: '1px solid #ddd',
                        cursor: 'pointer'
                    }}
                >
                    {showLights ? '지구대 숨기기' : '지구대 보기'}
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
                        fontSize: '16px'
                    }}
                >GPS
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