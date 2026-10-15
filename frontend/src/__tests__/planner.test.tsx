import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeeklyPlanner from '@/pages/planner';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockMealPlans = [
  { id: 1, recipeId: 10, date: '2025-05-12', mealType: 'Breakfast', servings: 2, recipe: { id: 10, title: 'Oats Bowl', imageUrl: null } },
];
const mockRecipes = [
  { id: 10, title: 'Oats Bowl', servings: 2, createdAt: '2025-01-01' },
  { id: 11, title: 'Salmon', servings: 4, createdAt: '2025-01-02' },
];

beforeEach(() => {
  jest.clearAllMocks();
  (apiClient.get as jest.Mock).mockImplementation((url: string) => {
    if (url === '/api/meal-plans') return Promise.resolve({ data: mockMealPlans });
    if (url === '/api/recipes') return Promise.resolve({ data: mockRecipes });
    return Promise.resolve({ data: [] });
  });
});

test('renders the page title', async () => {
  render(<WeeklyPlanner />);
  expect(screen.getByText('Weekly Planner')).toBeInTheDocument();
  await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
});

test('shows meal plan data after loading', async () => {
  render(<WeeklyPlanner />);
  await waitFor(() => expect(screen.getByText('Oats Bowl')).toBeInTheDocument());
});

test('opens modal when clicking an empty slot add button', async () => {
  render(<WeeklyPlanner />);
  await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
  const addButtons = screen.getAllByText('+ Add');
  fireEvent.click(addButtons[0]);
  expect(screen.getByText('Plan a meal')).toBeInTheDocument();
});

test('handles API error gracefully', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<WeeklyPlanner />);
  await waitFor(() => expect(screen.getByText('Failed to load meal plans.')).toBeInTheDocument());
});

test('delete button calls API', async () => {
  (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
  render(<WeeklyPlanner />);
  await waitFor(() => expect(screen.getByText('Oats Bowl')).toBeInTheDocument());
  const deleteBtn = screen.getByLabelText('Remove meal');
  fireEvent.click(deleteBtn);
  await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith('/api/meal-plans/1'));
});