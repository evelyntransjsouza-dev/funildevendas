import React, { useState, useMemo } from 'react';
import { useLeads } from '../context/LeadsContext';
import { useAuth } from '../context/AuthContext';
import { CompanyLead } from '../types';
import { RAMOS_TAXONOMIA } from '../data/seedLeads';
import { EditLeadModal } from './EditLeadModal';
import { GoogleMapsSaoPaulo } from './GoogleMapsSaoPaulo';
import { getCleanPhoneForWhatsApp } from '../services/brasilApi';
import {
  Compass,
  MapPin,
  Building2,
  Phone,
  Mail,
  User,
  PlusCircle,
  CheckCircle,
  ExternalLink,
  Edit3,
  Crosshair,
  Search,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SP_LOCATIONS = [
  { name: 'Av. Paulista (Centro / Jardins)', lat: -23.5615, lng: -46.6560 },
  { name: 'Faria Lima / Itaim Bibi (Zona Sul)', lat: -23.5865, lng: -46.6812 },
  { name: 'Praça da Sé (Centro Histórico)', lat: -23.5505, lng: -46.6333 },
  { name: 'Pinheiros / Rebouças (Zona Oeste)', lat: -23.5662, lng: -46.6890 },
  { name: 'Santana (Zona Norte)', lat: -23.5042, lng: -46.6265 },
  { name: 'Tatuapé / Eixo Platina (Zona Leste)', lat: -23.5410, lng: -46.5760 },
  { name: 'Berrini / Brooklin (Zona Sul)', lat: -23.6080, lng: -46.6975 },
  { name: 'Morumbi / Giovanni Gronchi (Zona Sul)', lat: -23.6120, lng: -46.7280 },
];

export const RadarMapSection: React.FC = () => {
  const { radarFilter, setRadarFilter, getFilteredLeads, addToCarteira } = useLeads();
  const { currentUser, isGestor } = useAuth();

  const [selectedLead, setSelectedLead] = useState<CompanyLead | null>(null);
  const [editingLead, setEditingLead] = useState<CompanyLead | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');

  const filteredLeads = useMemo(() => getFilteredLeads(), [radarFilter, getFilteredLeads]);

  const handleCenterChange = (loc: { name: string; lat: number; lng: number }) => {
    setRadarFilter((prev) => ({
      ...prev,
      centerLat: loc.lat,
      centerLng: loc.lng,
      centerName: loc.name,
    }));
  };

  const handleRadiusChange = (radiusKm: number) => {
    setRadarFilter((prev) => ({
      ...prev,
      radiusKm,
    }));
  };

  const handleRamoCategoryChange = (ramoId: string) => {
    setRadarFilter((prev) => ({
      ...prev,
      ramo: ramoId,
    }));
  };

  const handleFreeSearchChange = (val: string) => {
    setRadarFilter((prev) => ({
      ...prev,
      ramoBuscaLivre: val,
    }));
  };

  const handleAddLeadToCarteira = (lead: CompanyLead) => {
    addToCarteira(lead, currentUser?.id, currentUser?.name);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
    });
  };

  const getGoogleMapsDirectionsUrl = (lead: CompanyLead) => {
    const query = encodeURIComponent(
      `${lead.razao_social}, ${lead.endereco.logradouro}, ${lead.endereco.numero}, São Paulo - SP`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getGmailComposeUrl = (lead: CompanyLead) => {
    const subject = encodeURIComponent(`Proposta Comercial Lopes para ${lead.nome_fantasia || lead.razao_social}`);
    const body = encodeURIComponent(
      `Olá ${lead.contato_nome || 'Diretoria'},\n\nSou ${currentUser?.name}, da Lopes São Paulo.\n\nGostaria de apresentar nossas soluções corporativas.\n\nAtenciosamente,\n${currentUser?.name}\nLopes São Paulo`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${subject}&body=${body}`;
  };

  const getWhatsAppUrl = (lead: CompanyLead) => {
    const num = getCleanPhoneForWhatsApp(lead.telefone);
    const msg = encodeURIComponent(
      `Olá ${lead.contato_nome}! Sou ${currentUser?.name} da Lopes São Paulo. Gostaria de falar sobre soluções corporativas e serviços para a ${lead.nome_fantasia || lead.razao_social}.`
    );
    return `https://wa.me/${num}?text=${msg}`;
  };

  return (
    <div className="space-y-6">
      {/* Controles do Radar & Raio Universal em Fundo Branco */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-blue-950 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              Radar Google Maps · Qualquer Ramo de Atividade em São Paulo
            </h2>
            <p className="text-xs text-blue-900/70 mt-0.5">
              Busque empresas por <strong>qualquer ramo, atividade ou código CNAE</strong> dentro do raio do Google Maps em São Paulo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Google Maps Oficial
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lista em Tabela ({filteredLeads.length})
            </button>
          </div>
        </div>

        {/* 1. CAMPO DE BUSCA ABERTO PARA QUALQUER RAMO */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Buscar qualquer ramo de atividade, serviço, produto ou código CNAE:
          </label>
          <div className="relative">
            <input
              type="text"
              value={radarFilter.ramoBuscaLivre || ''}
              onChange={(e) => handleFreeSearchChange(e.target.value)}
              placeholder="Ex: Medicina, Restaurante, Software, Advocacia, Contabilidade, Construção, Padaria, Farmácia, 6201..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm text-blue-950 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            {radarFilter.ramoBuscaLivre && (
              <button
                onClick={() => handleFreeSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Parâmetros: Centro SP, Raio KM e Categorias Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Centro em SP */}
          <div className="space-y-2">
            <label className="font-bold text-blue-950 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Ponto Central (São Paulo):
            </label>
            <select
              value={radarFilter.centerName}
              onChange={(e) => {
                const found = SP_LOCATIONS.find((l) => l.name === e.target.value);
                if (found) handleCenterChange(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-blue-950 focus:outline-none focus:border-blue-600"
            >
              {SP_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Raio Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-blue-950">
              <span className="flex items-center gap-1.5 font-bold">
                <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                Raio de Prospecção no Google Maps:
              </span>
              <span className="text-blue-700 font-mono font-bold">
                {radarFilter.radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={35}
              step={1}
              value={radarFilter.radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>1 km</span>
              <span>10 km</span>
              <span>25 km</span>
              <span>35 km</span>
            </div>
          </div>

          {/* Categoria Rápida */}
          <div className="space-y-2">
            <label className="font-bold text-blue-950 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Filtrar por Categoria ou CNAE:
            </label>
            <select
              value={radarFilter.ramo}
              onChange={(e) => handleRamoCategoryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-blue-950 focus:outline-none focus:border-blue-600"
            >
              {RAMOS_TAXONOMIA.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Atalhos Rápidos */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <span className="text-[11px] text-blue-900 font-semibold block">
            Atalhos para ramos frequentes:
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {RAMOS_TAXONOMIA.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  handleRamoCategoryChange(cat.id);
                  handleFreeSearchChange('');
                }}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                  radarFilter.ramo === cat.id && !radarFilter.ramoBuscaLivre
                    ? 'bg-blue-600 text-white font-bold border-blue-600'
                    : 'bg-white border-slate-200 text-blue-950 hover:bg-slate-50'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo da Consulta Requisitada */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div>
            Encontrados <strong className="text-blue-600 font-mono text-sm">{filteredLeads.length} CNPJs</strong> no raio
            de <strong className="text-blue-950">{radarFilter.radiusKm} km</strong> de{' '}
            <strong className="text-blue-950">{radarFilter.centerName.split('(')[0]}</strong>
            {radarFilter.ramoBuscaLivre && (
              <span> (Buscando por: &quot;{radarFilter.ramoBuscaLivre}&quot;)</span>
            )}
            {radarFilter.ramo !== 'todos' && !radarFilter.ramoBuscaLivre && (
              <span> ({RAMOS_TAXONOMIA.find((r) => r.id === radarFilter.ramo)?.label})</span>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-blue-900 font-medium">
            <input
              type="checkbox"
              checked={radarFilter.apenasMinhaCarteira}
              onChange={(e) =>
                setRadarFilter((prev) => ({
                  ...prev,
                  apenasMinhaCarteira: e.target.checked,
                }))
              }
              className="rounded accent-blue-600"
            />
            <span>Apenas {isGestor ? 'Carteira Geral' : 'Minha Carteira'}</span>
          </label>
        </div>
      </div>

      {/* Visualização Modo Google Maps */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa do Google Maps */}
          <div className="lg:col-span-2">
            <GoogleMapsSaoPaulo
              centerLat={radarFilter.centerLat}
              centerLng={radarFilter.centerLng}
              centerName={radarFilter.centerName}
              radiusKm={radarFilter.radiusKm}
              leads={filteredLeads}
              selectedLead={selectedLead}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onAddToCarteira={(lead) => handleAddLeadToCarteira(lead)}
            />
          </div>

          {/* Painel Lateral com Detalhes do CNPJ Selecionado em Fundo Branco */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            {selectedLead ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {selectedLead.cnpj}
                    </span>
                    <div className="text-[11px] text-slate-500">
                      {selectedLead.distancia_km} km de distância · {selectedLead.endereco.bairro}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingLead(selectedLead)}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-blue-950 leading-snug">
                    {selectedLead.nome_fantasia || selectedLead.razao_social}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedLead.cnae_fiscal_descricao} ({selectedLead.cnae_fiscal})
                  </p>
                </div>

                {/* Contato Principal (Auto QSA) */}
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between text-xs text-blue-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Contato Principal (QSA)
                    </span>
                    <span className="text-[10px] text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">Automático</span>
                  </div>
                  <div className="text-sm font-bold text-blue-950">{selectedLead.contato_nome}</div>
                  <div className="text-xs text-slate-600">{selectedLead.contato_cargo}</div>
                </div>

                {/* Canais Diretos (Telefone e Email) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-600 flex items-center gap-1 mb-1 font-bold">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Telefone
                    </div>
                    <div className="font-bold text-blue-950">{selectedLead.telefone || 'Sem telefone'}</div>
                    {selectedLead.telefone && (
                      <a
                        href={getWhatsAppUrl(selectedLead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        WhatsApp <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-600 flex items-center gap-1 mb-1 font-bold">
                      <Mail className="w-3.5 h-3.5 text-blue-600" /> Gmail
                    </div>
                    <div className="font-bold text-blue-950 truncate">
                      {selectedLead.email || 'Sem email'}
                    </div>
                    {selectedLead.email && (
                      <a
                        href={getGmailComposeUrl(selectedLead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Abrir Gmail <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Endereço em SP */}
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Endereço em São Paulo:
                  </div>
                  <div className="text-blue-950 font-medium">
                    {selectedLead.endereco.logradouro}, {selectedLead.endereco.numero} - {selectedLead.endereco.bairro}
                  </div>
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedLead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Ver no Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Botão de Adicionar à Carteira */}
                <button
                  onClick={() => handleAddLeadToCarteira(selectedLead)}
                  disabled={selectedLead.in_carteira}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    selectedLead.in_carteira
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {selectedLead.in_carteira ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Na Carteira ({selectedLead.assigned_to_user_name || 'Atribuído'})
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Inserir na Minha Carteira
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
                <Compass className="w-10 h-10 text-blue-300" />
                <div className="text-sm font-bold text-blue-950">Selecione uma Empresa no Google Maps</div>
                <p className="text-xs text-slate-600">
                  Clique em qualquer empresa na barra inferior do mapa para focalizá-la no Google Maps e visualizar os dados de contato.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visualização Modo Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono font-bold text-blue-700">{lead.cnpj}</span>
                  <span>{lead.distancia_km} km · {lead.endereco.bairro}</span>
                </div>

                <h3 className="font-bold text-blue-950 text-base leading-snug">
                  {lead.nome_fantasia || lead.razao_social}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-1">{lead.cnae_fiscal_descricao}</p>

                {/* Contato Automático */}
                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-xs">
                  <div className="text-blue-900 font-bold">Contato: {lead.contato_nome}</div>
                  <div className="text-[11px] text-slate-600">{lead.contato_cargo}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="text-slate-700 truncate">
                    <span className="text-slate-500 block text-[10px] font-semibold">Telefone:</span>
                    {lead.telefone || 'Não informado'}
                  </div>
                  <div className="text-slate-700 truncate">
                    <span className="text-slate-500 block text-[10px] font-semibold">Email / Gmail:</span>
                    {lead.email || 'Não informado'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingLead(lead)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  Editar
                </button>

                <button
                  onClick={() => handleAddLeadToCarteira(lead)}
                  disabled={lead.in_carteira}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    lead.in_carteira
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {lead.in_carteira ? 'Na Carteira' : 'Inserir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Alteração de Contato */}
      <EditLeadModal
        lead={editingLead}
        isOpen={Boolean(editingLead)}
        onClose={() => setEditingLead(null)}
      />
    </div>
  );
};
