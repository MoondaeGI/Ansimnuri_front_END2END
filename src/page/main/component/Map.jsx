import { Note } from "../../../component";
import {useNoteStore} from "../../../store/useNoteStore";
import React, { useState, useCallback, useRef, useEffect } from 'react';
//import MapGL from 'react-map-gl';
import { Map as MapGL } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { SearchBox } from '@mapbox/search-js-react';
import axios from 'axios';

export const Map = () => {
  const [noteList, setNoteList] =
      useNoteStore(state => [state.noteList, state.setNoteList]);
  
  useEffect(() => {
    axios.get("http://localhost/api/note")
      .then(res => {
        setNoteList(res.data.map(dto => <Note dto={dto} />));
      });
  }, []);

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
    const mapRef = useRef(null);
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
      features: items.map(i => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(i.경도), parseFloat(i.위도)]
        },
        properties: { id: i.관리번호 }
      }))
    });

    // 지도 이동 범위 제한 함수
    const constrainView = (viewState) => {
      const constrained = { ...viewState };
      
      if (constrained.longitude < SEOUL_BOUNDS.minLng) {
        constrained.longitude = SEOUL_BOUNDS.minLng;
      } else if (constrained.longitude > SEOUL_BOUNDS.maxLng) {
        constrained.longitude = SEOUL_BOUNDS.maxLng;
      }
      
      if (constrained.latitude < SEOUL_BOUNDS.minLat) {
        constrained.latitude = SEOUL_BOUNDS.minLat;
      } else if (constrained.latitude > SEOUL_BOUNDS.maxLat) {
        constrained.latitude = SEOUL_BOUNDS.maxLat;
      }
      
      if (constrained.zoom < 10) constrained.zoom = 10;
      if (constrained.zoom > 18) constrained.zoom = 18;
      
      return constrained;
    };

    const calculatePitch = useCallback((zoom) => {
      const minZoom = 11;
      const maxZoom = 16;
      const maxPitch = 60;

      if (zoom <= minZoom) return 0;
      if (zoom >= maxZoom) return maxPitch;
      return ((zoom - minZoom) / (maxZoom - minZoom)) * maxPitch;
    }, []);

    const handleMove = useCallback((evt) => {
      const { zoom } = evt.viewState;
      const newPitch = calculatePitch(zoom);
      
      const constrainedView = constrainView({
        ...evt.viewState,
        pitch: newPitch
      });
      
      setViewState(constrainedView);
    }, [calculatePitch]);

    const handleSearchSelect = useCallback(({ result }) => {
      if (!result?.geometry) return;
      const [lon, lat] = result.geometry.coordinates;
      setViewState(vs => ({
        ...vs,
        longitude: lon,
        latitude: lat,
        zoom: 14,
        pitch: 45
      }));
    }, []);

    const onMapLoad = useCallback((e) => {
      const map = mapRef.current?.getMap();
      if (!map || map.getLayer('3d-buildings')) return;
      
      map.addControl(new MapboxLanguage({ defaultLanguage: 'ko', supportedLanguages: ['ko','en'] }));

      map.addSource('streetlights', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      
      map.addLayer({
        id: 'streetlight-layer',
        type: 'circle',
        source: 'streetlights',
        layout: { visibility: showLights ? 'visible' : 'none' },
        paint: { 'circle-radius': 6, 'circle-color': '#FFD700' }
      });

      // 3D 건물 레이어
      if (map.getSource('composite')) {
        map.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['has', 'height'],
          'type': 'fill-extrusion',
          'minzoom': 12,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6
          }
        });
      }

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
      const layers = map.getStyle().layers;
      layers.forEach(layer => {
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
      if (map && map.getSource('streetlights')) {
        map.getSource('streetlights').setData(toGeoJSON(streetlights));
      }
    }, [streetlights]);
    
    useEffect(() => {
      const map = mapRef.current?.getMap();
      if (map && map.getLayer('streetlight-layer')) {
        map.setLayoutProperty(
          'streetlight-layer',
          'visibility',
          showLights ? 'visible' : 'none'
        );
      }
    }, [showLights]);

    const toggleView = useCallback(() => {
      setViewState(prev => constrainView({
        ...prev,
        pitch: prev.pitch > 0 ? 0 : 60,
        zoom: prev.pitch > 0 ? 11 : 16,
        ...SEOUL_CENTER
      }));
    }, []);

    return (
      <div style={{ position: 'relative', width: '100%', height: '600px' }}>
        {mapRef.current?.getMap() && (
          <SearchBox
            accessToken={MAPBOX_TOKEN}
            map={mapRef.current.getMap()}
            onSelect={handleSearchSelect}
            options={{
              language: 'ko',
              country: 'kr',
              bbox: [SEOUL_BOUNDS.minLng, SEOUL_BOUNDS.minLat, SEOUL_BOUNDS.maxLng, SEOUL_BOUNDS.maxLat]
            }}
            placeholder="장소 검색..."
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
        />
        
        <button 
          onClick={toggleView}
          style={{
            position: 'absolute', top: 50, right: 10, zIndex: 1,
            padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #ddd',
            borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333'
          }}>
          {viewState.pitch > 0 ? '2D 보기' : '3D 보기'}
        </button>

        <button
          onClick={() => setShowLights(v => !v)}
          style={{
            position: 'absolute', top: 100, right: 10, zIndex: 1,
            padding: '8px', background: '#fff', border: '1px solid #ddd'
          }}
        >
          {showLights ? '지구대 숨기기' : '지구대 보기(미구현)'}
        </button>
      </div>
    );
  };

  return (
    <div>
      <SeoulMap3D />
      <div style={{ margin: '20px auto', maxWidth: '800px' }}>
        {noteList}
      </div>
    </div>
  );
};