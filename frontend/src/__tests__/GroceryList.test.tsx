import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroceryListPage from '@/pages/grocery-list';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockItems = [
  { id: 1, name: 'Salmon fillets', quantity: 0.6, unit: 'kg', aisle: 'Seafood', checked: false, weekStart: '2025-05-12' },
  { id: 2, name: 'Arborio rice', quantity: 300, unit: 'g', aisle: 'Grains', checked: true, weekStart: '2025-05-12' },
];

describe('GroceryListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockItems });
  });

  it('renders items grouped by aisle', async () => {
    render(<GroceryListPage />);
    await waitFor(() => expect(screen.getByText('Salmon fillets')).toBeInTheDocument());
    expect(screen.getByText('Seafood')).toBeInTheDocument();
    expect(screen.getByText('Grains')).toBeInTheDocument();
    expect(screen.getByText('1 to buy')).toBeInTheDocument();
  });

  it('shows empty state when no items', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<GroceryListPage />);
    await waitFor(() => expect(screen.getByText('No grocery items yet')).toBeInTheDocument());
  });

  it('toggles checked state on click', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: { id: 1, checked: true } });
    render(<GroceryListPage />);
    await waitFor(() => expect(screen.getByText('Salmon fillets')).toBeInTheDocument());
    const checkboxes = screen.getAllByRole('checkbox');
    const salmonCheckbox = checkboxes[0];
    fireEvent.click(salmonCheckbox);
    expect(apiClient.patch).toHaveBeenCalledWith('/api/grocery-list/1', { checked: true });
  });

  it('calls generate endpoint', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockItems });
    render(<GroceryListPage />);
    await waitFor(() => expect(screen.getByText('Salmon fillets')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Generate from meals'));
    expect(apiClient.post).toHaveBeenCalledWith('/api/grocery-list/generate', expect.objectContaining({ weekStart: expect.any(String) }));
  });

  it('filters items by search', async () => {
    render(<GroceryListPage />);
    await waitFor(() => expect(screen.getByText('Salmon fillets')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Search items…'), { target: { value: 'rice' } });
    expect(screen.queryByText('Salmon fillets')).not.toBeInTheDocument();
    expect(screen.getByText('Arborio rice')).toBeInTheDocument();
  });
});