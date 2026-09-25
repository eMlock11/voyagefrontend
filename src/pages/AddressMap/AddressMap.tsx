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
import { getCommercialDetails } from '../../services/commercialCatalogService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import {
  SlidersHorizontal,
  X,
  Check,
  Sparkles,
  Layers,
  Search,
  Filter,
  Flame,
  Tag,
  Clock,
  Sparkle,
  ChevronRight,
  Info,
  Navigation,
  Compass,
  Phone,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

const AddressMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados
  const [centerPos, setCenterPos] = useState<[number, number]>([-47.8908, -22.0174]); // Padrão: São Carlos / SP
  const [radiusKm, setRadiusKm] = useState<number | null>(3); // null = Sem limite de raio (Livre)
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pois, setPois] = useState<POIItem[]>([]);
  const [loadingPois, setLoadingPois] = useState<boolean>(false);
  const [clickedPoi, setClickedPoi] = useState<POIItem | null>(null);
  const [showRadiusMenu, setShowRadiusMenu] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Estados de Localização
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(true);
  const [isSettingManualLocation, setIsSettingManualLocation] = useState<boolean>(false);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);


  // Lista de subcategorias baseadas no grupo selecionado
  const subCategoriesOfGroup = useMemo(() => {
    if (selectedGroup === 'todos') return [];
    return VOYAGE_CATEGORIES.filter((c) => c.group === selectedGroup);
  }, [selectedGroup]);

  // Buscar POIs via mapService (com cache em memória integrado)
  const fetchPOIs = useCallback(async () => {
    if (!mapRef.current) return;
    setLoadingPois(true);

    const map = mapRef.current;
    let boundsParam: any = undefined;

    if (!radiusKm || radiusKm <= 0) {
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
        center: centerPos,
        radiusKm: radiusKm,
        bounds: boundsParam,
        category: selectedCategory,
        group: selectedCategory ? null : selectedGroup
      });

      setPois(results);
    } catch (err) {
      console.error('[AddressMap] Erro ao buscar estabelecimentos:', err);
    } finally {
      setLoadingPois(false);
    }
  }, [centerPos, radiusKm, selectedCategory, selectedGroup]);

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

  // Carregar POIs ao mudar o centro, raio, grupo ou categoria
  useEffect(() => {
    fetchPOIs();
  }, [fetchPOIs]);

  // Inicializar o Mapa Libre
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
        data: mapService.createGeoJSONCircle(centerPos, radiusKm)
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

    // Evento de Clique no Mapa
    map.on('click', (e) => {
      if (isSettingManualLocation) {
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
        const matched = getCategoryFromOSMTags(props);
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
      if (radiusKm === null) {
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = setTimeout(() => {
          fetchPOIs();
        }, 400); // Aguarda 400ms após soltar o mapa
      }
    });

    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
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

      el.innerHTML = `
        <div class="marker-pin" style="border-left: 3px solid ${color};">
          <div class="marker-icon" style="background-color: ${color};">${icon}</div>
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
        <div className="location-prompt-overlay">
          <div className="location-prompt-modal">
            <h3>Definir Meu Local</h3>
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
        <div className="category-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="category-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <div className="category-modal-title-group">
                <div className="category-modal-icon-badge">
                  <Filter size={18} />
                </div>
                <div>
                  <h3>Filtrar por Categoria</h3>
                  <p>Selecione um segmento para exibir no mapa</p>
                </div>
              </div>
              <button className="category-modal-close" onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Abas de Grupos Principais dentro do Modal */}
            <div className="category-modal-group-tabs">
              {CATEGORY_GROUPS.map((group) => {
                const isGroupActive = selectedGroup === group.id && !selectedCategory;
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

      {/* Modal do POI (Estabelecimento Selecionado com Detalhes Comerciais & shadcn UI) */}
      {clickedPoi && (() => {
        const commercial = getCommercialDetails(clickedPoi);

        return (
          <div className="poi-detail-card expanded-commercial border border-border/80 shadow-2xl backdrop-blur-xl">
            {/* Header com Visual de Cartão */}
            <div className="poi-detail-header pb-2 border-b border-border/40">
              <div className="poi-title-group">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground tracking-tight">{clickedPoi.name}</h3>
                  <Badge variant="brand" className="text-[10px] px-2 py-0">
                    {clickedPoi.categoryIcon} {clickedPoi.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1 font-medium truncate max-w-[200px]">
                    📍 {clickedPoi.place}{clickedPoi.number ? `, ${clickedPoi.number}` : ''}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-md">
                    ⭐ {clickedPoi.evaluate.toFixed(1)}
                  </span>
                </div>
              </div>
              <button
                className="close-card-btn text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                onClick={() => setClickedPoi(null)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Abas de Navegação shadcn: Catálogo / Sobre */}
            <Tabs defaultValue="catalogo" className="w-full mt-2">
              <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/50 p-1">
                <TabsTrigger value="catalogo" className="text-xs">
                  {commercial?.badge ? commercial.badge.split(' ')[0] + ' Cardápio & Preços' : '🛍️ Ofertas & Preços'}
                </TabsTrigger>
                <TabsTrigger value="sobre" className="text-xs">
                  ℹ️ Detalhes & Contato
                </TabsTrigger>
              </TabsList>

              {/* ABA 1: CATÁLOGO & PREÇOS */}
              <TabsContent value="catalogo" className="m-0 pt-2">
                {commercial && (
                  <div className="poi-commercial-container bg-muted/30 border border-border/50 rounded-xl p-2.5">
                    <div className="commercial-header-tag flex justify-between items-center pb-2 mb-2 border-b border-border/40">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        {commercial.badge}
                      </span>
                      {commercial.lastUpdate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={11} /> {commercial.lastUpdate}
                        </span>
                      )}
                    </div>

                    <div className="commercial-scroll-body max-h-[190px] overflow-y-auto pr-1">
                      {/* Seções agrupadas (Ex: Bares / Pizzarias / Feirão Ratti) */}
                      {commercial.sections && commercial.sections.map((sec: any, idx: number) => (
                        <div key={idx} className="commercial-group mb-2.5">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1.5">{sec.name}</h4>
                          <div className="commercial-items-list flex flex-col gap-1.5">
                            {sec.items.map((item: any, iIdx: number) => (
                              <div key={iIdx} className="commercial-item-row flex justify-between items-start p-2 rounded-lg bg-card border border-border/40 hover:border-primary/40 transition-all">
                                <div className="commercial-item-info flex-1 pr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">{item.name}</span>
                                    {item.tag && (
                                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">
                                        {item.tag}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.desc && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>}
                                </div>
                                <div className="commercial-item-price-box flex flex-col items-end justify-center min-w-[65px]">
                                  {item.oldPrice && <span className="text-[10px] text-muted-foreground line-through">{item.oldPrice}</span>}
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.price}</span>
                                  {item.unit && <span className="text-[9px] text-muted-foreground">{item.unit}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Lista Direta (Ex: Postos de Combustível, Mercados) */}
                      {commercial.items && (
                        <div className="commercial-items-list direct flex flex-col gap-1.5">
                          {commercial.items.map((item: any, iIdx: number) => (
                            <div key={iIdx} className={`commercial-item-row flex justify-between items-start p-2 rounded-lg bg-card border border-border/40 hover:border-primary/40 transition-all ${item.highlight ? 'bg-primary/5 border-primary/30' : ''}`}>
                              <div className="commercial-item-info flex-1 pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-semibold text-foreground">{item.name}</span>
                                  {item.tag && (
                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">
                                      {item.tag}
                                    </Badge>
                                  )}
                                </div>
                                {item.desc && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>}
                              </div>
                              <div className="commercial-item-price-box flex flex-col items-end justify-center min-w-[65px]">
                                {item.oldPrice && <span className="text-[10px] text-muted-foreground line-through">{item.oldPrice}</span>}
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.price}</span>
                                {item.unit && <span className="text-[9px] text-muted-foreground">{item.unit}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ABA 2: SOBRE, HORÁRIOS & CONTATO */}
              <TabsContent value="sobre" className="m-0 pt-2">
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
                  <div className="flex items-start gap-2 text-xs text-foreground">
                    <span className="text-base">📍</span>
                    <div>
                      <strong className="block text-foreground font-semibold">Endereço</strong>
                      <span className="text-muted-foreground">{clickedPoi.place}{clickedPoi.number ? `, ${clickedPoi.number}` : ''}</span>
                    </div>
                  </div>

                  {clickedPoi.opening_hours && (
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <span className="text-base">⏰</span>
                      <div>
                        <strong className="block text-foreground font-semibold">Horário de Funcionamento</strong>
                        <span className="text-muted-foreground">{clickedPoi.opening_hours}</span>
                      </div>
                    </div>
                  )}

                  {clickedPoi.phone && (
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <span className="text-base">📞</span>
                      <div>
                        <strong className="block text-foreground font-semibold">Telefone</strong>
                        <span className="text-muted-foreground">{clickedPoi.phone}</span>
                      </div>
                    </div>
                  )}

                  {commercial?.features && commercial.features.length > 0 && (
                    <div className="pt-2 border-t border-border/40">
                      <strong className="block text-[11px] text-muted-foreground mb-1 uppercase font-semibold">Diferenciais & Facilidades</strong>
                      <div className="flex flex-wrap gap-1">
                        {commercial.features.map((feat: string, fIdx: number) => (
                          <Badge key={fIdx} variant="secondary" className="text-[10px] py-0">
                            ✓ {feat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* WhatsApp Direto se disponível */}
            {commercial?.whatsapp && (
              <a
                href={`https://wa.me/5516996411440?text=Olá! Vi o estabelecimento no Voyage e gostaria de informações`}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <MessageCircle size={15} /> Pedir pelo WhatsApp: <strong>{commercial.whatsapp}</strong>
              </a>
            )}

            {/* Botões de Ação com shadcn Button */}
            <div className="poi-actions-row flex gap-2 mt-3">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleDrawRoute}
                disabled={isRouteLoading}
                isLoading={isRouteLoading}
              >
                <Navigation size={14} className="mr-1" />
                {isRouteLoading ? 'Traçando...' : 'Traçar Rota'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setCenterPos(clickedPoi.coordinates);
                  if (mapRef.current) mapRef.current.flyTo({ center: clickedPoi.coordinates, zoom: 15.5 });
                  setClickedPoi(null);
                }}
              >
                <Compass size={14} className="mr-1 text-primary" /> Fixar Raio
              </Button>
            </div>
          </div>
        );
      })()}

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

