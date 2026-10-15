import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Recipes from '@/pages/recipes';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const mockRecipes = [
  { id: 1, title: 'Pancakes', description: 'Fluffy', category: 'Breakfast', servings: 2, prepTimeMinutes: 5, cookTimeMinutes: 10, imageUrl: null, createdAt: '2025-01-01' },
  { id: 2, title: 'Pasta', description: 'Italian', category: 'Dinner', servings: 4, prepTimeMinutes: 10, cookTimeMinutes: 20, imageUrl: 'http://img.jpg', createdAt: '2025-01-02' },
];

beforeEach(() => { (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes }); });

test('renders recipes after loading', async () => {
  render(<Recipes />);
  expect(screen.getByText('Loading recipes…')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Pancakes')).toBeInTheDocument());
  expect(screen.getByText('Pasta')).toBeInTheDocument();
});

test('filters by search', async () => {
  render(<Recipes />);
  await waitFor(() => expect(screen.getByText('Pancakes')).toBeInTheDocument());
  fireEvent.change(screen.getByPlaceholderText('Search recipes…'), { target: { value: 'pasta' } });
  expect(screen.queryByText('Pancakes')).not.toBeInTheDocument();
  expect(screen.getByText('Pasta')).toBeInTheDocument();
});

test('shows error on fetch failure', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Recipes />);
  await waitFor(() => expect(screen.getByText('Failed to load recipes.')).toBeInTheDocument());
});

test('category filter calls API with param', async () => {
  render(<Recipes />);
  await waitFor(() => expect(screen.getByText('Pancakes')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Dinner'));
  await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/api/recipes', { params: { category: 'Dinner' } }));
});