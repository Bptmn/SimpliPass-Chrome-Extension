/**
 * Tests for useFormState hook
 */

import { renderHook, act } from '@testing-library/react';
import { useFormState } from '../useFormState';

describe('useFormState', () => {
  const initialData = {
    name: '',
    email: '',
    age: 0
  };

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useFormState(initialData));

    expect(result.current.formData).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('should update a single field', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.updateField('name', 'John Doe');
    });

    expect(result.current.formData.name).toBe('John Doe');
    expect(result.current.isDirty).toBe(true);
  });

  it('should update multiple fields', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.updateFields({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
    });

    expect(result.current.formData.name).toBe('Jane Doe');
    expect(result.current.formData.email).toBe('jane@example.com');
    expect(result.current.isDirty).toBe(true);
  });

  it('should set field error', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.setFieldError('name', 'Name is required');
    });

    expect(result.current.errors.name).toBe('Name is required');
  });

  it('should set multiple errors', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.setFormErrors({
        name: 'Name is required',
        email: 'Email is invalid'
      });
    });

    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.email).toBe('Email is invalid');
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.setFormErrors({
        name: 'Name is required',
        email: 'Email is invalid'
      });
    });

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it('should clear specific field error', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.setFormErrors({
        name: 'Name is required',
        email: 'Email is invalid'
      });
    });

    act(() => {
      result.current.clearFieldError('name');
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBe('Email is invalid');
  });

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.updateField('name', 'John Doe');
      result.current.setFieldError('name', 'Name is required');
      result.current.setSubmitting(true);
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('should set form data value', () => {
    const { result } = renderHook(() => useFormState(initialData));
    const newData = { name: 'John', email: 'john@example.com', age: 25 };

    act(() => {
      result.current.setFormDataValue(newData);
    });

    expect(result.current.formData).toEqual(newData);
    expect(result.current.isDirty).toBe(true);
  });

  it('should set submitting state', () => {
    const { result } = renderHook(() => useFormState(initialData));

    act(() => {
      result.current.setSubmitting(true);
    });

    expect(result.current.isSubmitting).toBe(true);

    act(() => {
      result.current.setSubmitting(false);
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('should check if form has errors', () => {
    const { result } = renderHook(() => useFormState(initialData));

    expect(result.current.hasErrors()).toBe(false);

    act(() => {
      result.current.setFieldError('name', 'Name is required');
    });

    expect(result.current.hasErrors()).toBe(true);
  });

  it('should get first error message', () => {
    const { result } = renderHook(() => useFormState(initialData));

    expect(result.current.getFirstError()).toBeNull();

    act(() => {
      result.current.setFormErrors({
        email: 'Email is invalid',
        name: 'Name is required'
      });
    });

    expect(result.current.getFirstError()).toBe('Email is invalid');
  });

  it('should handle complex data types', () => {
    const complexInitialData = {
      user: { name: '', email: '' },
      settings: { theme: 'light', notifications: true },
      tags: ['tag1', 'tag2']
    };

    const { result } = renderHook(() => useFormState(complexInitialData));

    act(() => {
      result.current.updateField('user', { name: 'John', email: 'john@example.com' });
    });

    expect(result.current.formData.user).toEqual({ name: 'John', email: 'john@example.com' });
    expect(result.current.isDirty).toBe(true);
  });

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => useFormState(initialData));

    const firstRender = result.current;
    rerender();

    expect(result.current.updateField).toBe(firstRender.updateField);
    expect(result.current.updateFields).toBe(firstRender.updateFields);
    expect(result.current.setFieldError).toBe(firstRender.setFieldError);
    expect(result.current.clearErrors).toBe(firstRender.clearErrors);
    expect(result.current.resetForm).toBe(firstRender.resetForm);
  });
});
