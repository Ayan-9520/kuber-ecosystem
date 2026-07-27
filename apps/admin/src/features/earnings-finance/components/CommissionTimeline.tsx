import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

import type { StatusTimelineEvent } from '../data/types';

interface CommissionTimelineProps {
  events: StatusTimelineEvent[];
  title?: string;
}

export function CommissionTimeline({ events, title = 'Status timeline' }: CommissionTimelineProps) {
  const ordered = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="earnings-timeline">
      <h4 className="earnings-timeline__title">{title}</h4>
      <ol className="earnings-timeline__list">
        {ordered.map((event, index) => (
          <li key={event.id} className="earnings-timeline__item">
            <span className="earnings-timeline__dot" aria-hidden />
            {index < ordered.length - 1 ? <span className="earnings-timeline__line" aria-hidden /> : null}
            <div className="earnings-timeline__body">
              <div className="earnings-timeline__head">
                <StatusBadge status={event.status} />
                <span className="earnings-timeline__label">{event.label}</span>
              </div>
              <p className="earnings-timeline__meta">
                {formatDate(event.at)} · {event.by} · {event.actor}
              </p>
              {event.comment ? <p className="earnings-timeline__comment">{event.comment}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
