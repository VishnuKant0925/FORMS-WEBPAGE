'use client';
/**
 * TransliterateField — Always-on phonetic transliteration input.
 *
 * ROOT-CAUSE FIX (2026-06-18):
 *  The library (IndicTransliterate) passes its own `value`, `onChange`,
 *  `onKeyDown`, `onBlur`, and `ref` through `renderComponent(props)`.
 *  Previously we spread `{...libProps}` FIRST and then `{...sharedProps}`,
 *  which overrode the library's internal `value` and `onChange` — completely
 *  disabling transliteration. The fix: put `{...libProps}` LAST so only
 *  non-critical styling props are superseded.
 *
 * Behaviour:
 *  - User types Roman text → suggestions appear (dropdown)
 *  - Pressing SPACE / ENTER / TAB accepts the top Hindi suggestion
 *  - Focus leaving the field also auto-accepts (`insertCurrentSelectionOnBlur`)
 *  - Final Hindi value is stored in react-hook-form state → saved to DB
 *  - NEVER store Roman intermediary text
 */

import { IndicTransliterate } from '@ai4bharat/indic-transliterate';
import { useTranslitStore } from '@/store/useTranslitStore';

interface TransliterateFieldProps {
  fieldNumber?:    string;
  labelHindi:      string;
  labelEnglish:    string;
  name:            string;
  value:           string;
  onChange:        (name: string, value: string) => void;
  langOverride?:   string;
  multiline?:      boolean;
  required?:       boolean;
  rows?:           number;
  placeholder?:    string;
  errorMessage?:   string;
  inputClassName?: string;
  disabled?:       boolean;
  maxLength?:      number;
}

const HINDI_FONT_STYLE = {
  fontFamily: '"Noto Sans Devanagari", "Noto Sans", Arial, sans-serif',
};

export default function TransliterateField({
  fieldNumber,
  labelHindi,
  labelEnglish,
  name,
  value,
  onChange,
  langOverride,
  multiline      = false,
  required       = false,
  rows           = 3,
  placeholder,
  errorMessage,
  inputClassName = '',
  disabled,
  maxLength,
}: TransliterateFieldProps) {
  const { lang } = useTranslitStore();
  const activeLang = langOverride ?? lang;

  const apiProxyUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/xlit-api-proxy/';

  const baseClass = [
    'form-input',
    multiline ? 'resize-none' : '',
    errorMessage ? 'form-input-error' : '',
    inputClassName,
  ].filter(Boolean).join(' ');

  /* ─────────────────────────────────────────────────────────────
   * CRITICAL: Our styling props go FIRST.
   * `{...libProps}` comes LAST so the library's own:
   *   - value        (library-managed input text)
   *   - onChange     (handleChange — intercepts keystrokes)
   *   - onKeyDown    (handleKeyDown — detects space/enter)
   *   - onBlur       (handleBlur — insertCurrentSelectionOnBlur)
   *   - ref          (inputRef — for caret position)
   * all win over our defaults.
   * ───────────────────────────────────────────────────────────── */
  const renderInput = (libProps: Record<string, unknown>) => {
    const { className: libClassName, style: libStyle, ...otherLibProps } = libProps;

    const mergedStyle = {
      ...HINDI_FONT_STYLE,
      ...(libStyle as React.CSSProperties | undefined),
    };
    // Merge class names — ours + library's (library may add suggestion styles)
    const mergedClass = [
      baseClass,
      typeof libClassName === 'string' ? libClassName : '',
    ].filter(Boolean).join(' ');

    // Shared static props (not value/onChange — those come from otherLibProps)
    const staticProps = {
      id:             name,
      name,
      required,
      placeholder,
      disabled,
      maxLength,
      'aria-invalid':       !!errorMessage,
      'aria-describedby':   errorMessage ? `${name}-error` : undefined,
      'aria-required':      required,
    };

    if (multiline) {
      return (
        <textarea
          {...staticProps}
          rows={rows}
          // otherLibProps controls value, onChange, onKeyDown, onBlur, ref
          {...otherLibProps}
          className={mergedClass}
          style={mergedStyle}
        />
      );
    }
    return (
      <input
        type="text"
        {...staticProps}
        // otherLibProps controls value, onChange, onKeyDown, onBlur, ref
        {...otherLibProps}
        className={mergedClass}
        style={mergedStyle}
      />
    );
  };

  return (
    <div className="form-field-row">
      {/* Bilingual Label */}
      <label htmlFor={name} className="form-label">
        {fieldNumber && <span className="field-number">{fieldNumber}</span>}
        <span className="label-hindi hindi" lang="hi">{labelHindi}</span>
        <span className="label-separator"> / </span>
        <span className="label-english">{labelEnglish}</span>
        {required && <span className="required-marker" aria-hidden="true">*</span>}
      </label>

      {/* Transliterating input — library OWNS value + event handlers */}
      <IndicTransliterate
        value={value}
        onChangeText={(text: string) => onChange(name, text)}
        lang={activeLang}
        enabled={!disabled}
        customApiURL={apiProxyUrl}
        /* Auto-accept current suggestion when focus leaves the field.
           This ensures the DB always receives Hindi, not Roman text. */
        insertCurrentSelectionOnBlur={true}
        /* Show the raw typed word as the last suggestion so user can
           keep it in Roman if they explicitly choose to. */
        showCurrentWordAsLastSuggestion={true}
        /* Max suggestions visible in popup */
        maxOptions={6}
        renderComponent={renderInput}
      />

      {/* Validation Error */}
      {errorMessage && (
        <p id={`${name}-error`} className="field-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
