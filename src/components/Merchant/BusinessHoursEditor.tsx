import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Copy,
  Globe
} from 'lucide-react';
import type { WeeklyBusinessHours, DayOfWeek, TimeShift } from '../../types/merchant';
import { merchantService } from '../../services/merchantService';

interface BusinessHoursEditorProps {
  hours: WeeklyBusinessHours;
  timeZone?: string;
  onChange: (updatedHours: WeeklyBusinessHours) => void;
}

const DAYS_ORDER: { key: DayOfWeek; label: string }[] = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
];

export const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({
  hours,
  timeZone = 'America/Sao_Paulo',
  onChange
}) => {
  // Timer periódico para recalcular status com a passagem do tempo a cada 30s
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Cálculo de status no fuso horário do estabelecimento
  const currentStatus = useMemo(() => {
    return merchantService.isEstablishmentOpen(hours, [], undefined, timeZone);
  }, [hours, timeZone, tick]);

  const handleToggleDay = (day: DayOfWeek) => {
    const current = hours[day];
    const willOpen = !current.isOpen;
    onChange({
      ...hours,
      [day]: {
        isOpen: willOpen,
        shifts: willOpen && current.shifts.length === 0
          ? [{ id: `${day}-1`, open: '08:00', close: '18:00' }]
          : current.shifts
      }
    });
  };

  const handleAddShift = (day: DayOfWeek) => {
    const current = hours[day];
    const newShift: TimeShift = {
      id: `${day}-${Date.now()}`,
      open: '14:00',
      close: '22:00'
    };
    onChange({
      ...hours,
      [day]: {
        ...current,
        shifts: [...current.shifts, newShift]
      }
    });
  };

  const handleRemoveShift = (day: DayOfWeek, shiftId: string) => {
    const current = hours[day];
    const filtered = current.shifts.filter((s) => s.id !== shiftId);
    onChange({
      ...hours,
      [day]: {
        ...current,
        shifts: filtered,
        isOpen: filtered.length > 0
      }
    });
  };

  const handleShiftTimeChange = (
    day: DayOfWeek,
    shiftId: string,
    field: 'open' | 'close',
    value: string
  ) => {
    const current = hours[day];
    const updatedShifts = current.shifts.map((s) =>
      s.id === shiftId ? { ...s, [field]: value } : s
    );
    onChange({
      ...hours,
      [day]: {
        ...current,
        shifts: updatedShifts
      }
    });
  };

  const handleCopyHours = (fromDay: DayOfWeek, targetType: 'weekdays' | 'all') => {
    const sourceSchedule = hours[fromDay];
    const newHours = { ...hours };

    const targetDays: DayOfWeek[] =
      targetType === 'weekdays'
        ? ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
        : ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    targetDays.forEach((d) => {
      newHours[d] = {
        isOpen: sourceSchedule.isOpen,
        shifts: sourceSchedule.shifts.map((s, idx) => ({
          id: `${d}-${idx}-${Date.now()}`,
          open: s.open,
          close: s.close
        }))
      };
    });

    onChange(newHours);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Status em Tempo Real */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-4 transition-all ${
          currentStatus.isOpen
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : currentStatus.isUnspecified
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full animate-pulse ${
              currentStatus.isOpen
                ? 'bg-emerald-400'
                : currentStatus.isUnspecified
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
          />
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>Status Operacional em Tempo Real:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  currentStatus.isOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentStatus.isUnspecified
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {currentStatus.isOpen
                  ? 'Aberto'
                  : currentStatus.isUnspecified
                  ? 'Horário não informado'
                  : 'Fechado'}
              </span>
            </h3>
            <p className="text-xs opacity-90 mt-0.5">{currentStatus.statusText}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fuso horário do estabelecimento: <strong>{timeZone}</strong></span>
        </div>
      </div>

      {/* Lista dos 7 dias */}
      <div className="space-y-3.5">
        {DAYS_ORDER.map(({ key, label }) => {
          const schedule = hours[key] || { isOpen: false, shifts: [] };

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border transition-all ${
                schedule.isOpen
                  ? 'bg-slate-900/80 border-white/10'
                  : 'bg-slate-950/50 border-white/5 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      schedule.isOpen ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        schedule.isOpen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-semibold text-white">{label}</span>
                  {!schedule.isOpen && (
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-medium">
                      Fechado neste dia
                    </span>
                  )}
                </div>

                {schedule.isOpen && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyHours(key, 'weekdays')}
                      title="Copiar para Segunda a Sexta"
                      className="text-xs flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    >
                      <Copy size={12} />
                      <span>Copiar Seg-Sex</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddShift(key)}
                      className="text-xs flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Adicionar Turno</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Turnos / Horários */}
              {schedule.isOpen && schedule.shifts.length > 0 && (
                <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
                  {schedule.shifts.map((shift, index) => {
                    const isOvernight = shift.open && shift.close && shift.close < shift.open;

                    return (
                      <div
                        key={shift.id}
                        className="flex flex-wrap items-center gap-3 bg-slate-800/50 p-2.5 rounded-lg border border-white/5"
                      >
                        <Clock size={15} className="text-indigo-400 flex-shrink-0" />
                        <span className="text-xs text-slate-400 w-16">Turno {index + 1}:</span>

                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={shift.open}
                            onChange={(e) =>
                              handleShiftTimeChange(key, shift.id, 'open', e.target.value)
                            }
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs text-slate-400">até</span>
                          <input
                            type="time"
                            value={shift.close}
                            onChange={(e) =>
                              handleShiftTimeChange(key, shift.id, 'close', e.target.value)
                            }
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {isOvernight && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            🌙 Vira a meia-noite (encerra no dia seguinte)
                          </span>
                        )}

                        {schedule.shifts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveShift(key, shift.id)}
                            className="ml-auto text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                            title="Remover este turno"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
