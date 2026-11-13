import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AnswerButton, type AnswerState } from '../components/AnswerButton.tsx';
import { AudienceModal } from '../components/AudienceModal.tsx';
import { Icon } from '../components/Icon.tsx';
import { LifelineButton } from '../components/LifelineButton.tsx';
import { Modal } from '../components/Modal.tsx';
import { MoneyLadder } from '../components/MoneyLadder.tsx';
import { PhoneFriendModal } from '../components/PhoneFriendModal.tsx';
import { buildDeck } from '../game/deck.ts';
import { currentLevel, currentQuestion, initGame, reduce } from '../game/engine.ts';
import { formatNaira, LADDER, prizeAt, walkAwayPrize } from '../game/ladder.ts';
import { pickFiftyFifty } from '../game/lifelines.ts';
import { LETTERS, type Letter, type Question } from '../game/types.ts';
import * as sound from '../hooks/useSound.ts';
import { buzz } from '../lib/haptics.ts';
import { generateQuestions } from '../lib/groq.ts';
import { navigate } from '../lib/router.ts';
import { saveResult } from '../lib/session.ts';
import { getSettings, recordResult, updateSettings, useSettings } from '../lib/settings.ts';

const SUSPENSE_MS = 1700;
const AFTER_RIGHT_MS = 2000;
const AFTER_WRONG_MS = 2400;

/** Loads a deck: AI questions if the player enabled them, otherwise (or on any failure) the built-in bank. */
function useDeck() {
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const ai = useRef(getSettings().aiEnabled && !!getSettings().aiKey);

  useEffect(() => {
    const ctl = new AbortController();
    const s = getSettings();
    (async () => {
      if (ai.current) {
        try {
          const q = await generateQuestions({ apiKey: s.aiKey, model: s.aiModel, topic: s.aiTopic, signal: ctl.signal });
          if (!ctl.signal.aborted) setDeck(q);
          return;
        } catch (e) {
          if (ctl.signal.aborted) return;
          setNotice(`${e instanceof Error ? e.message : 'AI questions failed.'} Using the built-in questions instead.`);
        }
      }
      if (!ctl.signal.aborted) setDeck(buildDeck());
    })();
    return () => ctl.abort();
  }, []);

  return { deck, notice, usingAi: ai.current && !notice };
}

export default function Game() {
  const { deck, notice, usingAi } = useDeck();
  useEffect(() => {
    document.title = 'Playing | Millionaire Mindset';
  }, []);

  if (!deck) {
    return (
      <div className="loading" role="status">
        <div className="spinner" aria-hidden="true" />
        <p>{ai() ? 'Writing your quiz with AI…' : 'Shuffling the questions…'}</p>
      </div>
    );
  }
  return <Board deck={deck} notice={notice} usingAi={usingAi} />;
}

const ai = () => getSettings().aiEnabled && !!getSettings().aiKey;

