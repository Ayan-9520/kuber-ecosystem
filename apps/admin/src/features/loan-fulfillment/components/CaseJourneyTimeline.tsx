import { getStageIndex, getStageLabel, isTerminalStage, JOURNEY_STAGES } from '../data/stages';
import type { LoanCaseStage, LoanCaseTimelineEvent } from '../data/types';

import { formatDateTime } from '@/lib/utils';

interface CaseJourneyTimelineProps {
  currentStage: LoanCaseStage;
  events?: LoanCaseTimelineEvent[];
  compact?: boolean;
}

function eventForStage(events: LoanCaseTimelineEvent[] | undefined, stage: LoanCaseStage) {
  if (!events?.length) return undefined;
  return [...events].reverse().find((e) => e.stage === stage);
}

export function CaseJourneyTimeline({ currentStage, events, compact }: CaseJourneyTimelineProps) {
  const currentIdx = getStageIndex(currentStage);
  const terminal = isTerminalStage(currentStage) && currentStage !== 'COMPLETED';

  return (
    <div>
      {terminal && (
        <div className="lf-stage-pill lf-stage-pill--terminal" style={{ marginBottom: '1rem' }}>
          {getStageLabel(currentStage)}
        </div>
      )}
      <ol className="lf-timeline" aria-label="Case journey">
        {JOURNEY_STAGES.map((stage, idx) => {
          const event = eventForStage(events, stage.id);
          let state: 'done' | 'current' | 'upcoming' = 'upcoming';
          if (currentStage === 'COMPLETED') {
            state = 'done';
          } else if (terminal) {
            state = idx < currentIdx || currentIdx < 0 ? 'done' : 'upcoming';
          } else if (idx < currentIdx) {
            state = 'done';
          } else if (idx === currentIdx) {
            state = 'current';
          }

          return (
            <li key={stage.id} className={`lf-timeline__item is-${state}`}>
              <span className="lf-timeline__dot" aria-hidden />
              <p className="lf-timeline__title">{stage.label}</p>
              {!compact && (
                <p className="lf-timeline__meta">
                  {event
                    ? [
                        event.title !== stage.label ? event.title : null,
                        event.performedBy,
                        event.createdAt ? formatDateTime(event.createdAt) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Recorded'
                    : state === 'current'
                      ? 'In progress'
                      : state === 'done'
                        ? 'Completed'
                        : 'Upcoming'}
                  {event?.description ? ` — ${event.description}` : ''}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
