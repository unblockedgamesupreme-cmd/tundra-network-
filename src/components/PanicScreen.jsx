import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export const PanicScreen = ({ onExit }) => {
  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-800 font-sans p-8 overflow-y-auto">
      {/* Top Google Docs style toolbar */}
      <div className="max-w-5xl mx-auto border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Research_Paper_Glaciology_2026.docx
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Saved to Cloud
              </span>
            </h1>
            <p className="text-xs text-slate-500">File &bull; Edit &bull; View &bull; Insert &bull; Format &bull; Tools &bull; Extensions &bull; Help</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
          title="Press Esc or click to return to Tundra Network Games"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to App (Esc)
        </button>
      </div>

      {/* Mock Academic Document Body */}
      <div className="max-w-3xl mx-auto bg-white p-10 border border-slate-200 shadow-sm rounded text-slate-700 leading-relaxed text-sm space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2">
          An Analysis of Cryospheric Processes & Polar Ice Sheet Dynamics
        </h2>
        <p className="text-xs text-slate-500 italic">
          Department of Earth & Atmospheric Sciences | Academic Research Draft | July 2026
        </p>

        <h3 className="text-lg font-semibold text-slate-800 mt-4">1. Abstract & Introduction</h3>
        <p>
          The Earth’s cryosphere plays a critical role in regulating global climate patterns through the albedo effect and thermohaline ocean circulation. Polar ice sheets store over 68% of the planet's fresh water reserves. This paper investigates thermal conductivity within firn layers and seasonal ice pack dynamics across high-latitude boreal regions.
        </p>

        <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded my-4 text-xs text-slate-600">
          <strong>Key Note:</strong> Sub-surface meltwater channels demonstrate non-linear fluid dynamics under varying ambient temperature gradients. Further numerical modeling is required to calibrate predictive ocean level rise models.
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mt-4">2. Methodology & Observational Data</h3>
        <p>
          Data samples were acquired using high-resolution synthetic aperture radar (SAR) and remote satellite telemetry across Greenland's inland ice sheet. Core temperature profiles were gathered at 50-meter depth increments using thermal probe arrays.
        </p>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-center">
            <span className="block text-lg font-bold text-blue-900">-18.4 °C</span>
            <span className="text-[10px] text-blue-700">Mean Core Temp</span>
          </div>
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-center">
            <span className="block text-lg font-bold text-blue-900">1,420 m</span>
            <span className="text-[10px] text-blue-700">Ice Sheet Depth</span>
          </div>
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-center">
            <span className="block text-lg font-bold text-blue-900">0.84 Albedo</span>
            <span className="text-[10px] text-blue-700">Surface Reflectance</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pt-8 border-t border-slate-100">
          [Press <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-slate-700 font-mono">Esc</kbd> or click top right button to resume app]
        </p>
      </div>
    </div>
  );
};
