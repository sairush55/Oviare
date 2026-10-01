import React from 'react';
import { Badge } from '../ui/Badge';

export const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-oviareBorder text-xs text-oviareText-secondary">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Logged Period */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-plum flex items-center justify-center text-white text-[9px] font-bold">
            •
          </span>
          <span className="font-medium text-oviareText-primary">Logged period</span>
        </div>

        {/* Predicted Period */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md border-2 border-dashed border-plum bg-mauve/40" />
          <span>Predicted period (Est.)</span>
        </div>

        {/* Estimated Fertile Window */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-sage/20 border border-sage/40 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
          </span>
          <span>Estimated fertile days</span>
        </div>

        {/* Logged Note / Symptoms */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-oviareText-primary" />
          <span>Logged symptoms</span>
        </div>
      </div>

      <Badge variant="sample" size="sm">
        Sample rhythm model
      </Badge>
    </div>
  );
};
