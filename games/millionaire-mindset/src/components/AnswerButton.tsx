import type { Letter } from '../game/types.ts';
import { Icon } from './Icon.tsx';

export type AnswerState = 'idle' | 'selected' | 'locked' | 'correct' | 'wrong' | 'gone' | 'dim';

interface Props {
  letter: Letter;
  text: string;
  state: AnswerState;
  disabled: boolean;
  onClick: () => void;
}

export function AnswerButton({ letter, text, state, disabled, onClick }: Props) {
  const status = state === 'correct' ? ', correct' : state === 'wrong' ? ', incorrect' : state === 'gone' ? ', removed by 50:50' : state === 'locked' ? ', locked in' : '';
  return (
    <button
      type="button"
      className="answer"
      data-state={state}
      disabled={disabled}
      aria-pressed={state === 'selected' || state === 'locked'}
      aria-label={`${letter}: ${text}${status}`}
      onClick={onClick}
    >
      <span className="answer__letter" aria-hidden="true">
        {state === 'correct' ? <Icon name="check" size={20} /> : state === 'wrong' ? <Icon name="x" size={20} /> : letter}
      </span>
      <span className="answer__text" aria-hidden="true">
        {text}
      </span>
    </button>
  );
}
