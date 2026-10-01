import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CompanyLead } from '../types';

interface SaoPauloRealMapProps {
  centerLat: number;
  centerLng: number;
  centerName: string;
  radiusKm: number;
  leads: CompanyLead[];
  selectedLead: CompanyLead | null;
  onSelectLead: (lead: CompanyLead) => void;
  onAddToCarteira: (lead: CompanyLead) => void;
}

export const SaoPauloRealMap: React.FC<SaoPauloRealMapProps> = ({
  centerLat,
  centerLng,
  centerName,
  radiusKm,
  leads,
  selectedLead,
  onSelectLead,
  onAddToCarteira,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [mapTileType, setMapTileType] = React.useState<'dark' | 'satellite' | 'street'>('dark');

  // Inicialização do mapa Leaflet restrito a São Paulo
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Limites de São Paulo e Grande SP para restringir a navegação
      const spBounds = L.latLngBounds(
        L.latLng(-24.05, -47.05), // Sudoeste de SP
        L.latLng(-23.35, -46.25)  // Nordeste de SP
      );

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11,
        maxBounds: spBounds,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualização dos Tiles (Dark GIS, Satélite Google/Esri, Ruas)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove camadas de tile anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

    if (mapTileType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (mapTileType === 'satellite') {
      // Satélite em alta resolução da Esri/World Imagery
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri, Maxar, Earthstar Geographics';
    } else {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapTileType]);

  // Atualiza Centro, Círculo de Raio e Marcadores
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Centraliza o mapa suavemente
    map.panTo([centerLat, centerLng], { animate: true, duration: 0.5 });

    // Ajusta zoom baseado no raio
    const targetZoom = radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11;
    if (map.getZoom() !== targetZoom) {
      map.setZoom(targetZoom);
    }

    // 1. Círculo do Raio em São Paulo
    const radiusMeters = radiusKm * 1000;
    const circle = L.circle([centerLat, centerLng], {
      radius: radiusMeters,
      color: '#f59e0b',
      weight: 2,
      fillColor: '#f59e0b',
      fillOpacity: 0.08,
      dashArray: '6, 6',
    }).addTo(layerGroup);
    circleRef.current = circle;

    // 2. Marcador do Ponto Central (Target)
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #ef4444;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon }).addTo(layerGroup);
    centerMarker.bindTooltip(`<strong>Ponto Central:</strong> ${centerName} (${radiusKm} km de raio)`, {
      direction: 'top',
      offset: [0, -16],
    });

    // 3. Marcadores de Empresas (CNPJs)
    leads.forEach((lead) => {
      const isImob = lead.ramo === 'imobiliaria';
      const isServ = lead.ramo === 'prestacao_servicos_lopes' || lead.ramo === 'facility_condominios';
      const isSelected = selectedLead?.id === lead.id;

      const bgColor = isImob ? '#06b6d4' : isServ ? '#10b981' : '#f59e0b';
      const emoji = isImob ? '🏢' : isServ ? '🛠️' : '💼';

      const customIcon = L.divIcon({
        className: 'custom-lead-marker',
        html: `
          <div style="
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background: ${bgColor};
            border: 2px solid ${isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.8)'};
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${emoji}
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([lead.endereco.latitude, lead.endereco.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectLead(lead);
      });

      // Tooltip informativo
      marker.bindTooltip(
        `
        <div style="font-size: 12px; line-height: 1.4;">
          <strong>${lead.nome_fantasia || lead.razao_social}</strong><br/>
          <span style="color: #fbbf24;">CNPJ: ${lead.cnpj}</span><br/>
          <span>${lead.distancia_km} km de distância • ${lead.endereco.bairro}</span>
        </div>
      `,
        { direction: 'top', offset: [0, -14] }
      );

      marker.addTo(layerGroup);
    });
  }, [centerLat, centerLng, centerName, radiusKm, leads, selectedLead]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Container Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Controles Flutuantes Superiores (Estilo do Mapa & Link Oficial) */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 flex items-center shadow-xl">
          <button
            onClick={() => setMapTileType('dark')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              mapTileType === 'dark' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌙 Dark GIS
          </button>
          <button
            onClick={() => setMapTileType('satellite')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              mapTileType === 'satellite' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            🛰️ Satélite
          </button>
          <button
            onClick={() => setMapTileType('street')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              mapTileType === 'street' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏙️ Ruas SP
          </button>
        </div>

        {/* Botão de rota direta no Google Maps */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1.5 shadow-xl transition"
        >
          <span>Abrir no Google Maps</span>
          <span className="text-[10px] text-amber-400">↗</span>
        </a>
      </div>

      {/* Legenda Flutuante Inferior */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-300 shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
          <span>Imobiliárias (CNAE 68)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
          <span>Serviços Lopes (CNAE 78/81)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-amber-400 border-dashed"></span>
          <span>Raio ({radiusKm} km)</span>
        </div>
      </div>
    </div>
  );
};
