import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './AddressMap.css';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

interface POI {
  id: number;
  name: string;
  category: string;
  subText?: string;
  coordinates: [number, number]; // [lng, lat]
  evaluate: number;
  place: string;
  number: string;
}

// Mocks de estabelecimentos baseados em São Carlos / SP
const INITIAL_POIS: POI[] = [
  {
    id: 1,
    name: 'Tabajara Grill',
    category: 'Restaurante',
    coordinates: [-47.892, -22.0175],
    evaluate: 4.8,
    place: 'Alameda das Azaléias',
    number: '142'
  },
  {
    id: 2,
    name: 'Carrefour Bairro',
    category: 'Supermercado',
    subText: 'Carlos - Vila C...',
    coordinates: [-47.8865, -22.0195],
    evaluate: 4.5,
    place: 'Rua Eugênio de Andrade',
    number: '500'
  },
  {
    id: 3,
    name: 'Droga Raia',
    category: 'Farmacia',
    coordinates: [-47.895, -22.0145],
    evaluate: 4.7,
    place: 'Av. São Carlos',
    number: '1200'
  },
  {
    id: 4,
    name: 'Farmácia São Carlos',
    category: 'Farmacia',
    coordinates: [-47.8885, -22.022],
    evaluate: 4.2,
    place: 'Av. Salgado Filho',
    number: '85'
  },
  {
    id: 5,
    name: 'Pizzaria Bella Italia',
    category: 'Pizzaria',
    coordinates: [-47.8935, -22.021],
    evaluate: 4.9,
    place: 'R. dos Jasmins',
    number: '310'
  },
  {
    id: 6,
    name: 'Lanchonete Central',
    category: 'Lanchonete',
    coordinates: [-47.89, -22.013],
    evaluate: 4.1,
    place: 'Rua Lions Club',
    number: '44'
  }
];

// Helper para gerar o GeoJSON do Círculo de Raio
const createGeoJSONCircle = (center: [number, number], radiusInKm: number, points = 64) => {
  const [lng, lat] = center;
  const ret: [number, number][] = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([lng + x, lat + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ret]
    },
    properties: {}
  };
};

const AddressMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Estados
  const [centerPos, setCenterPos] = useState<[number, number]>([-47.8908, -22.0174]); // Padrão: São Carlos / SP
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pois, setPois] = useState<POI[]>(INITIAL_POIS);
  const [clickedPoi, setClickedPoi] = useState<POI | null>(null);
  const [showRadiusMenu, setShowRadiusMenu] = useState<boolean>(false);

  // Estados de Localização
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(true);
  const [isSettingManualLocation, setIsSettingManualLocation] = useState<boolean>(false);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);

  // Inicializar o Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: centerPos,
      zoom: 15.5, // Zoom maior para exibir melhor as ruas e nomes
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Fonte da Rota (GeoJSON) - Inicialmente vazia
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] }
        }
      });

      // Camada para desenhar a linha da Rota
      map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6', // Azul para destacar a rota
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      // Camada do Raio (GeoJSON)
      map.addSource('radius-circle-source', {
        type: 'geojson',
        data: createGeoJSONCircle(centerPos, radiusKm)
      });

      map.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle-source',
        paint: {
          'fill-color': '#6343F2',
          'fill-opacity': 0.12
        }
      });

      map.addLayer({
        id: 'radius-circle-outline',
        type: 'line',
        source: 'radius-circle-source',
        paint: {
          'line-color': '#6343F2',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      // Marcador do Usuário
      const userDotEl = document.createElement('div');
      userDotEl.className = 'user-location-marker';
      userMarkerRef.current = new maplibregl.Marker({ element: userDotEl })
        .setLngLat(centerPos)
        .addTo(map);
    });

    // Evento de Clique no Mapa
    map.on('click', (e) => {
      // Se o usuário está no modo de definir local manual
      if (isSettingManualLocation) {
        const { lng, lat } = e.lngLat;
        setCenterPos([lng, lat]);
        setIsSettingManualLocation(false); // Sair do modo manual após clicar

        // Focar no novo ponto
        map.flyTo({ center: [lng, lat], zoom: 15.5 });
        return;
      }

      // Senão, o fluxo normal é criar um marcador customizado (como já existia)
      const { lng, lat } = e.lngLat;
      const newId = Date.now();
      const newPoi: POI = {
        id: newId,
        name: `Ponto Marcado`,
        category: 'Outros',
        coordinates: [lng, lat],
        evaluate: 5.0,
        place: `Lat: ${lat.toFixed(4)}`,
        number: `Lng: ${lng.toFixed(4)}`
      };

      setPois((prev) => [...prev, newPoi]);
      setClickedPoi(newPoi);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Atualizar Raio e Centro no Mapa quando mudam
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Atualizar posição do marcador de usuário
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(centerPos);
    }

    const updateRadiusLayer = () => {
      const source = map.getSource('radius-circle-source') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(createGeoJSONCircle(centerPos, radiusKm));
      }
    };

    if (map.isStyleLoaded()) {
      updateRadiusLayer();
    } else {
      map.once('load', updateRadiusLayer);
    }
  }, [centerPos, radiusKm]);

  // Atualizar Marcadores (POIs) e limpar rota ao fechar o card
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Se o modal foi fechado, limpa a rota da tela
    if (!clickedPoi && map.isStyleLoaded()) {
      const routeSource = map.getSource('route-source') as maplibregl.GeoJSONSource;
      if (routeSource) {
        routeSource.setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] }
        });
      }
    }

    // Limpar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filtrar POIs por categoria e busca
    const filteredPois = pois.filter((poi) => {
      const matchCategory =
        selectedCategory === 'Todos' ||
        poi.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        searchQuery.trim() === '' ||
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });

    // Renderizar novos marcadores
    filteredPois.forEach((poi) => {
      const el = document.createElement('div');
      el.className = `custom-map-marker category-${poi.category.toLowerCase()}`;

      let iconSvg = '';
      if (poi.category === 'Restaurante' || poi.category === 'Lanchonete' || poi.category === 'Pizzaria') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`;
      } else if (poi.category === 'Farmacia') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.5 20.5 19 12a2.12 2.12 0 0 0-3-3l-8.5 8.5a2.12 2.12 0 0 0 3 3z"></path><path d="m15 7 2 2"></path></svg>`;
      } else if (poi.category === 'Supermercado') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="3"></circle></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      }

      el.innerHTML = `
        <div class="marker-pin">
          <div class="marker-icon">${iconSvg}</div>
          <span class="marker-title">${poi.name}</span>
        </div>
      `;

      el.addEventListener('click', (evt) => {
        evt.stopPropagation();
        setClickedPoi(poi);
        map.flyTo({ center: poi.coordinates, zoom: 15.5 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(poi.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [pois, selectedCategory, searchQuery, clickedPoi]);

  // Tratamento da Rota pela API OSRM
  const handleDrawRoute = async () => {
    if (!clickedPoi || !mapRef.current) return;
    setIsRouteLoading(true);

    const [userLng, userLat] = centerPos;
    const [poiLng, poiLat] = clickedPoi.coordinates;
    const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${poiLng},${poiLat}?geometries=geojson`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeGeoJSON = data.routes[0].geometry;

        // Atualizar o mapa com a nova linha da rota
        const routeSource = mapRef.current.getSource('route-source') as maplibregl.GeoJSONSource;
        if (routeSource) {
          routeSource.setData({
            type: 'Feature',
            properties: {},
            geometry: routeGeoJSON
          });
        }

        // Fazer a câmera focar na rota completa
        const coordinates: [number, number][] = routeGeoJSON.coordinates;
        const bounds = coordinates.reduce((b, coord) => {
          return b.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      }
    } catch (error) {
      console.error("Erro ao buscar rota OSRM:", error);
      alert("Não foi possível traçar a rota neste momento.");
    } finally {
      setIsRouteLoading(false);
    }
  };

  // Funções de Localização
  const handleAutoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: [number, number] = [position.coords.longitude, position.coords.latitude];
          setCenterPos(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo({ center: newPos, zoom: 16 });
          }
          setShowLocationPrompt(false);
        },
        () => {
          alert("Não foi possível obter sua localização. Defina manualmente.");
          setIsSettingManualLocation(true);
          setShowLocationPrompt(false);
        }
      );
    } else {
      alert("Navegador não suporta geolocalização.");
      setIsSettingManualLocation(true);
      setShowLocationPrompt(false);
    }
  };

  const handleManualLocation = () => {
    setIsSettingManualLocation(true);
    setShowLocationPrompt(false);
  };

  return (
    <div id="address-map-container">
      {/* Container do Mapa Libre */}
      <div ref={mapContainerRef} className={`maplibre-wrapper ${isSettingManualLocation ? 'cursor-crosshair' : ''}`} />

      {/* Modal / Prompt de Localização Inicial */}
      {showLocationPrompt && (
        <div className="location-prompt-overlay">
          <div className="location-prompt-modal">
            <h3>Definir Meu Local</h3>
            <p>Para buscar serviços próximos, precisamos saber onde você está. Como deseja configurar?</p>
            <div className="location-buttons">
              <button className="btn-auto" onClick={handleAutoLocation}>
                📍 Usar Localização Atual (Automático)
              </button>
              <button className="btn-manual" onClick={handleManualLocation}>
                👆 Escolher no Mapa (Manual)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner flutuante avisando sobre o modo manual */}
      {isSettingManualLocation && (
        <div className="manual-location-banner">
          Toque em qualquer lugar do mapa para definir sua localização.
        </div>
      )}

      {/* Header com Busca e Seletor de Raio */}
      <div className="search-header">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className="radius-badge-container">
          <button className="radius-badge" onClick={() => setShowRadiusMenu(!showRadiusMenu)}>
            🎯 {radiusKm} KM
          </button>
          {showRadiusMenu && (
            <div className="radius-menu">
              <span className="radius-menu-title">Raio de Busca</span>
              {[1, 3, 5, 10].map((r) => (
                <button
                  key={r}
                  className={`radius-option ${radiusKm === r ? 'active' : ''}`}
                  onClick={() => {
                    setRadiusKm(r);
                    setShowRadiusMenu(false);
                  }}
                >
                  {r} KM {r === 5 ? '(Padrão)' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botão de Centralizar (Me ache) */}
      <button
        className="recenter-button"
        onClick={() => mapRef.current?.flyTo({ center: centerPos, zoom: 15.5 })}
        title="Centralizar Mapa"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
        </svg>
      </button>

      {/* Botão para invocar o prompt novamente caso o usuário queira trocar */}
      {!showLocationPrompt && !isSettingManualLocation && (
        <button
          className="change-location-btn"
          onClick={() => setShowLocationPrompt(true)}
          title="Alterar Minha Localização"
        >
          📍 Alterar Meu Local
        </button>
      )}

      {/* Modal do POI (Estabelecimento Selecionado) */}
      {clickedPoi && (
        <div className="poi-detail-card">
          <div className="poi-detail-header">
            <h3>{clickedPoi.name}</h3>
            <button className="close-card-btn" onClick={() => setClickedPoi(null)}>✕</button>
          </div>
          <p className="poi-category-badge">{clickedPoi.category}</p>
          <p className="poi-address">📍 {clickedPoi.place}, {clickedPoi.number}</p>
          <div className="poi-rating">⭐ <strong>{clickedPoi.evaluate.toFixed(1)}</strong> / 5.0</div>

          <div className="poi-actions-row">
            <button className="draw-route-btn" onClick={handleDrawRoute} disabled={isRouteLoading}>
              {isRouteLoading ? 'Traçando...' : '🛣️ Traçar Caminho'}
            </button>
            <button className="set-center-btn" onClick={() => {
              setCenterPos(clickedPoi.coordinates);
              if (mapRef.current) mapRef.current.flyTo({ center: clickedPoi.coordinates, zoom: 15.5 });
              setClickedPoi(null);
            }}>
              Fixar Raio Aqui
            </button>
          </div>
        </div>
      )}

      {/* Categorias */}
      <div className="footer-categories">
        <button className={`category-button ${selectedCategory === 'Todos' ? 'active' : ''}`} onClick={() => setSelectedCategory('Todos')}>
          Todos
        </button>
        <button className={`category-button ${selectedCategory === 'Restaurante' ? 'active' : ''}`} onClick={() => setSelectedCategory('Restaurante')}>
          🍽️ Restaurante
        </button>
        <button className={`category-button ${selectedCategory === 'Farmacia' ? 'active' : ''}`} onClick={() => setSelectedCategory('Farmacia')}>
          💊 Farmácia
        </button>
        <button className={`category-button ${selectedCategory === 'Supermercado' ? 'active' : ''}`} onClick={() => setSelectedCategory('Supermercado')}>
          🛒 Supermercado
        </button>
      </div>
    </div>
  );
};

export default AddressMap;
