import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './AddressMap.css';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

// Interface para os POIs (locais de interesse)
interface POI {
  id: number | string;
  name: string;
  category: string;
  subText?: string;
  coordinates: [number, number]; // [lng, lat]
  evaluate: number;
  place: string;
  number?: string;
  phone?: string;
  opening_hours?: string;
}

// Categorias mapeadas para termos amigáveis e tags OSM amplas (incluindo nodes, ways e relations)
const CATEGORY_TAGS: Record<string, string> = {
  Restaurante: '["amenity"~"restaurant|fast_food|cafe|bar|pub|pizzeria|food_court"]',
  Farmacia: '["amenity"="pharmacy"]',
  Supermercado: '["shop"~"supermarket|convenience|bakery|grocery|department_store|general|deli|pastry|butcher"]',
  Servicos: '["shop"~"car_repair|car_parts|laundry|hairdresser|beauty|clothes|shoes|optician|hardware|dry_cleaning|stationery|electronics"]',
  Publico: '["amenity"~"hospital|clinic|police|post_office|townhall|bank|atm|school|kindergarten|community_centre|courthouse|fire_station|public_building"]'
};

// Helper para normalizar o tipo/categoria baseado nas tags OSM
const categorizeOSMTags = (tags: Record<string, string>): string => {
  if (tags.amenity === 'pharmacy') return 'Farmacia';
  if (['restaurant', 'fast_food', 'cafe', 'bar', 'pub', 'food_court', 'ice_cream'].includes(tags.amenity)) return 'Restaurante';
  if (['supermarket', 'convenience', 'bakery', 'grocery', 'department_store', 'deli', 'butcher'].includes(tags.shop)) return 'Supermercado';
  if (['car_repair', 'car_parts', 'laundry', 'hairdresser', 'beauty', 'clothes', 'hardware'].includes(tags.shop) || tags.craft) return 'Servicos';
  if (['hospital', 'clinic', 'police', 'post_office', 'townhall', 'bank', 'school'].includes(tags.amenity)) return 'Publico';
  return 'Comercio';
};

