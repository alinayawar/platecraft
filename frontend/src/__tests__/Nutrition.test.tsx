import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Nutrition from '@/pages/nutrition';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('recharts', () => {
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Bar: () => null,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    Legend: () => null,
  };
});

const mockData = [
  { date: '2025-05-14', calories: 2100, protein: 120, carbs: 250, fat: 70, fiber: 28, sugar: 40 },
  { date: '2025-05-13', calories: 1900, protein: 110, carbs: 230, fat: 65, fiber: 25, sugar: 38 },
];

describe('Nutrition page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading then data', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });
    render(<Nutrition />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Nutrition')).toBeInTheDocument());
    expect(screen.getByText(/Avg Calories/)).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument(); // avg of 2100 and 1900
  });

  it('shows error on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Nutrition />);
    await waitFor(() => expect(screen.getByText('Failed to load nutrition data.')).toBeInTheDocument());
  });

  it('shows empty state when no data', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Nutrition />);
    await waitFor(() => expect(screen.getByText(/No nutrition data/)).toBeInTheDocument());
  });

  it('switches range tabs', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });
    render(<Nutrition />);
    await waitFor(() => expect(screen.getByText('Nutrition')).toBeInTheDocument());
    fireEvent.click(screen.getByText('14d'));
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });
});