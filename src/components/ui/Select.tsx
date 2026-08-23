import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type SelectHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

function createChangeEvent(value: string): ChangeEvent<HTMLSelectElement> {
  return {
    target: { value } as HTMLSelectElement,
    currentTarget: { value } as HTMLSelectElement,
  } as ChangeEvent<HTMLSelectElement>;
}

function createFocusEvent(): FocusEvent<HTMLSelectElement> {
  return {} as FocusEvent<HTMLSelectElement>;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  value,
  disabled,
  onChange,
  onBlur,
  name,
  required,
}: SelectProps): JSX.Element {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const errorId = error ? `${selectId}-error` : undefined;
  const shouldReduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [typeAhead, setTypeAhead] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const typeAheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stringValue = value !== undefined && value !== null ? String(value) : '';
  const selectedOption = options.find((option) => option.value === stringValue);
  const displayLabel = selectedOption?.label ?? placeholder ?? 'Select…';

  const enabledOptions = options.filter((option) => !option.disabled);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setTypeAhead('');
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const selectValue = useCallback(
    (newValue: string) => {
      if (disabled) return;
      onChange?.(createChangeEvent(newValue));
      close();
    },
    [close, disabled, onChange],
  );

  const openDropdown = useCallback(() => {
    if (disabled) return;
    updateDropdownPosition();
    setOpen(true);
    const currentIndex = enabledOptions.findIndex((option) => option.value === stringValue);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [disabled, enabledOptions, stringValue, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        close();
        onBlur?.(createFocusEvent());
      }
    };

    const handleReposition = () => updateDropdownPosition();

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [close, onBlur, open, updateDropdownPosition]);

  useEffect(() => {
    return () => {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, []);

  const findTypeAheadIndex = (query: string): number => {
    const lower = query.toLowerCase();
    const start = activeIndex + 1;
    for (let i = 0; i < enabledOptions.length; i++) {
      const index = (start + i) % enabledOptions.length;
      if (enabledOptions[index].label.toLowerCase().startsWith(lower)) {
        return index;
      }
    }
    return -1;
  };

  const handleTypeAhead = (char: string) => {
    const nextQuery = typeAhead + char.toLowerCase();
    setTypeAhead(nextQuery);

    if (typeAheadTimeoutRef.current) {
      clearTimeout(typeAheadTimeoutRef.current);
    }
    typeAheadTimeoutRef.current = setTimeout(() => setTypeAhead(''), 500);

    const matchIndex = findTypeAheadIndex(nextQuery);
    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else {
          setActiveIndex((prev) => {
            const next = prev < enabledOptions.length - 1 ? prev + 1 : 0;
            return next;
          });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else {
          setActiveIndex((prev) => {
            const next = prev > 0 ? prev - 1 : enabledOptions.length - 1;
            return next;
          });
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else if (activeIndex >= 0 && enabledOptions[activeIndex]) {
          selectValue(enabledOptions[activeIndex].value);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(enabledOptions.length - 1);
        }
        break;
      default:
        if (open && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeAhead(event.key);
        }
        break;
    }
  };

  const activeOptionId =
    activeIndex >= 0 && enabledOptions[activeIndex]
      ? `${selectId}-option-${enabledOptions[activeIndex].value}`
      : undefined;

  const dropdownList = (
    <AnimatePresence>
      {open ? (
        <motion.ul
          key="select-listbox"
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? `${selectId}-label` : selectId}
          initial={shouldReduceMotion ? false : { y: -4, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { y: -4, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
          className="z-[200] max-h-60 overflow-auto rounded-md border border-border bg-white p-1 text-foreground shadow-lg dark:bg-zinc-950"
        >
          {options.map((option) => {
            const enabledIndex = enabledOptions.findIndex((item) => item.value === option.value);
            const isSelected = option.value === stringValue;
            const isActive = enabledIndex === activeIndex;
            const optionId = `${selectId}-option-${option.value}`;

            return (
              <li
                key={option.value}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled ?? undefined}
                className={cn(
                  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                  option.disabled && 'pointer-events-none opacity-50',
                  isActive && 'bg-accent text-accent-foreground',
                  isSelected && !isActive && 'bg-muted/60',
                  !option.disabled && !isActive && 'hover:bg-accent hover:text-accent-foreground',
                )}
                onMouseEnter={() => {
                  if (!option.disabled && enabledIndex >= 0) {
                    setActiveIndex(enabledIndex);
                  }
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (!option.disabled) {
                    selectValue(option.value);
                  }
                }}
              >
                {option.label}
              </li>
            );
          })}
        </motion.ul>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="flex w-full flex-col gap-1.5" ref={containerRef}>
      {label ? (
        <label id={`${selectId}-label`} className="text-sm font-medium text-foreground">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>
      ) : null}

      {name ? <input type="hidden" name={name} value={stringValue} /> : null}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={open ? activeOptionId : undefined}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          aria-required={required}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            !selectedOption && placeholder && 'text-muted-foreground',
            className,
          )}
          onClick={() => (open ? close() : openDropdown())}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!open) {
              onBlur?.(createFocusEvent());
            }
          }}
        >
          <span className="truncate">{displayLabel}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            className="ml-2 shrink-0 text-muted-foreground"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        </button>

        {typeof document !== 'undefined' ? createPortal(dropdownList, document.body) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
