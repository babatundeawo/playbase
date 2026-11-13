import { useEffect, useMemo, useState } from 'react';
import { friendHint } from '../game/lifelines.ts';
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

export function PhoneFriendModal({ open, onClose, question, level, eliminated }: Props) {
  const [left, setLeft] = useState(30);
  // Decided once per opening so the friend never changes their mind.
  const hint = useMemo(() => (open ? friendHint(question, level, eliminated) : null), [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    setLeft(30);
    const id = window.setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={<><Icon name="phone" /> Phone a friend</>} titleId="phone-title" center footer={<button type="button" className="btn btn--gold" onClick={onClose} data-autofocus>Thanks</button>}>
      {hint && (
        <div className="phone">
          <div className="phone__dial" data-urgent={left <= 10} aria-hidden="true">
            {left}
          </div>
          <p className="phone__quote">
            “{hint.phrase} {hint.letter}: {hint.text}.”
          </p>
          <p className="field__hint">Your friend could be wrong. The call is only a guide.</p>
        </div>
      )}
    </Modal>
  );
}
