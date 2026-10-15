import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/pages/index';

const mockMealPlans = [
  { id: 1, recipeId: 1, date: new Date().toISOString().slice(0, 10), mealType: 'Dinner', servings: 3, recipe: { id: 1, title: 'Miso Salmon', imageUrl: null } },
];
const mockRecipes = [{ id: 1, title: 'Miso Salmon', category: 'Dinner', servings: 3, createdAt: '2025-01-01' }];
const mockGrocery = [{ id: 1, name: 'Salmon', quantity: 1, unit: 'lb', aisle: 'Seafood', checked: false, weekStart: '2025-05-12' }];
const mockNutrition = [{ date: new Date().toISOString().slice(0, 10), calories: 1800, protein: 96, carbs: 198, fat: 64, fiber: 27, sugar: 41 }];

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn((url: string) => {
      if (url === '/api/meal-plans') return Promise.resolve({ data: mockMealPlans });
      if (url === '/api/recipes') return Promise.resolve({ data: mockRecipes });
      if (url === '/api/grocery-list') return Promise.resolve({ data: mockGrocery });
      if (url === '/api/nutrition/daily') return Promise.resolve({ data: mockNutrition });
      return Promise.resolve({ data: [] });
    }),
    post: jest.fn(() => Promise.resolve({ data: { id: 2 } })),
  },
}));

jest.mock('next/head', () => ({ __esModule: true, default: ({ children }: any) => <>{children}</> }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

describe('Dashboard', () => {
  it('renders greeting and data after loading', async () => {
    render(<Dashboard />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Good/)).toBeInTheDocument());
    expect(screen.getByText('Miso Salmon')).toBeInTheDocument();
    expect(screen.getByText('Salmon')).toBeInTheDocument();
  });

  it('opens plan meal modal on button click', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText(/Plan a meal/i, { selector: 'button' })).toBeInTheDocument());
    await userEvent.click(screen.getByText(/Plan a meal/i, { selector: 'button' }));
    expect(screen.getByText('Plan a meal', { selector: 'h2' })).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    const api = require('@/api/client').default;
    api.get.mockRejectedValueOnce(new Error('fail'));
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText(/Failed/i)).toBeInTheDocument());
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});