// Helper para gerar o GeoJSON do Círculo de Raio
const createGeoJSONCircle = (center: [number, number], radiusInKm: number | null, points = 64) => {
  if (!radiusInKm || radiusInKm <= 0) {
    return {
      type: 'Feature' as const,
      geometry: { type: 'Polygon' as const, coordinates: [] },
      properties: {}
    };
  }

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
  const [radiusKm, setRadiusKm] = useState<number | null>(3); // null = Sem limite de raio (Livre)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pois, setPois] = useState<POI[]>([]);
  const [loadingPois, setLoadingPois] = useState<boolean>(false);
  const [clickedPoi, setClickedPoi] = useState<POI | null>(null);
  const [showRadiusMenu, setShowRadiusMenu] = useState<boolean>(false);

  // Estados de Localização
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(true);
  const [isSettingManualLocation, setIsSettingManualLocation] = useState<boolean>(false);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);

  // Buscar POIs via Overpass API com suporte a bbox da visão atual ou raio
  const fetchPOIs = async () => {
    if (!mapRef.current) return;
    setLoadingPois(true);

    const map = mapRef.current;
    let locationClause = '';

    if (radiusKm && radiusKm > 0) {
      const [lng, lat] = centerPos;
      const radiusMeters = Math.min(radiusKm * 1000, 10000);
      locationClause = `(around:${radiusMeters},${lat},${lng})`;
    } else {
      const bounds = map.getBounds();
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();
      locationClause = `(${south},${west},${north},${east})`;
    }

    let filterClause = '';
    if (selectedCategory !== 'Todos' && CATEGORY_TAGS[selectedCategory]) {
      const tagQuery = CATEGORY_TAGS[selectedCategory];
      filterClause = `
        node${locationClause}${tagQuery}["name"];
        way${locationClause}${tagQuery}["name"];
        relation${locationClause}${tagQuery}["name"];
      `;
    } else {
      filterClause = `
        node${locationClause}["amenity"~"restaurant|fast_food|cafe|pharmacy|hospital|clinic|police|bank|post_office|school|supermarket|pub|bar|pizzeria"]["name"];
        node${locationClause}["shop"]["name"];
        way${locationClause}["amenity"~"restaurant|fast_food|cafe|pharmacy|hospital|clinic|police|bank|post_office|school|supermarket|pub|bar|pizzeria"]["name"];
        way${locationClause}["shop"]["name"];
        way${locationClause}["building"="supermarket"]["name"];
        relation${locationClause}["shop"]["name"];
      `;
    }

    const overpassQuery = `
      [out:json][timeout:20];
      (
        ${filterClause}
      );
      out center 80;
    `;

    try {
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ];

      let data: any = null;
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(`${endpoint}?data=${encodeURIComponent(overpassQuery)}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (e) {
          // tentar proximo endpoint
        }
      }

      if (data && data.elements) {
        const parsedPois: POI[] = data.elements
          .filter((el: any) => el.tags && el.tags.name)
          .map((el: any) => {
            const coord: [number, number] = [
              el.lon ?? el.center?.lon,
              el.lat ?? el.center?.lat
            ];
            const tags = el.tags || {};
            const street = tags['addr:street'] || tags['addr:place'] || 'Endereço próximo';
            const houseNumber = tags['addr:housenumber'] || '';

            return {
              id: el.id,
              name: tags.name,
              category: categorizeOSMTags(tags),
              coordinates: coord,
              evaluate: Number((4.2 + (Math.abs(Number(el.id)) % 8) * 0.1).toFixed(1)),
              place: street,
              number: houseNumber,
              phone: tags.phone || tags['contact:phone'],
              opening_hours: tags.opening_hours
            };
          });

        setPois(parsedPois);
      }
    } catch (err) {
      console.error("Erro ao carregar POIs:", err);
    } finally {
      setLoadingPois(false);
    }
  };

  // Busca textual direta para estabelecimentos específicos (ex: "Savegnago", "Jaú Serve", "Poupatempo")
  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;

    setLoadingPois(true);
    try {
      const [lng, lat] = centerPos;
      // Busca via Nominatim do OpenStreetMap próximo da região
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&viewbox=${lng - 0.2},${lat + 0.2},${lng + 0.2},${lat - 0.2}&bounded=0&addressdetails=1&limit=10`;

      const res = await fetch(nominatimUrl, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
      });
      const results = await res.json();

      if (results && results.length > 0) {
        const foundPois: POI[] = results.map((r: any) => {
          const coord: [number, number] = [parseFloat(r.lon), parseFloat(r.lat)];
          const addr = r.address || {};
          const street = addr.road || addr.suburb || addr.city || r.display_name.split(',')[0];
          const houseNumber = addr.house_number || '';

          return {
            id: `nom-${r.place_id}`,
            name: r.name || r.display_name.split(',')[0],
            category: r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : 'Local',
            coordinates: coord,
            evaluate: 4.8,
            place: street,
            number: houseNumber
          };
        });

        setPois((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = foundPois.filter((p) => !existingIds.has(p.id));
          return [...newItems, ...prev];
        });

        // Focar no primeiro resultado encontrado
        const first = foundPois[0];
        if (mapRef.current) {
          mapRef.current.flyTo({ center: first.coordinates, zoom: 16 });
        }
        setClickedPoi(first);
      }
    } catch (err) {
      console.error("Erro na busca por texto:", err);
    } finally {
      setLoadingPois(false);
    }
  };

  // Carregar POIs ao mudar o centro, raio ou categoria
  useEffect(() => {
    fetchPOIs();
  }, [centerPos, radiusKm, selectedCategory]);

  // Inicializar o Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: centerPos,
      zoom: 15.5,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Fonte da Rota (GeoJSON)
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
          'line-color': '#3b82f6',
          'line-width': 6,
          'line-opacity': 0.85
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
          'fill-opacity': 0.1
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

    // Evento de Clique no Mapa (Captura tanto modo manual quanto features/pontos do mapa vetorial)
    map.on('click', (e) => {
      // Se o usuário está no modo de definir local manual
      if (isSettingManualLocation) {
        const { lng, lat } = e.lngLat;
        setCenterPos([lng, lat]);
        setIsSettingManualLocation(false);
        map.flyTo({ center: [lng, lat], zoom: 15.5 });
        return;
      }

      // Tentar capturar clique em elementos vetoriais do próprio OpenFreeMap (POI, building, labels)
      const features = map.queryRenderedFeatures(e.point);
      const namedFeature = features.find(
        (f) => f.properties && (f.properties.name || f.properties.name_en || f.properties.name_pt)
      );

      if (namedFeature && namedFeature.properties) {
        const props = namedFeature.properties;
        const name = props.name || props.name_pt || props.name_en;
        const category = props.class || props.subclass || props.category || 'Local';
        const [lng, lat] = [e.lngLat.lng, e.lngLat.lat];

        const poi: POI = {
          id: `osm-${Date.now()}`,
          name: name,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          coordinates: [lng, lat],
          evaluate: 4.5,
          place: props.street || `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          number: props.housenumber || ''
        };

        setClickedPoi(poi);
        map.flyTo({ center: [lng, lat], zoom: 16 });
        return;
      }

      // Se clicou em um ponto sem nome no mapa
      const { lng, lat } = e.lngLat;
      const genericPoi: POI = {
        id: `custom-${Date.now()}`,
        name: `Ponto Marcado`,
        category: 'Ponto no Mapa',
        coordinates: [lng, lat],
        evaluate: 5.0,
        place: `Lat: ${lat.toFixed(4)}`,
        number: `Lng: ${lng.toFixed(4)}`
      };

      setClickedPoi(genericPoi);
    });

    // Mudar cursor para ponteiro quando passar o mouse sobre locais com nome
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const hasNamed = features.some((f) => f.properties && (f.properties.name || f.properties.name_en));
      map.getCanvas().style.cursor = hasNamed ? 'pointer' : '';
    });

    // Quando mover o mapa no modo "Sem Raio", recarrega os POIs da nova área visível
    map.on('moveend', () => {
      if (radiusKm === null) {
        fetchPOIs();
      }
    });

    return () => {
      map.remove();
    };
  }, [radiusKm]);

  // Atualizar Raio e Centro no Mapa quando mudam
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

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

  // Renderizar Marcadores dos POIs no Mapa
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

    // Filtrar POIs por busca
    const filteredPois = pois.filter((poi) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        poi.name.toLowerCase().includes(q) ||
        poi.category.toLowerCase().includes(q) ||
        poi.place.toLowerCase().includes(q)
      );
    });

    // Renderizar novos marcadores no mapa
    filteredPois.forEach((poi) => {
      const el = document.createElement('div');
      el.className = `custom-map-marker category-${poi.category.toLowerCase()}`;

      let iconSvg = '';
      if (['Restaurante', 'Lanchonete', 'Pizzaria'].includes(poi.category)) {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`;
      } else if (poi.category === 'Farmacia') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.5 20.5 19 12a2.12 2.12 0 0 0-3-3l-8.5 8.5a2.12 2.12 0 0 0 3 3z"></path><path d="m15 7 2 2"></path></svg>`;
      } else if (poi.category === 'Supermercado') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="3"></circle></svg>`;
      } else if (poi.category === 'Servicos') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
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
        map.flyTo({ center: poi.coordinates, zoom: 16 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(poi.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [pois, searchQuery, clickedPoi]);

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
            placeholder="Buscar estabelecimento (ex: Savegnago, farmácia... pressione Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className="radius-badge-container">
          <button className="radius-badge" onClick={() => setShowRadiusMenu(!showRadiusMenu)}>
            🎯 {radiusKm ? `${radiusKm} KM` : 'Sem Raio'}
          </button>
          {showRadiusMenu && (
            <div className="radius-menu">
              <span className="radius-menu-title">Raio de Busca</span>
              <button
                className={`radius-option ${radiusKm === null ? 'active' : ''}`}
                onClick={() => {
                  setRadiusKm(null);
                  setShowRadiusMenu(false);
                }}
              >
                🌐 Sem Raio (Livre)
              </button>
              {[1, 3, 5, 10, 15].map((r) => (
                <button
                  key={r}
                  className={`radius-option ${radiusKm === r ? 'active' : ''}`}
                  onClick={() => {
                    setRadiusKm(r);
                    setShowRadiusMenu(false);
                  }}
                >
                  {r} KM {r === 3 ? '(Padrão)' : ''}
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

      {/* Indicador de Carregamento de POIs */}
      {loadingPois && (
        <div className="poi-loading-pill">
          <span>🔄 Buscando locais próximos...</span>
        </div>
      )}

      {/* Modal do POI (Estabelecimento Selecionado) */}
      {clickedPoi && (
        <div className="poi-detail-card">
          <div className="poi-detail-header">
            <h3>{clickedPoi.name}</h3>
            <button className="close-card-btn" onClick={() => setClickedPoi(null)}>✕</button>
          </div>
          <p className="poi-category-badge">{clickedPoi.category}</p>
          <p className="poi-address">📍 {clickedPoi.place}{clickedPoi.number ? `, ${clickedPoi.number}` : ''}</p>
          {clickedPoi.phone && <p className="poi-info-extra">📞 {clickedPoi.phone}</p>}
          {clickedPoi.opening_hours && <p className="poi-info-extra">⏰ {clickedPoi.opening_hours}</p>}
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
        <button className={`category-button ${selectedCategory === 'Supermercado' ? 'active' : ''}`} onClick={() => setSelectedCategory('Supermercado')}>
          🛒 Mercados
        </button>
        <button className={`category-button ${selectedCategory === 'Farmacia' ? 'active' : ''}`} onClick={() => setSelectedCategory('Farmacia')}>
          💊 Farmácias
        </button>
        <button className={`category-button ${selectedCategory === 'Restaurante' ? 'active' : ''}`} onClick={() => setSelectedCategory('Restaurante')}>
          🍽️ Restaurantes
        </button>
        <button className={`category-button ${selectedCategory === 'Servicos' ? 'active' : ''}`} onClick={() => setSelectedCategory('Servicos')}>
          🔧 Mecânicos / Lojas
        </button>
        <button className={`category-button ${selectedCategory === 'Publico' ? 'active' : ''}`} onClick={() => setSelectedCategory('Publico')}>
          🏛️ Poupatempo / Serviços
        </button>
      </div>
    </div>
  );
};

export default AddressMap;
