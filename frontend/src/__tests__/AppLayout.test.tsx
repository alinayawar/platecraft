import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppLayout from '@/components/layout/AppLayout';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

describe('AppLayout', () => {
  it('renders the brand name and nav links', () => {
    render(<AppLayout><div>Test Content</div></AppLayout>);
    expect(screen.getAllByText('Platecraft').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Recipes').length).toBeGreaterThan(0);
  });

  it('highlights the active nav item', () => {
    render(<AppLayout><div>Page</div></AppLayout>);
    const dashLinks = screen.getAllByText('Dashboard');
    const desktopLink = dashLinks[0].closest('a');
    expect(desktopLink?.className).toContain('bg-olive-50');
  });
});