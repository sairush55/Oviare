'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { BookOpen, ArrowRight } from 'lucide-react';

export const EducationalCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card variant="subtle-sage" padding="md" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sage">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cycle Literacy</span>
            </span>
            <Badge variant="sage" size="sm">
              Luteal Phase
            </Badge>
          </div>

          <h3 className="font-serif text-base font-medium text-oviareText-primary">
            Why energy levels naturally shift in the luteal phase
          </h3>
          <p className="mt-2 text-xs text-oviareText-secondary leading-relaxed">
            Following ovulation, progesterone rises to support uterine lining preparation. This gentle metabolic shift often brings a natural desire for quiet focus, nourishing warmth, and restorative sleep.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-sage/15 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-medium text-sage hover:text-sage-dark inline-flex items-center gap-1 transition-colors"
          >
            <span>Read brief overview</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <Link
            href="/insights"
            className="text-[11px] text-oviareText-secondary hover:text-oviareText-primary"
          >
            All insights
          </Link>
        </div>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Understanding the Luteal Phase"
      >
        <div className="space-y-3 text-xs leading-relaxed text-oviareText-secondary">
          <p>
            The luteal phase occupies the second half of the menstrual cycle, beginning after ovulation and continuing until menstruation starts.
          </p>
          <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder space-y-1.5">
            <h4 className="font-medium text-oviareText-primary">Key biological patterns:</h4>
            <ul className="list-disc pl-4 space-y-1 text-oviareText-secondary">
              <li><strong className="text-oviareText-primary">Progesterone peak:</strong> Supports core body temperature rise (~0.3°C - 0.5°C).</li>
              <li><strong className="text-oviareText-primary">Nutrient metabolism:</strong> Slightly higher resting caloric expenditure.</li>
              <li><strong className="text-oviareText-primary">Restful pacing:</strong> High-intensity workouts can feel heavier; gentle resistance or walking often feels restorative.</li>
            </ul>
          </div>
          <p className="text-[11px] text-oviareText-muted italic">
            This informational overview is for educational understanding and is not medical advice.
          </p>
        </div>
      </Modal>
    </>
  );
};
