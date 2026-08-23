import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';

import { resetToastStore, useToast, useToastStore } from '@/hooks/useToast';

describe('useToast', () => {
  beforeEach(() => {
    resetToastStore();
  });

  it('adds a toast to the store', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Saved', description: 'Changes were saved.' });
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.title).toBe('Saved');
    expect(toasts[0]?.description).toBe('Changes were saved.');
  });

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast());
    let toastId = '';

    act(() => {
      toastId = result.current.toast({ title: 'Dismiss me', variant: 'warning' });
    });

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('clears all toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'One' });
      result.current.toast({ title: 'Two' });
    });

    act(() => {
      result.current.dismissAll();
    });

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
