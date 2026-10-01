'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { BookOpen, Sparkles, HeartPulse, Clock } from 'lucide-react';

interface Article {
  id: string;
  category: string;
  readTime: string;
  title: string;
  summary: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'cycle-variability',
    category: 'Rhythm Basics',
    readTime: '3 min read',
    title: 'Understanding natural cycle length fluctuations',
    summary:
      'Why a 26-day cycle one month followed by a 30-day cycle the next is completely normal biological variation.',
    content: [
      'Menstrual cycles are governed by a continuous hormonal dialogue between the hypothalamus, pituitary gland, and ovaries.',
      'Unlike a mechanical clock, healthy cycle lengths naturally fluctuate by 2 to 7 days from month to month due to travel, stress, illness, or sleep changes.',
      'Tracking your patterns over 3 to 6 months establishes your personal rhythm envelope rather than trying to fit a rigid 28-day standard.',
    ],
  },
  {
    id: 'follicular-luteal',
    category: 'Hormonal Phases',
    readTime: '4 min read',
    title: 'The dynamic shift: Follicular vs. Luteal phase',
    summary:
      'How estrogen and progesterone orchestrate shifts in body temperature, resting heart rate, and natural energy.',
    content: [
      'The follicular phase begins on day 1 of menstruation. Rising estrogen stimulates follicle growth and often brings increasing mental sharpness and physical stamina.',
      'Following ovulation, the corpus luteum produces progesterone. This phase (the luteal phase) naturally stabilizes uterine lining and gently elevates basal body temperature.',
      'Recognizing this natural arc allows you to plan demanding physical projects for your follicular peak and schedule restorative self-care for your late luteal days.',
    ],
  },
  {
    id: 'cervical-fluid',
    category: 'Biological Biomarkers',
    readTime: '3 min read',
    title: 'Observing cervical fluid as an informational sign',
    summary:
      'A non-invasive biomarker that shifts from dry to creamy to egg-white consistency as ovulation approaches.',
    content: [
      'Cervical fluid consistency shifts predictably in response to fluctuating estrogen levels.',
      'Early in the cycle, fluid is often minimal or dry. Approaching ovulation, high estrogen triggers clear, stretchy fluid resembling raw egg white.',
      'Understanding this biomarker provides helpful rhythm literacy, though it should never replace verified clinical tests.',
    ],
  },
];

export const EducationalInsightList: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sage" />
            <h3 className="font-serif text-lg font-medium text-oviareText-primary">
              Cycle Literacy & Science
            </h3>
          </div>
          <span className="text-xs text-oviareText-secondary">Evidence-informed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARTICLES.map((article) => (
            <Card
              key={article.id}
              variant="default"
              padding="md"
              className="flex flex-col justify-between hover:border-plum/40 hover:shadow-floating transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant="mauve" size="sm">
                    {article.category}
                  </Badge>
                  <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
                <h4 className="font-serif text-base font-medium text-oviareText-primary leading-snug">
                  {article.title}
                </h4>
                <p className="mt-2 text-xs text-oviareText-secondary line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-oviareBorder/60">
                <button
                  type="button"
                  onClick={() => setActiveArticle(article)}
                  className="text-xs font-medium text-plum hover:text-plum-dark transition-colors"
                >
                  Read full article →
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!activeArticle}
        onClose={() => setActiveArticle(null)}
        title={activeArticle?.title}
        maxWidth="lg"
      >
        {activeArticle && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-oviareBorder text-xs text-oviareText-secondary">
              <Badge variant="mauve" size="sm">
                {activeArticle.category}
              </Badge>
              <span>•</span>
              <span>{activeArticle.readTime}</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-oviareText-secondary">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder text-[11px] text-oviareText-secondary">
              <strong className="text-oviareText-primary font-medium">Informational Notice:</strong>{' '}
              This material is designed for personal health education and cycle awareness. It is not medical or diagnostic advice.
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
