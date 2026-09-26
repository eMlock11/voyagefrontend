import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './AddressMap.css';
import {
  mapService,
  CATEGORY_GROUPS,
  VOYAGE_CATEGORIES,
  getCategoryFromOSMTags
} from '../../services/mapService';
import type { POIItem } from '../../services/mapService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import {
  SlidersHorizontal,
  X,
  Check,
  Filter
} from 'lucide-react';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

const AddressMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados
  const [centerPos, setCenterPos] = useState<[number, number]>([-47.8908, -22.0174]); // Padrão: São Carlos / SP
  const [radiusKm, setRadiusKm] = useState<number | null>(() => {
    const saved = localStorage.getItem('voyage_search_radius');
    if (saved) {
      const num = Number(saved);
      if (!isNaN(num) && num > 0) return num;
    }
    return 3;
  }); // null = Sem limite de raio (Livre)
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pois, setPois] = useState<POIItem[]>([]);
  const [loadingPois, setLoadingPois] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [clickedPoi, setClickedPoi] = useState<POIItem | null>(null);
  const [showRadiusMenu, setShowRadiusMenu] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Estados de Localização
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(() => {
    // Se o usuário já ativou auto GPS nas preferências, não precisa do prompt bloqueante
    return localStorage.getItem('voyage_auto_gps') !== 'true';
  });
  const [isSettingManualLocation, setIsSettingManualLocation] = useState<boolean>(false);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);

  // Fechamento de modais e menus suspensos com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCategoryModal) {
          setShowCategoryModal(false);
        } else if (clickedPoi) {
          setClickedPoi(null);
        } else if (showRadiusMenu) {
          setShowRadiusMenu(false);
        } else if (showLocationPrompt) {
          setShowLocationPrompt(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCategoryModal, clickedPoi, showRadiusMenu, showLocationPrompt]);

  // Refs de estado para evitar closures desatualizadas nos listeners do mapa
  const isSettingManualLocationRef = useRef(isSettingManualLocation);
  isSettingManualLocationRef.current = isSettingManualLocation;

  const radiusKmRef = useRef(radiusKm);
  radiusKmRef.current = radiusKm;

  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const selectedGroupRef = useRef(selectedGroup);
  selectedGroupRef.current = selectedGroup;

  const centerPosRef = useRef(centerPos);
  centerPosRef.current = centerPos;

  const requestSeqRef = useRef(0);
  const fetchPOIsRef = useRef<(() => void) | null>(null);

  // Lista de subcategorias baseadas no grupo selecionado
  const subCategoriesOfGroup = useMemo(() => {
    if (selectedGroup === 'todos') return [];
    return VOYAGE_CATEGORIES.filter((c) => c.group === selectedGroup);
  }, [selectedGroup]);

  // Buscar POIs via mapService (com controle de concorrência e cache integrado)
  const fetchPOIs = useCallback(async (customCenter?: [number, number], customRadius?: number | null) => {
    if (!mapRef.current) return;
    const currentSeq = ++requestSeqRef.current;
    setLoadingPois(true);
    setMapError(null);

    const map = mapRef.current;
    const activeRadius = customRadius !== undefined ? customRadius : radiusKmRef.current;
    const activeCenter = customCenter || centerPosRef.current;
    let boundsParam: any = undefined;

    if (!activeRadius || activeRadius <= 0) {
      const b = map.getBounds();
      boundsParam = {
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast()
      };
    }

    try {
      const results = await mapService.getPOIs({
        center: activeCenter,
        radiusKm: activeRadius,
        bounds: boundsParam,
        category: selectedCategoryRef.current,
        group: selectedCategoryRef.current ? null : selectedGroupRef.current
      });

      if (currentSeq !== requestSeqRef.current) return;
      setPois(results);
    } catch (err: any) {
      if (currentSeq !== requestSeqRef.current) return;
      console.warn('[AddressMap] Falha ao carregar POIs:', err.message);
      setMapError('Não foi possível obter locais do mapa no momento.');
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoadingPois(false);
      }
    }
  }, []);

  fetchPOIsRef.current = fetchPOIs;

  // Busca textual direta para estabelecimentos (ex: "Savegnago", "Motel", "Oficina")
  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;

    setLoadingPois(true);
    try {
      const results = await mapService.searchByName(searchQuery, centerPos);

      if (results && results.length > 0) {
        setPois((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = results.filter((p: any) => !existingIds.has(p.id));
          return [...newItems, ...prev];
        });

        const first = results[0];
        if (mapRef.current) {
          mapRef.current.flyTo({ center: first.coordinates, zoom: 16 });
        }
        setClickedPoi(first);
      }
    } catch (err) {
      console.error('[AddressMap] Erro na busca por texto:', err);
    } finally {
      setLoadingPois(false);
    }
  };

  // Inicializar o Mapa Libre (uma única vez no ciclo de vida)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: centerPosRef.current,
      zoom: 15.5,
      attributionControl: { compact: true }
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
        data: mapService.createGeoJSONCircle(centerPosRef.current, radiusKmRef.current)
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
        .setLngLat(centerPosRef.current)
        .addTo(map);

      // Carregamento inicial explícito de POIs assim que o mapa estiver pronto
      if (fetchPOIsRef.current) {
        fetchPOIsRef.current();
      }

      // Auto GPS se configurado nas preferências
      if (localStorage.getItem('voyage_auto_gps') === 'true' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const gpsCoords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
            setCenterPos(gpsCoords);
            map.flyTo({ center: gpsCoords, zoom: 15.5 });
          },
          () => {}
        );
      }
    });

    // Evento de Clique no Mapa (sempre lê refs para evitar closure desatualizado)
    map.on('click', (e) => {
      if (isSettingManualLocationRef.current) {
        const { lng, lat } = e.lngLat;
        setCenterPos([lng, lat]);
        setIsSettingManualLocation(false);
        map.flyTo({ center: [lng, lat], zoom: 15.5 });
        return;
      }

      // Tentar capturar clique em elementos vetoriais do OpenFreeMap
      const features = map.queryRenderedFeatures(e.point);
      const namedFeature = features.find(
        (f) => f.properties && (f.properties.name || f.properties.name_en || f.properties.name_pt)
      );

      if (namedFeature && namedFeature.properties) {
        const props = namedFeature.properties;
        const name = props.name || props.name_pt || props.name_en;
        const matched = getCategoryFromOSMTags(props, selectedCategoryRef.current);
        const [lng, lat] = [e.lngLat.lng, e.lngLat.lat];

        const poi: POIItem = {
          id: `osm-${Date.now()}`,
          name: name,
          category: matched?.label || props.class || 'Local',
          categoryId: matched?.id || 'outros',
          categoryIcon: matched?.icon || '📍',
          categoryColor: matched?.color || '#6343f2',
          coordinates: [lng, lat],
          evaluate: 4.6,
          place: props.street || `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          number: props.housenumber || ''
        };

        setClickedPoi(poi);
        map.flyTo({ center: [lng, lat], zoom: 16 });
        return;
      }

      // Se clicou em um ponto sem identificador
      const { lng, lat } = e.lngLat;
      const genericPoi: POIItem = {
        id: `custom-${Date.now()}`,
        name: `Ponto Marcado`,
        category: 'Ponto no Mapa',
        categoryIcon: '📍',
        categoryColor: '#4a5568',
        coordinates: [lng, lat],
        evaluate: 5.0,
        place: `Lat: ${lat.toFixed(4)}`,
        number: `Lng: ${lng.toFixed(4)}`
      };

      setClickedPoi(genericPoi);
    });

    // Cursor pointer ao passar em itens com nome
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const hasNamed = features.some((f) => f.properties && (f.properties.name || f.properties.name_en));
      map.getCanvas().style.cursor = hasNamed ? 'pointer' : '';
    });

    // Debounce no evento de arrastar o mapa no modo "Sem Raio"
    map.on('moveend', () => {
      if (radiusKmRef.current === null) {
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = setTimeout(() => {
          if (fetchPOIsRef.current) fetchPOIsRef.current();
        }, 400); // Aguarda 400ms após soltar o mapa
      }
    });

    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      map.remove();
    };
  }, []);

  // Carregar POIs quando centro, raio, grupo ou categoria mudarem
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      fetchPOIs(centerPos, radiusKm);
    }
  }, [centerPos, radiusKm, selectedCategory, selectedGroup, fetchPOIs]);

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
        source.setData(mapService.createGeoJSONCircle(centerPos, radiusKm));
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

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const filteredPois = pois.filter((poi) => {
      // Filtrar pelo grupo ativo
      if (selectedGroup !== 'todos') {
        if (selectedCategory?.id) {
          if (poi.categoryId !== selectedCategory.id) return false;
        } else if (poi.categoryGroup && poi.categoryGroup !== selectedGroup) {
          return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        poi.name.toLowerCase().includes(q) ||
        poi.category.toLowerCase().includes(q) ||
        poi.place.toLowerCase().includes(q)
      );
    });

    filteredPois.forEach((poi) => {
      const el = document.createElement('div');
      el.className = `custom-map-marker marker-cat-${poi.categoryId || 'default'}`;

      const icon = poi.categoryIcon || '📍';
      const color = poi.categoryColor || '#6343f2';

      const pin = document.createElement('div');
      pin.className = 'marker-pin';
      pin.style.borderLeft = `3px solid ${color}`;

      const iconEl = document.createElement('div');
      iconEl.className = 'marker-icon';
      iconEl.style.backgroundColor = color;
      iconEl.textContent = icon;

      const titleEl = document.createElement('span');
      titleEl.className = 'marker-title';
      titleEl.textContent = poi.name || '';

      pin.appendChild(iconEl);
      pin.appendChild(titleEl);
      el.appendChild(pin);

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
  }, [pois, searchQuery, clickedPoi, selectedGroup, selectedCategory]);

  // Traçar rota via mapService
  const handleDrawRoute = async () => {
    if (!clickedPoi || !mapRef.current) return;
    setIsRouteLoading(true);

    try {
      const routeGeoJSON = await mapService.getRoute(centerPos, clickedPoi.coordinates);

      if (routeGeoJSON && mapRef.current) {
        const routeSource = mapRef.current.getSource('route-source') as maplibregl.GeoJSONSource;
        if (routeSource) {
          routeSource.setData({
            type: 'Feature',
            properties: {},
            geometry: routeGeoJSON
          });
        }

        const coordinates: [number, number][] = routeGeoJSON.coordinates;
        const bounds = coordinates.reduce((b, coord) => {
          return b.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      }
    } catch (error) {
      console.error('[AddressMap] Erro ao traçar rota:', error);
      alert('Não foi possível traçar a rota neste momento.');
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
          alert('Não foi possível obter sua localização. Defina manualmente.');
          setIsSettingManualLocation(true);
          setShowLocationPrompt(false);
        }
      );
    } else {
      alert('Navegador não suporta geolocalização.');
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
      {/* Sidebar de Navegação */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="mapa"
      />

      {/* Botão Hambúrguer para abrir Sidebar */}
      <button
        className="map-sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        title="Abrir Menu de Navegação"
        aria-label="Abrir Menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Container do Mapa Libre */}
      <div ref={mapContainerRef} className={`maplibre-wrapper ${isSettingManualLocation ? 'cursor-crosshair' : ''}`} />

      {/* Modal Inicial de Localização */}
      {showLocationPrompt && (
        <div className="location-prompt-overlay" role="presentation">
          <div
            className="location-prompt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-prompt-title"
          >
            <h3 id="location-prompt-title">Definir Meu Local</h3>
            <p>Para buscar serviços e estabelecimentos próximos, precisamos saber onde você está. Como deseja configurar?</p>
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

      {/* Banner flutuante modo manual */}
      {isSettingManualLocation && (
        <div className="manual-location-banner">
          Toque em qualquer lugar do mapa para definir sua localização.
        </div>
      )}

      {/* Header com Busca, Filtro de Categorias e Seletor de Raio */}
      <div className="search-header">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar motel, adega, oficina, savegnago... (Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Botão de Abrir Filtro de Categorias */}
        <button
          className={`category-filter-toggle-btn ${selectedCategory || selectedGroup !== 'todos' ? 'active' : ''}`}
          onClick={() => setShowCategoryModal(true)}
          title="Filtrar por Categoria"
        >
          <SlidersHorizontal size={15} />
          <span>
            {selectedCategory
              ? `${selectedCategory.icon} ${selectedCategory.label}`
              : selectedGroup !== 'todos'
              ? `${CATEGORY_GROUPS.find((g) => g.id === selectedGroup)?.icon || '📁'} ${CATEGORY_GROUPS.find((g) => g.id === selectedGroup)?.label || 'Filtro'}`
              : 'Categorias'}
          </span>
          {(selectedCategory || selectedGroup !== 'todos') && (
            <span
              className="filter-clear-badge"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGroup('todos');
                setSelectedCategory(null);
              }}
              title="Limpar filtro"
            >
              ✕
            </span>
          )}
        </button>

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

      {/* Modal / Drawer Elegante de Filtro por Categoria */}
      {showCategoryModal && (
        <div className="category-modal-overlay" onClick={() => setShowCategoryModal(false)} role="presentation">
          <div
            className="category-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="category-modal-header">
              <div className="category-modal-title-group">
                <div className="category-modal-icon-badge">
                  <Filter size={18} />
                </div>
                <div>
                  <h3 id="category-modal-title">Filtrar por Categoria</h3>
                  <p>Selecione um segmento para exibir no mapa</p>
                </div>
              </div>
              <button
                className="category-modal-close"
                onClick={() => setShowCategoryModal(false)}
                aria-label="Fechar filtro de categorias"
              >
                <X size={20} />
              </button>
            </div>

            {/* Abas de Grupos Principais dentro do Modal */}
            <div className="category-modal-group-tabs">
              {CATEGORY_GROUPS.map((group) => {
                return (
                  <button
                    key={group.id}
                    className={`category-modal-tab ${selectedGroup === group.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setSelectedCategory(null);
                    }}
                  >
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grade de Subcategorias */}
            <div className="category-modal-grid-content">
              {/* Opção Exibir Todos */}
              <button
                className={`category-item-card all-card ${selectedGroup === 'todos' && !selectedCategory ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedGroup('todos');
                  setSelectedCategory(null);
                  setShowCategoryModal(false);
                }}
              >
                <div className="category-item-icon" style={{ backgroundColor: '#6343F2' }}>🌟</div>
                <div className="category-item-info">
                  <strong>Todos os Comércios</strong>
                  <span>Sem filtro de categoria</span>
                </div>
                {selectedGroup === 'todos' && !selectedCategory && <Check size={18} className="check-icon" />}
              </button>

              {/* Lista das Categorias Específicas */}
              {(selectedGroup === 'todos'
                ? VOYAGE_CATEGORIES
                : VOYAGE_CATEGORIES.filter((c) => c.group === selectedGroup)
              ).map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    className={`category-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedGroup(cat.group);
                      setShowCategoryModal(false);
                    }}
                  >
                    <div className="category-item-icon" style={{ backgroundColor: cat.color || '#6343F2' }}>
                      {cat.icon}
                    </div>
                    <div className="category-item-info">
                      <strong>{cat.label}</strong>
                      <span>{CATEGORY_GROUPS.find((g) => g.id === cat.group)?.label || 'Geral'}</span>
                    </div>
                    {isSelected && <Check size={18} className="check-icon" />}
                  </button>
                );
              })}
            </div>

            {/* Rodapé do Modal */}
            <div className="category-modal-footer">
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSelectedGroup('todos');
                  setSelectedCategory(null);
                  setShowCategoryModal(false);
                }}
              >
                Limpar Filtro (Ver Todos)
              </button>
              <button
                className="btn-apply-filters"
                onClick={() => setShowCategoryModal(false)}
              >
                Aplicar e Ver no Mapa
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Botão para alterar localização */}
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
          <span>🔄 Buscando dados no OpenStreetMap...</span>
        </div>
      )}

      {/* Banner de Indisponibilidade de Provedor de Mapa */}
      {mapError && !loadingPois && (
        <div className="poi-error-banner" style={{
          position: 'absolute',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '8px 16px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fca5a5',
          fontSize: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <span>⚠️ {mapError}</span>
          <button
            type="button"
            onClick={() => fetchPOIsRef.current && fetchPOIsRef.current()}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '11px'
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Modal do POI (Estabelecimento Selecionado) */}
      {clickedPoi && (
        <div
          className="poi-detail-card"
          role="region"
          aria-label={`Detalhes de ${clickedPoi.name}`}
        >
          <div className="poi-detail-header">
            <h3>{clickedPoi.name}</h3>
            <button
              className="close-card-btn"
              onClick={() => setClickedPoi(null)}
              aria-label="Fechar detalhes do estabelecimento"
            >
              ✕
            </button>
          </div>
          <p className="poi-category-badge" style={{ color: clickedPoi.categoryColor || '#6343f2' }}>
            {clickedPoi.categoryIcon} {clickedPoi.category}
          </p>
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

      {/* Barra Inferior com Grupos Principais e Subcategorias Deslizáveis */}
      <div className="footer-category-wrapper">
        {/* Subcategorias específicas do grupo quando um grupo é ativado */}
        {subCategoriesOfGroup.length > 0 && (
          <div className="subcategory-pills">
            <button
              className={`subcat-pill ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos do grupo
            </button>
            {subCategoriesOfGroup.map((sub) => (
              <button
                key={sub.id}
                className={`subcat-pill ${selectedCategory?.id === sub.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(sub)}
              >
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Grupos Principais do Voyage */}
        <div className="footer-categories">
          {CATEGORY_GROUPS.map((g) => (
            <button
              key={g.id}
              className={`category-button ${selectedGroup === g.id && selectedCategory === null ? 'active' : ''}`}
              onClick={() => {
                setSelectedGroup(g.id);
                setSelectedCategory(null);
              }}
            >
              <span>{g.icon}</span> {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressMap;

