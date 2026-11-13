import { type ReactNode, useEffect, useRef } from 'react';
import { Icon } from './Icon.tsx';

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleId: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Centre the dialog on phones instead of docking it to the bottom. */
  center?: boolean;
  hideClose?: boolean;
}

/**
 * A modal built on the native <dialog> element. The browser provides the focus
 * trap, the Escape key, the inert page behind it and focus return on close.
 */
export function Modal({ open, onClose, title, titleId, children, footer, wide, center, hideClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog${wide ? ' dialog--wide' : ''}${center ? ' dialog--center' : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <>
          <div className="dialog__head">
            <h2 className="dialog__title" id={titleId}>
              {title}
            </h2>
            {!hideClose && (
              <button type="button" className="btn btn--quiet" onClick={onClose} aria-label="Close">
                <Icon name="x" />
              </button>
            )}
          </div>
          <div className="dialog__body">{children}</div>
          {footer && <div className="dialog__foot">{footer}</div>}
        </>
      )}
    </dialog>
  );
}
