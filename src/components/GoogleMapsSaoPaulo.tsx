import React, { useState } from 'react';
import { CompanyLead } from '../types';
import { ExternalLink, Compass } from 'lucide-react';

interface GoogleMapsSaoPauloProps {
  centerLat: number;
  centerLng: number;
  centerName: string;
  radiusKm: number;
  leads: CompanyLead[];
  selectedLead: CompanyLead | null;
  onSelectLead: (lead: CompanyLead) => void;
  onAddToCarteira: (lead: CompanyLead) => void;
}

export const GoogleMapsSaoPaulo: React.FC<GoogleMapsSaoPauloProps> = ({
  centerLat,
  centerLng,
  centerName,
  radiusKm,
  leads,
  selectedLead,
  onSelectLead,
  onAddToCarteira,
}) => {
  const [mapType, setMapType] = useState<'m' | 'k' | 'h' | 'p'>('m');

  const zoomLevel =
    radiusKm <= 2 ? 15 : radiusKm <= 5 ? 14 : radiusKm <= 10 ? 13 : radiusKm <= 20 ? 12 : 11;

  const targetLabel = selectedLead
    ? `${selectedLead.nome_fantasia || selectedLead.razao_social}, ${selectedLead.endereco.logradouro}, ${selectedLead.endereco.numero}, São Paulo - SP`
    : `${centerName}, São Paulo - SP`;

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    targetLabel
  )}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    targetLabel
  )}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white flex flex-col">
      {/* Barra de Controles Superior do Google Maps */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
          <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            Google Maps Oficial · São Paulo - SP
          </span>
          <span className="text-[11px] text-blue-700 hidden sm:inline">
            ({radiusKm} km de raio em {centerName.split('(')[0].trim()})
          </span>
        </div>

        {/* Alternador de Modos */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setMapType('m')}
            className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
              mapType === 'm'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Ruas & Trânsito
          </button>
          <button
            onClick={() => setMapType('k')}
            className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
              mapType === 'k'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Satélite
          </button>
          <button
            onClick={() => setMapType('h')}
            className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
              mapType === 'h'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Híbrido
          </button>
          <button
            onClick={() => setMapType('p')}
            className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
              mapType === 'p'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Relevo
          </button>

          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 pl-2 border-l border-slate-200 text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold text-xs"
            title="Abrir no Google Maps"
          >
            <span>Abrir no Google Maps</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
          </a>
        </div>
      </div>

      {/* Frame Principal do Google Maps Oficial */}
      <div className="relative w-full h-[520px] bg-slate-100">
        <iframe
          title="Google Maps São Paulo"
          src={googleMapsEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Lista Flutuante de Empresas no Raio */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] text-blue-950 px-1 font-semibold">
            <span>{leads.length} CNPJs localizados no raio:</span>
            <span className="text-blue-600">Clique para focalizar</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 max-h-24">
            {leads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              const isImob = lead.ramo === 'imobiliaria';

              return (
                <button
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`flex-shrink-0 text-left p-2 rounded-lg border text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold truncate max-w-[170px] flex items-center gap-1">
                    <span>{isImob ? '🏢' : '🛠️'}</span>
                    <span className="truncate">{lead.nome_fantasia || lead.razao_social}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <span className="font-mono text-blue-700 font-bold">{lead.distancia_km} km</span>
                    <span>·</span>
                    <span>{lead.endereco.bairro}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
