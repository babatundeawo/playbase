import { useMemo } from 'react';
import { audiencePoll } from '../game/lifelines.ts';
import type { Letter, Question } from '../game/types.ts';
import { Icon } from './Icon.tsx';
import { Modal } from './Modal.tsx';

interface Props {
  open: boolean;
  onClose: () => void;
  question: Question;
  level: number;
  eliminated: readonly Letter[];
}

export function AudienceModal({ open, onClose, question, level, eliminated }: Props) {
  const votes = useMemo(() => (open ? audiencePoll(question, level, eliminated) : []), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = votes.reduce((a, v) => (v.percent > a ? v.percent : a), 0);
  return (
    <Modal open={open} onClose={onClose} title={<><Icon name="users" /> Ask the audience</>} titleId="aud-title" center footer={<button type="button" className="btn btn--gold" onClick={onClose} data-autofocus>Continue</button>}>
      <ul className="votes" aria-label="Audience votes">
        {votes.map((v, i) => (
          <li key={v.letter} className="vote" data-top={v.percent === top && top > 0} style={{ '--p': v.percent / 100, '--i': i } as React.CSSProperties}>
            <span>{v.letter}</span>
            <span className="vote__bar" aria-hidden="true">
              <span className="vote__fill" style={{ display: 'block' }} />
            </span>
            <output>{v.percent}%</output>
          </li>
        ))}
      </ul>
      <p className="field__hint">The audience is a guide, not a guarantee.</p>
    </Modal>
  );
}
