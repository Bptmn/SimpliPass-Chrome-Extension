import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input (DOM)', () => {
  it('renders and updates value', () => {
    const onChange = jest.fn();
    render(<Input placeholder="Email" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a@b.com' } });
    expect(onChange).toHaveBeenCalled();
  });
});


