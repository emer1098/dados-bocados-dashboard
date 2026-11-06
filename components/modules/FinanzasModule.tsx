import React, { useState } from 'react'
import {
  Landmark,
  TrendingUp,
  Users,
  Building,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import {
  FIXED_COSTS_DATA,
  FINANCIAL_METRICS,
  PARTNERS_DATA,
  TOTAL_EQUITY,
} from '@/lib/businessData'

export function FinanzasModule() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <span className="eyebrow">NEGOCIO · ESTRUCTURA FINANCIERA</span>
        <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">Costos y Finanzas</h1>
        <p className="text-sm text-[#555869] mt-0.5">
          Presupuesto de costos fijos mensuales (S/ 1,260.12), punto de equilibrio y estructura societaria.
        </p>
      </div>

      {/* 4 Indicadores Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="eyebrow">Costos Fijos / Mes</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">
            S/ {FINANCIAL_METRICS.totalMonthlyFixedCost.toFixed(2)}
          </span>
          <span className="text-xs text-[#555869]">Alquiler, servicios, hosting y mermas</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="eyebrow">Meta de Producción</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">
            {FINANCIAL_METRICS.estimatedMonthlyUnits} porc.
          </span>
          <span className="text-xs text-[#555869]">P. de equilibrio: {FINANCIAL_METRICS.breakEvenMonthlyUnits} uds.</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <span className="eyebrow">Patrimonio Total</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">
            S/ {TOTAL_EQUITY.totalPatrimonio.toFixed(2)}
          </span>
          <span className="text-xs text-[#555869]">Capital suscrito de los 4 socios</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <Building className="w-4 h-4" />
          </div>
          <span className="eyebrow">CF por Porción</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">
            S/ {FINANCIAL_METRICS.fixedCostPerUnit.toFixed(2)}
          </span>
          <span className="text-xs text-[#555869]">Factor de absorción por receta</span>
        </div>
      </div>

      {/* Cuadrícula de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de Costos Fijos */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
              Desglose de Costos Fijos
            </h3>
            <span className="text-xs font-bold text-[#555869]">
              Total: S/ {FINANCIAL_METRICS.totalMonthlyFixedCost.toFixed(2)} / mes
            </span>
          </div>

          <div className="living-card overflow-hidden">
            <table className="living-table w-full">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th className="text-right">Monto (S/)</th>
                </tr>
              </thead>
              <tbody>
                {FIXED_COSTS_DATA.map((item, i) => (
                  <tr key={i}>
                    <td className="font-bold text-[#1a1b21]">{item.concept}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/5 text-[#555869]">
                        {item.category}
                      </span>
                    </td>
                    <td className="text-right font-extrabold text-[#1a1b21] tabular-nums">
                      S/ {item.monthlyCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estructura de Socios Fundadores */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
              Socios y Participación
            </h3>
            <span className="text-xs font-bold text-[#555869]">
              Patrimonio: S/ {TOTAL_EQUITY.totalPatrimonio.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PARTNERS_DATA.map((partner, i) => (
              <div key={i} className="living-card p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1a1b21] text-white font-bold text-sm flex items-center justify-center">
                    {partner.initials || partner.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1b21] m-0 leading-tight">
                      {partner.name}
                    </h4>
                    <span className="text-xs text-[#555869]">{partner.role}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/6 flex items-center justify-between text-xs">
                  <span className="text-[#555869] font-medium">Aporte:</span>
                  <span className="font-bold text-[#1a1b21] tabular-nums text-sm">
                    S/ {partner.amount.toFixed(2)} ({partner.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
