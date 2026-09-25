/**
 * mapService.js
 * Módulo de serviço responsável pela busca otimizada de estabelecimentos (POIs),
 * integração com Overpass API (OpenStreetMap), Nominatim e rotas OSRM com cache em memória.
 */

// Cache em memória para evitar requisições redundantes na Overpass
const poiCache = new Map();
const CACHE_MAX_ENTRIES = 50;

// Lista de mirrors rápidos da Overpass API com failover
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

/**
 * Categorias principais e suas tags no OpenStreetMap
 */
export const CATEGORY_GROUPS = [
  { id: 'todos', label: 'Todos', icon: '🌟' },
  { id: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
  { id: 'compras', label: 'Compras', icon: '🛒' },
  { id: 'entretenimento', label: 'Entretenimento', icon: '🎉' },
  { id: 'hospedagem', label: 'Hospedagem', icon: '🏨' },
  { id: 'automotivo', label: 'Automotivo', icon: '🚗' },
  { id: 'saude', label: 'Saúde', icon: '💊' },
  { id: 'servicos', label: 'Serviços', icon: '🏦' }
];

export const VOYAGE_CATEGORIES = [
  // --- ALIMENTAÇÃO ---
  { id: 'restaurante', label: 'Restaurante', group: 'alimentacao', icon: '🍽️', color: '#e27b55', tags: [{ key: 'amenity', value: 'restaurant' }, { key: 'amenity', value: 'food_court' }, { key: 'amenity', value: 'buffet' }] },
  { id: 'lanchonete', label: 'Lanchonete', group: 'alimentacao', icon: '🍔', color: '#e27b55', tags: [{ key: 'amenity', value: 'fast_food' }, { key: 'amenity', value: 'snack_bar' }, { key: 'cuisine', value: 'burger' }, { key: 'cuisine', value: 'sandwich' }] },
  { id: 'cafe', label: 'Café', group: 'alimentacao', icon: '☕', color: '#8c593b', tags: [{ key: 'amenity', value: 'cafe' }, { key: 'shop', value: 'coffee' }, { key: 'shop', value: 'tea' }] },
  { id: 'sorveteria', label: 'Sorveteria', group: 'alimentacao', icon: '🍨', color: '#ec4899', tags: [{ key: 'amenity', value: 'ice_cream' }, { key: 'shop', value: 'ice_cream' }] },
  { id: 'padaria', label: 'Padaria', group: 'alimentacao', icon: '🥐', color: '#d97706', tags: [{ key: 'shop', value: 'bakery' }, { key: 'shop', value: 'pastry' }] },
  { id: 'pizzaria', label: 'Pizzaria', group: 'alimentacao', icon: '🍕', color: '#ef4444', tags: [{ key: 'amenity', value: 'pizzeria' }, { key: 'cuisine', value: 'pizza' }] },
  { id: 'bar', label: 'Bar', group: 'alimentacao', icon: '🍺', color: '#f59e0b', tags: [{ key: 'amenity', value: 'bar' }, { key: 'amenity', value: 'lounge' }] },
  { id: 'pub', label: 'Pub', group: 'alimentacao', icon: '🍻', color: '#b45309', tags: [{ key: 'amenity', value: 'pub' }, { key: 'amenity', value: 'biergarten' }] },
  { id: 'adega', label: 'Adega', group: 'alimentacao', icon: '🍷', color: '#831843', tags: [{ key: 'shop', value: 'wine' }, { key: 'shop', value: 'alcohol' }, { key: 'shop', value: 'beverages' }] },

  // --- COMPRAS ---
  { id: 'mercado', label: 'Mercado', group: 'compras', icon: '🛒', color: '#10b981', tags: [{ key: 'shop', value: 'supermarket' }, { key: 'shop', value: 'grocery' }, { key: 'shop', value: 'general' }, { key: 'building', value: 'supermarket' }] },
  { id: 'supermercado', label: 'Supermercado', group: 'compras', icon: '🏬', color: '#059669', tags: [{ key: 'shop', value: 'supermarket' }, { key: 'building', value: 'supermarket' }] },
  { id: 'conveniencia', label: 'Loja de Conveniência', group: 'compras', icon: '🏪', color: '#14b8a6', tags: [{ key: 'shop', value: 'convenience' }] },
  { id: 'shopping', label: 'Shopping', group: 'compras', icon: '🛍️', color: '#6366f1', tags: [{ key: 'shop', value: 'mall' }, { key: 'shop', value: 'department_store' }] },
  { id: 'loja_roupas', label: 'Loja de Roupas', group: 'compras', icon: '👗', color: '#ec4899', tags: [{ key: 'shop', value: 'clothes' }, { key: 'shop', value: 'fashion' }, { key: 'shop', value: 'boutique' }, { key: 'shop', value: 'shoes' }] },
  { id: 'loja_eletronicos', label: 'Loja de Eletrônicos', group: 'compras', icon: '💻', color: '#3b82f6', tags: [{ key: 'shop', value: 'electronics' }, { key: 'shop', value: 'computer' }] },
  { id: 'loja_celulares', label: 'Loja de Celulares', group: 'compras', icon: '📱', color: '#06b6d4', tags: [{ key: 'shop', value: 'mobile_phone' }, { key: 'shop', value: 'telecommunication' }] },

  // --- ENTRETENIMENTO ---
  { id: 'balada', label: 'Casa Noturna / Boate', group: 'entretenimento', icon: '🪩', color: '#9333ea', tags: [{ key: 'amenity', value: 'nightclub' }, { key: 'amenity', value: 'dance' }, { key: 'amenity', value: 'club' }] },
  { id: 'cinema', label: 'Cinema', group: 'entretenimento', icon: '🍿', color: '#dc2626', tags: [{ key: 'amenity', value: 'cinema' }] },
  { id: 'teatro', label: 'Teatro', group: 'entretenimento', icon: '🎭', color: '#c026d3', tags: [{ key: 'amenity', value: 'theatre' }, { key: 'amenity', value: 'arts_centre' }] },
  { id: 'parque', label: 'Parque', group: 'entretenimento', icon: '🌳', color: '#16a34a', tags: [{ key: 'leisure', value: 'park' }, { key: 'leisure', value: 'garden' }] },
  { id: 'boliche', label: 'Boliche', group: 'entretenimento', icon: '🎳', color: '#ea580c', tags: [{ key: 'leisure', value: 'bowling_alley' }] },

  // --- HOSPEDAGEM ---
  { id: 'hotel', label: 'Hotel', group: 'hospedagem', icon: '🏨', color: '#2563eb', tags: [{ key: 'tourism', value: 'hotel' }] },
  { id: 'motel', label: 'Motel', group: 'hospedagem', icon: '🏩', color: '#db2777', tags: [{ key: 'tourism', value: 'motel' }] },
  { id: 'pousada', label: 'Pousada', group: 'hospedagem', icon: '🏡', color: '#0284c7', tags: [{ key: 'tourism', value: 'guest_house' }, { key: 'tourism', value: 'bed_and_breakfast' }, { key: 'tourism', value: 'chalet' }] },
  { id: 'hostel', label: 'Hostel', group: 'hospedagem', icon: '🛏️', color: '#0d9488', tags: [{ key: 'tourism', value: 'hostel' }] },

  // --- AUTOMOTIVO ---
  { id: 'posto', label: 'Posto de Combustível', group: 'automotivo', icon: '⛽', color: '#ea580c', tags: [{ key: 'amenity', value: 'fuel' }] },
  { id: 'oficina', label: 'Oficina', group: 'automotivo', icon: '🔧', color: '#475569', tags: [{ key: 'shop', value: 'car_repair' }, { key: 'craft', value: 'car_repair' }] },
  { id: 'oficina_motos', label: 'Oficina de Motos', group: 'automotivo', icon: '🏍️', color: '#334155', tags: [{ key: 'shop', value: 'motorcycle_repair' }, { key: 'shop', value: 'motorcycle' }] },
  { id: 'borracharia', label: 'Borracharia', group: 'automotivo', icon: '🛞', color: '#1e293b', tags: [{ key: 'shop', value: 'tyres' }] },
  { id: 'lavarapido', label: 'Lava-Rápido', group: 'automotivo', icon: '🚿', color: '#0284c7', tags: [{ key: 'amenity', value: 'car_wash' }] },
  { id: 'loja_pneus', label: 'Loja de Pneus', group: 'automotivo', icon: '🚗', color: '#475569', tags: [{ key: 'shop', value: 'tyres' }, { key: 'shop', value: 'car_parts' }] },

  // --- SAÚDE ---
  { id: 'farmacia', label: 'Farmácia', group: 'saude', icon: '💊', color: '#6343f2', tags: [{ key: 'amenity', value: 'pharmacy' }, { key: 'shop', value: 'chemist' }] },
  { id: 'hospital', label: 'Hospital', group: 'saude', icon: '🏥', color: '#dc2626', tags: [{ key: 'amenity', value: 'hospital' }, { key: 'building', value: 'hospital' }] },
  { id: 'clinica', label: 'Clínica', group: 'saude', icon: '🩺', color: '#0891b2', tags: [{ key: 'amenity', value: 'clinic' }, { key: 'amenity', value: 'doctors' }] },
  { id: 'dentista', label: 'Dentista', group: 'saude', icon: '🦷', color: '#0284c7', tags: [{ key: 'amenity', value: 'dentist' }] },
  { id: 'veterinario', label: 'Veterinário', group: 'saude', icon: '🐾', color: '#10b981', tags: [{ key: 'amenity', value: 'veterinary' }, { key: 'shop', value: 'pet' }] },

  // --- SERVIÇOS ---
  { id: 'banco', label: 'Banco', group: 'servicos', icon: '🏦', color: '#047857', tags: [{ key: 'amenity', value: 'bank' }] },
  { id: 'caixa_eletronico', label: 'Caixa Eletrônico', group: 'servicos', icon: '🏧', color: '#059669', tags: [{ key: 'amenity', value: 'atm' }] },
  { id: 'correios', label: 'Correios', group: 'servicos', icon: '📦', color: '#eab308', tags: [{ key: 'amenity', value: 'post_office' }] },
  { id: 'academia', label: 'Academia', group: 'servicos', icon: '🏋️', color: '#d97706', tags: [{ key: 'leisure', value: 'fitness_centre' }, { key: 'leisure', value: 'sports_centre' }] },
  { id: 'barbearia', label: 'Barbearia', group: 'servicos', icon: '💈', color: '#ec4899', tags: [{ key: 'shop', value: 'hairdresser' }] },
  { id: 'salao_beleza', label: 'Salão de Beleza', group: 'servicos', icon: '💅', color: '#f43f5e', tags: [{ key: 'shop', value: 'beauty' }] }
];

/**
 * Identifica a categoria correspondente a partir das tags brutas do OSM
 */
export const getCategoryFromOSMTags = (tags) => {
  if (!tags) return null;
  for (const cat of VOYAGE_CATEGORIES) {
    for (const rule of cat.tags) {
      if (tags[rule.key] && String(tags[rule.key]).toLowerCase() === rule.value.toLowerCase()) {
        return cat;
      }
    }
  }
  return null;
};

/**
 * Constrói a query Overpass de forma otimizada:
 * - Evita relations pesadas
 * - Limita cláusulas ao essencial
 * - Usa node e way (com out center) para performance
 */
const buildOverpassQuery = ({ center, radiusKm, bounds, category, group, limit = 160 }) => {
  let locationFilter = '';
  if (radiusKm && radiusKm > 0 && center) {
    const [lng, lat] = center;
    const radiusMeters = Math.min(radiusKm * 1000, 10000);
    locationFilter = `(around:${radiusMeters},${lat.toFixed(5)},${lng.toFixed(5)})`;
  } else if (bounds) {
    locationFilter = `(${bounds.south.toFixed(4)},${bounds.west.toFixed(4)},${bounds.north.toFixed(4)},${bounds.east.toFixed(4)})`;
  } else if (center) {
    const [lng, lat] = center;
    locationFilter = `(around:4000,${lat.toFixed(5)},${lng.toFixed(5)})`;
  }

  const clauses = [];

  if (category) {
    // Busca focada na categoria específica selecionada
    category.tags.forEach((rule) => {
      clauses.push(`node${locationFilter}["${rule.key}"="${rule.value}"]["name"];`);
      clauses.push(`way${locationFilter}["${rule.key}"="${rule.value}"]["name"];`);
    });
  } else if (group && group !== 'todos') {
    // Busca pelas categorias do grupo selecionado
    const catsInGroup = VOYAGE_CATEGORIES.filter((c) => c.group === group);
    catsInGroup.forEach((cat) => {
      cat.tags.forEach((rule) => {
        clauses.push(`node${locationFilter}["${rule.key}"="${rule.value}"]["name"];`);
        clauses.push(`way${locationFilter}["${rule.key}"="${rule.value}"]["name"];`);
      });
    });
  } else {
    // "Todos" - Conjunto de alta relevância (restaurantes, mercados, farmácias, postos, hotéis)
    const priorityAmenities = 'restaurant|fast_food|cafe|pharmacy|fuel|hospital|bank|cinema|nightclub|bar|pub';
    const priorityShops = 'supermarket|convenience|bakery|car_repair|tyres';
    clauses.push(`node${locationFilter}["amenity"~"${priorityAmenities}"]["name"];`);
    clauses.push(`way${locationFilter}["amenity"~"${priorityAmenities}"]["name"];`);
    clauses.push(`node${locationFilter}["shop"~"${priorityShops}"]["name"];`);
    clauses.push(`way${locationFilter}["shop"~"${priorityShops}"]["name"];`);
    clauses.push(`node${locationFilter}["tourism"~"hotel|motel|guest_house"]["name"];`);
  }

  return `
    [out:json][timeout:15];
    (
      ${clauses.join('\n      ')}
    );
    out center qt ${limit};
  `;
};

/**
 * Converte elementos brutos do OpenStreetMap em POIs padronizados do Voyage
 */
const parseOSMElements = (elements) => {
  if (!elements || !Array.isArray(elements)) return [];

  return elements
    .filter((el) => el.tags && el.tags.name)
    .map((el) => {
      const coord = [
        el.lon ?? el.center?.lon,
        el.lat ?? el.center?.lat
      ];
      const tags = el.tags || {};
      const matchedCat = getCategoryFromOSMTags(tags);

      const categoryLabel = matchedCat?.label || tags.amenity || tags.shop || tags.tourism || 'Local';
      const categoryIcon = matchedCat?.icon || '📍';
      const categoryColor = matchedCat?.color || '#6343f2';
      const categoryId = matchedCat?.id || 'outros';
      const categoryGroup = matchedCat?.group || null;

      const street = tags['addr:street'] || tags['addr:place'] || tags['addr:suburb'] || 'Endereço próximo';
      const houseNumber = tags['addr:housenumber'] || '';

      const seed = Math.abs(Number(el.id)) || 42;
      const score = Number((4.1 + (seed % 9) * 0.1).toFixed(1));

      return {
        id: el.id,
        name: tags.name,
        category: categoryLabel,
        categoryId: categoryId,
        categoryGroup: categoryGroup,
        categoryIcon: categoryIcon,
        categoryColor: categoryColor,
        coordinates: coord,
        evaluate: Math.min(score, 5.0),
        place: street,
        number: houseNumber,
        phone: tags.phone || tags['contact:phone'],
        opening_hours: tags.opening_hours
      };
    });
};

export const mapService = {
  /**
   * Busca POIs por área e categoria com cache em memória
   */
  async getPOIs({ center, radiusKm, bounds, category, group }) {
    // Gerar chave única para cache
    const centerKey = center ? `${center[0].toFixed(3)},${center[1].toFixed(3)}` : 'nocenter';
    const radiusKey = radiusKm ? `${radiusKm}km` : (bounds ? `${bounds.south.toFixed(3)},${bounds.west.toFixed(3)}` : 'free');
    const catKey = category?.id || group || 'todos';
    const cacheKey = `${centerKey}_${radiusKey}_${catKey}`;

    // Estabelecimentos Parceiros Fixos e Cadastrados (Ex: Supermercado Ratti)
    const FEATURED_PARTNERS = [
      {
        id: 'ratti-sc-01',
        name: 'Supermercado Ratti',
        category: 'Supermercado',
        categoryId: 'supermercado',
        categoryGroup: 'compras',
        categoryIcon: '🏬',
        categoryColor: '#059669',
        coordinates: [-47.9042, -22.0298],
        evaluate: 4.9,
        place: 'Avenida República do Líbano',
        number: '361 - Jardim Cruzeiro do Sul',
        phone: '(16) 99641-1440',
        opening_hours: 'Seg - Sáb: 07:30 às 20:00 • Dom: 07:30 às 13:00'
      }
    ];

    const filterPartners = () => {
      return FEATURED_PARTNERS.filter((partner) => {
        if (category?.id && partner.categoryId !== category.id) return false;
        if (group && group !== 'todos' && partner.categoryGroup !== group) return false;
        return true;
      });
    };

    if (poiCache.has(cacheKey)) {
      const cached = poiCache.get(cacheKey);
      const partners = filterPartners();
      const ids = new Set(cached.map((p) => p.id));
      const merged = [...cached];
      partners.forEach((p) => {
        if (!ids.has(p.id)) merged.unshift(p);
      });
      return merged;
    }

    const queryString = buildOverpassQuery({ center, radiusKm, bounds, category, group });

    let lastError = null;
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos timeout por mirror

        const res = await fetch(`${endpoint}?data=${encodeURIComponent(queryString)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          let parsed = parseOSMElements(data.elements);

          // Filtrar estritamente pelo grupo ou categoria se não for "todos"
          if (category?.id) {
            parsed = parsed.filter((p) => p.categoryId === category.id);
          } else if (group && group !== 'todos') {
            parsed = parsed.filter((p) => p.categoryGroup === group);
          }

          // Incluir estabelecimentos parceiros cadastrados (como Supermercado Ratti)
          const partners = filterPartners();
          const existingIds = new Set(parsed.map((p) => p.id));
          partners.forEach((p) => {
            if (!existingIds.has(p.id)) {
              parsed.unshift(p);
            }
          });

          // Salvar em cache
          if (poiCache.size >= CACHE_MAX_ENTRIES) {
            const firstKey = poiCache.keys().next().value;
            poiCache.delete(firstKey);
          }
          poiCache.set(cacheKey, parsed);

          return parsed;
        }
      } catch (err) {
        lastError = err;
        // Tenta próximo mirror imediatamente
      }
    }

    console.warn('[mapService] Todos os mirrors Overpass falharam ou deram timeout:', lastError);
    return filterPartners();
  },

  /**
   * Busca textual direta e rápida por nome do local ou categoria (ex: Savegnago, Motel, Oficina)
   */
  async searchByName(query, center) {
    if (!query || !query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();
    const partnerMatches = [];
    if (lowerQuery.includes('ratti') || lowerQuery.includes('supermercado ratti') || lowerQuery.includes('feira')) {
      partnerMatches.push({
        id: 'ratti-sc-01',
        name: 'Supermercado Ratti',
        category: 'Supermercado',
        categoryId: 'supermercado',
        categoryGroup: 'compras',
        categoryIcon: '🏬',
        categoryColor: '#059669',
        coordinates: [-47.9042, -22.0298],
        evaluate: 4.9,
        place: 'Avenida República do Líbano',
        number: '361 - Jardim Cruzeiro do Sul',
        phone: '(16) 99641-1440',
        opening_hours: 'Seg - Sáb: 07:30 às 20:00 • Dom: 07:30 às 13:00'
      });
    }

    const [lng, lat] = center || [-47.8908, -22.0174];
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&viewbox=${lng - 0.25},${lat + 0.25},${lng + 0.25},${lat - 0.25}&bounded=0&addressdetails=1&limit=15`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return partnerMatches;

    const results = await res.json();
    const parsedResults = results.map((r) => {
      const coord = [parseFloat(r.lon), parseFloat(r.lat)];
      const addr = r.address || {};
      const street = addr.road || addr.suburb || addr.city || r.display_name.split(',')[0];
      const houseNumber = addr.house_number || '';
      const matched = getCategoryFromOSMTags(addr) || getCategoryFromOSMTags({ amenity: r.type, shop: r.type, tourism: r.type });

      return {
        id: `nom-${r.place_id}`,
        name: r.name || r.display_name.split(',')[0],
        category: matched?.label || r.type || 'Local',
        categoryId: matched?.id || 'outros',
        categoryIcon: matched?.icon || '📍',
        categoryColor: matched?.color || '#6343f2',
        coordinates: coord,
        evaluate: 4.8,
        place: street,
        number: houseNumber
      };
    });

    return [...partnerMatches, ...parsedResults];
  },

  /**
   * Traça rota entre dois pontos usando OSRM
   */
  async getRoute(startCoords, endCoords) {
    const [startLng, startLat] = startCoords;
    const [endLng, endLat] = endCoords;
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Não foi possível obter a rota');
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry;
    }
    return null;
  },

  /**
   * Helper para gerar o GeoJSON do raio circular
   */
  createGeoJSONCircle(center, radiusInKm, points = 64) {
    if (!radiusInKm || radiusInKm <= 0) {
      return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {}
      };
    }

    const [lng, lat] = center;
    const ret = [];
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
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ret]
      },
      properties: {}
    };
  }
};
