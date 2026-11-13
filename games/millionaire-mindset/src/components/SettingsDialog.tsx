import { useState } from 'react';
import { GROQ_MODELS, resolveModel } from '../lib/groq.ts';
import { resetStats, type ThemePref, updateSettings, useSettings } from '../lib/settings.ts';
import { Icon } from './Icon.tsx';
import { Modal } from './Modal.tsx';
import { Switch } from './Switch.tsx';

const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const model = resolveModel(s.aiModel);

  return (
    <Modal open={open} onClose={onClose} title="Settings" titleId="settings-title">
      <fieldset className="fieldset">
        <legend>Appearance</legend>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <label key={t.id}>
              <input type="radio" name="theme" value={t.id} checked={s.theme === t.id} onChange={() => updateSettings({ theme: t.id })} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>Sound and feel</legend>
        <Switch checked={s.sfx} onChange={(v) => updateSettings({ sfx: v })} label="Sound effects" />
        <Switch checked={s.music} onChange={(v) => updateSettings({ music: v })} label="Tension music" hint="Plays while you think about an answer." />
        <Switch checked={s.haptics} onChange={(v) => updateSettings({ haptics: v })} label="Vibration" hint="On phones that support it." />
      </fieldset>

      <fieldset className="fieldset">
        <legend>Gameplay</legend>
        <Switch checked={s.confirm} onChange={(v) => updateSettings({ confirm: v })} label="Ask “Final answer?”" hint="Tap an answer, then confirm. Turn off to lock in with one tap." />
      </fieldset>

      <fieldset className="fieldset">
        <legend>AI questions (optional)</legend>
        <Switch
          checked={s.aiEnabled}
          onChange={(v) => updateSettings({ aiEnabled: v && s.aiKey.trim().length > 0 })}
          label={
            <span>
              <Icon name="sparkles" size={16} /> Fresh AI quiz each game
            </span>
          }
          hint={s.aiKey.trim() ? 'Uses your Groq key. Falls back to built-in questions if anything fails.' : 'Add a Groq key below to turn this on.'}
        />
        <div className="field">
          <label className="field__label" htmlFor="groq-key">
            Groq API key
          </label>
          <div className="input-row">
            <input
              id="groq-key"
              className="input"
              type={showKey ? 'text' : 'password'}
              value={s.aiKey}
              onChange={(e) => updateSettings({ aiKey: e.target.value.trim(), ...(e.target.value.trim() ? {} : { aiEnabled: false }) })}
              placeholder="gsk_…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
            />
            <button type="button" className="btn btn--ghost" onClick={() => setShowKey((v) => !v)} aria-label={showKey ? 'Hide key' : 'Show key'} aria-pressed={showKey}>
              <Icon name={showKey ? 'eyeoff' : 'eye'} />
            </button>
          </div>
          <p className="field__hint">
            Stored only in this browser and sent only to Groq. It is never saved in the website’s code.{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
              Get a free key
            </a>
            .
          </p>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="groq-model">
            Model
          </label>
          <select id="groq-model" className="input" value={model} onChange={(e) => updateSettings({ aiModel: e.target.value })}>
            {GROQ_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="groq-topic">
            Topic (optional)
          </label>
          <input id="groq-topic" className="input" type="text" value={s.aiTopic} maxLength={80} onChange={(e) => updateSettings({ aiTopic: e.target.value })} placeholder="e.g. football, world history" />
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>Your record</legend>
        <p className="field__hint">Your games, wins and best prize are saved on this device only.</p>
        {confirmReset ? (
          <div className="input-row">
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                resetStats();
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(true)}>
            Reset my record
          </button>
        )}
      </fieldset>
    </Modal>
  );
}
