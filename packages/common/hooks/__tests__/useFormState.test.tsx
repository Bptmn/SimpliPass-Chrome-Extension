import { renderHook, act } from '@testing-library/react';
import { useFormState } from '../useFormState';

interface TestFormData {
  name: string;
  email: string;
  age: number;
}

describe('useFormState', () => {
  const initialData: TestFormData = {
    name: '',
    email: '',
    age: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided data', () => {
      const { result } = renderHook(() => useFormState(initialData));

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('updateField', () => {
    it('should update a single field', () => {
      const { result } = renderHook(() => useFormState(initialData));

      act(() => {
        result.current.updateField('name', 'John Doe');
      });

      expect(result.current.formData.name).toBe('John Doe');
      expect(result.current.isDirty).toBe(true);
    });

    it('should clear error when field is updated', () => {
      const { result } = renderHook(() => useFormState(initialData));

      // Set an error first
      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      expect(result.current.errors.name).toBe('Name is required');

      // Update the field
      act(() => {
        result.current.updateField('name', 'John Doe');
      });

      expect(result.current.errors.name).toBeUndefined();
    });
  });

  describe('updateFields', () => {
    it('should update multiple fields at once', () => {
      const { result } = renderHook(() => useFormState(initialData));

      act(() => {
        result.current.updateFields({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      expect(result.current.formData.name).toBe('John Doe');
      expect(result.current.formData.email).toBe('john@example.com');
      expect(result.current.isDirty).toBe(true);
    });

    it('should clear errors for updated fields', () => {
      const { result } = renderHook(() => useFormState(initialData));

      // Set errors first
      act(() => {
        result.current.setFieldError('name', 'Name is required');
        result.current.setFieldError('email', 'Email is required');
      });

      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Email is required');

      // Update fields
      act(() => {
        result.current.updateFields({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe('setFieldError', () => {
    it('should set error for a specific field', () => {
      const { result } = renderHook(() => useFormState(initialData));

      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      expect(result.current.errors.name).toBe('Name is required');
    });

    it('should clear error when set to undefined', () => {
      const { result } = renderHook(() => useFormState(initialData));

      // Set error first
      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      expect(result.current.errors.name).toBe('Name is required');

      // Clear error
      act(() => {
        result.current.setFieldError('name', undefined);
      });

      expect(result.current.errors.name).toBeUndefined();
    });
  });

  describe('setFormErrors', () => {
    it('should set multiple errors at once', () => {
      const { result } = renderHook(() => useFormState(initialData));

      act(() => {
        result.current.setFormErrors({
          name: 'Name is required',
          email: 'Email is required',
        });
      });

      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Email is required');
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormState(initialData));

      // Set errors first
      act(() => {
        result.current.setFormErrors({
          name: 'Name is required',
          email: 'Email is required',
        });
      });

      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Email is required');

      // Clear all errors
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('clearFieldError', () => {
    it('should clear error for a specific field', () => {
      const { result } = renderHook(() => useFormState(initialData));

      // Set errors first
      act(() => {
        result.current.setFormErrors({
          name: 'Name is required',
          email: 'Email is required',
        });
      });

      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Email is required');

      // Clear specific field error
      act(() => {
        result.current.clearFieldError('name');
      });

      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.errors.email).toBe('Email is required');
    });
  });

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useFormState(initialData));

      // Make some changes
      act(() => {
        result.current.updateField('name', 'John Doe');
        result.current.setFieldError('name', 'Name is required');
        result.current.setSubmitting(true);
      });

      expect(result.current.formData.name).toBe('John Doe');
      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.isDirty).toBe(true);

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('setFormDataValue', () => {
    it('should set form data to new value', () => {
      const { result } = renderHook(() => useFormState(initialData));

      const newData: TestFormData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
      };

      act(() => {
        result.current.setFormDataValue(newData);
      });

      expect(result.current.formData).toEqual(newData);
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('setSubmitting', () => {
    it('should set submitting state', () => {
      const { result } = renderHook(() => useFormState(initialData));

      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.isSubmitting).toBe(true);

      act(() => {
        result.current.setSubmitting(false);
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('hasErrors', () => {
    it('should return true when there are errors', () => {
      const { result } = renderHook(() => useFormState(initialData));

      expect(result.current.hasErrors()).toBe(false);

      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      expect(result.current.hasErrors()).toBe(true);
    });

    it('should return false when there are no errors', () => {
      const { result } = renderHook(() => useFormState(initialData));

      expect(result.current.hasErrors()).toBe(false);
    });
  });

  describe('getFirstError', () => {
    it('should return the first error message', () => {
      const { result } = renderHook(() => useFormState(initialData));

      act(() => {
        result.current.setFormErrors({
          name: 'Name is required',
          email: 'Email is required',
        });
      });

      expect(result.current.getFirstError()).toBe('Name is required');
    });

    it('should return null when there are no errors', () => {
      const { result } = renderHook(() => useFormState(initialData));

      expect(result.current.getFirstError()).toBeNull();
    });
  });
}); 