function Board({ deck, notice, usingAi }: { deck: Question[]; notice: string | null; usingAi: boolean }) {
  const settings = useSettings();
  const [s, dispatch] = useReducer(reduce, deck, initGame);
  const [modal, setModal] = useState<null | 'phone' | 'audience' | 'walk' | 'ladder'>(null);
  const [live, setLive] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showNotice, setShowNotice] = useState(!!notice);

  const q = currentQuestion(s);
  const level = currentLevel(s);
  const canAct = (s.phase === 'answering' || s.phase === 'selected') && modal === null;
  const soundOn = settings.sfx || settings.music;

  // Tension music while the player is thinking.
  const thinking = (s.phase === 'answering' || s.phase === 'selected') && modal !== 'walk';
  useEffect(() => {
    if (!thinking) return;
    sound.startThinkingMusic();
    return () => sound.stopThinkingMusic();
  }, [thinking, s.index, settings.music]);

  // Drive the reveal sequence. Every timer is cleaned up, so leaving the page can never trigger a stray redirect.
  useEffect(() => {
    let id: number | undefined;
    if (s.phase === 'locked') {
      sound.playAnswerSelected();
      buzz(25);
      setLive(`Final answer ${s.selected}. Locked in.`);
      id = window.setTimeout(() => dispatch({ type: 'reveal' }), SUSPENSE_MS);
    } else if (s.phase === 'revealed') {
      const right = s.verdict === 'correct';
      if (right) {
        sound.playCorrect();
        buzz([30, 40, 30]);
        setLive('Correct!');
      } else {
        sound.playWrong();
        buzz(220);
        const c = q.options.find((o) => o.letter === q.correct)!;
        setLive(`Incorrect. The correct answer was ${c.letter}: ${c.text}.`);
      }
      id = window.setTimeout(() => {
        if (right) (s.index === 14 ? sound.playWin : LADDER[s.index + 1]?.haven ? sound.playSafeHaven : sound.playLevelUp)();
        dispatch({ type: 'advance' });
      }, right ? AFTER_RIGHT_MS : AFTER_WRONG_MS);
    } else if (s.phase === 'finished' && s.result) {
      const result = s.result;
      saveResult(result);
      recordResult(result);
      if (result.outcome === 'win') sound.playWin();
      if (result.outcome === 'walkaway') sound.playWalkAway();
      id = window.setTimeout(() => navigate('/result', true), result.outcome === 'win' ? 1800 : 450);
    }
    return () => window.clearTimeout(id);
  }, [s.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Announce and focus each new question.
  useEffect(() => {
    if (s.phase !== 'answering' || s.selected) return;
    setLive(`Question ${level} of 15, for ${formatNaira(prizeAt(level))}.`);
    titleRef.current?.focus({ preventScroll: true });
  }, [s.index]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = useCallback(
    (letter: Letter) => {
      if (!canAct || s.eliminated.includes(letter)) return;
      if (settings.confirm && s.selected === letter) {
        dispatch({ type: 'lock' });
        return;
      }
      dispatch({ type: 'select', letter, confirm: settings.confirm });
      if (settings.confirm) setLive(`Selected ${letter}. Press Final answer to lock it in.`);
      buzz(10);
    },
    [canAct, s.eliminated, s.selected, settings.confirm],
  );

  // Keyboard: A-D or 1-4 pick (again to lock), Enter locks.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !canAct) return;
      const map: Record<string, Letter> = { a: 'A', b: 'B', c: 'C', d: 'D', '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      const l = map[e.key.toLowerCase()];
      if (l) pick(l);
      else if (e.key === 'Enter' && s.phase === 'selected' && document.activeElement?.tagName !== 'BUTTON') dispatch({ type: 'lock' });
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [canAct, pick, s.phase]);

  const stateOf = (letter: Letter): AnswerState => {
    if (s.eliminated.includes(letter)) return 'gone';
    if (s.phase === 'revealed') {
      if (letter === q.correct) return 'correct';
      if (letter === s.selected) return 'wrong';
      return 'dim';
    }
    if (letter === s.selected) return s.phase === 'locked' ? 'locked' : 'selected';
    return s.phase === 'locked' ? 'dim' : 'idle';
  };

  const status =
    s.phase === 'revealed'
      ? s.verdict === 'correct'
        ? { text: 'Correct!', tone: 'ok' }
        : { text: 'Not quite.', tone: 'bad' }
      : s.phase === 'locked'
        ? { text: 'Locked in. Is it right?', tone: '' }
        : s.phase === 'selected'
          ? { text: `Selected ${s.selected}.`, tone: '' }
          : { text: settings.confirm ? 'Tap an answer, then lock it in.' : 'Tap an answer to lock it in.', tone: '' };

  const toggleSound = () => {
    const on = !soundOn;
    updateSettings({ sfx: on, music: on });
    if (!on) sound.stopThinkingMusic();
  };

  const fifty = () => {
    dispatch({ type: 'fifty', eliminated: pickFiftyFifty(q) });
    setLive('50:50 used. Two wrong answers removed.');
  };

  return (
    <div className="game">
      <header className="game__bar">
        <div className="container game__bar-inner">
          <div className="game__group">
            <LifelineButton kind="fifty" used={s.used.fifty} disabled={!canAct} onClick={fifty} />
            <LifelineButton
              kind="phone"
              used={s.used.phone}
              disabled={!canAct}
              onClick={() => {
                dispatch({ type: 'phone' });
                sound.playPhoneRing();
                setModal('phone');
              }}
            />
            <LifelineButton
              kind="audience"
              used={s.used.audience}
              disabled={!canAct}
              onClick={() => {
                dispatch({ type: 'audience' });
                sound.playAudienceReveal();
                setModal('audience');
              }}
            />
          </div>
          <p className="counter">
            Question {level} / 15
            {usingAi && (
              <>
                {' '}
                <span className="chip">
                  <Icon name="sparkles" size={14} /> AI
                </span>
              </>
            )}
          </p>
          <div className="game__group">
            <button type="button" className="btn btn--quiet lg-hide" onClick={() => setModal('ladder')} aria-label="Show prize ladder">
              <Icon name="ladder" />
            </button>
            <button type="button" className="btn btn--quiet" onClick={toggleSound} aria-label={soundOn ? 'Mute sound' : 'Turn sound on'} aria-pressed={!soundOn}>
              <Icon name={soundOn ? 'volume' : 'mute'} />
            </button>
            <button type="button" className="btn btn--ghost" disabled={!canAct} onClick={() => setModal('walk')} aria-label="Walk away">
              <Icon name="exit" size={20} />
              <span className="hide-sm">Walk away</span>
            </button>
          </div>
        </div>
        <div className="rail" aria-hidden="true">
          {LADDER.map((r) => (
            <i key={r.level} className={`${r.level < level ? 'is-done' : r.level === level ? 'is-now' : ''}${r.haven ? ' is-haven' : ''}`} />
          ))}
        </div>
        <p className="sr-only">
          Question {level} of 15
        </p>
      </header>

      <div className="game__main">
        <section className="board" aria-label="Question" key={s.index}>
          {showNotice && notice && (
            <div className="notice" role="status">
              <span style={{ flex: 1 }}>{notice}</span>
              <button type="button" className="btn btn--quiet" style={{ minHeight: 24 }} onClick={() => setShowNotice(false)} aria-label="Dismiss message">
                <Icon name="x" size={16} />
              </button>
            </div>
          )}
          <p className="playing-for">
            <span>Question {level} of 15 · Playing for</span>
            <b>{formatNaira(prizeAt(level))}</b>
            {LADDER[level - 1].haven && (
              <span className="chip">
                <Icon name="gem" size={14} /> Safe haven
              </span>
            )}
          </p>
          <div className="qcard">
            <h1 ref={titleRef} tabIndex={-1}>
              {q.text}
            </h1>
          </div>
          <div className="answers" role="group" aria-label="Answers">
            {q.options.map((o) => (
              <AnswerButton key={o.letter} letter={o.letter} text={o.text} state={stateOf(o.letter)} disabled={!canAct || s.eliminated.includes(o.letter)} onClick={() => pick(o.letter)} />
            ))}
          </div>
          <div className="lockbar">
            {settings.confirm && (
              <button type="button" className="btn btn--gold btn--xl" disabled={s.phase !== 'selected'} onClick={() => dispatch({ type: 'lock' })}>
                <Icon name="lock" size={20} /> {s.phase === 'selected' ? `Final answer: ${s.selected}` : 'Final answer'}
              </button>
            )}
            <p className="lockbar__status" data-tone={status.tone}>
              {status.text}{(s.phase === 'answering' || s.phase === 'selected') && <span className="kbd-hint"> Keys A–D also work.</span>}
            </p>
          </div>
        </section>
        <aside className="ladder-side" aria-label="Prize ladder">
          <MoneyLadder level={level} />
        </aside>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {live}
      </div>

      <PhoneFriendModal open={modal === 'phone'} onClose={() => setModal(null)} question={q} level={level} eliminated={s.eliminated} />
      <AudienceModal open={modal === 'audience'} onClose={() => setModal(null)} question={q} level={level} eliminated={s.eliminated} />
      <Modal open={modal === 'ladder'} onClose={() => setModal(null)} title="Prize ladder" titleId="ladder-title">
        <MoneyLadder level={level} />
      </Modal>
      <Modal
        open={modal === 'walk'}
        onClose={() => setModal(null)}
        title={<><Icon name="exit" /> Walk away?</>}
        titleId="walk-title"
        center
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setModal(null)} data-autofocus>
              Keep playing
            </button>
            <button
              type="button"
              className="btn btn--gold"
              onClick={() => {
                setModal(null);
                dispatch({ type: 'walkaway' });
              }}
            >
              Walk away
            </button>
          </>
        }
      >
        <p>
          You will take home <strong>{formatNaira(walkAwayPrize(level))}</strong> and the game ends.
        </p>
      </Modal>
    </div>
  );
}
