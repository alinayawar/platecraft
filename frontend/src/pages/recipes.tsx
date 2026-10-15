import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Recipe } from '@/types';
import RecipeSearch from '@/components/RecipeSearch';
import CategoryFilter from '@/components/CategoryFilter';
import RecipeCard from '@/components/RecipeCard';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Other'];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (category !== 'All') params.category = category;
      const { data } = await apiClient.get('/api/recipes', { params });
      setRecipes(data);
      setError('');
    } catch {
      setError('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="recipesPage">
      <header className="recipesHeader">
        <div>
          <h1 className="recipesTitle">Recipes</h1>
          <p className="recipesSub">Browse and manage your recipe collection</p>
        </div>
      </header>

      <div className="recipesToolbar">
        <RecipeSearch value={search} onChange={setSearch} />
        <CategoryFilter categories={CATEGORIES} active={category} onChange={setCategory} />
      </div>

      {loading && <p className="recipesMsg">Loading recipes…</p>}
      {error && <p className="recipesMsg recipesError">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="recipesMsg">No recipes found.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="recipesGrid">
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}

      <style jsx>{`
        .recipesPage { max-width: 1200px; }
        .recipesHeader { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        .recipesTitle { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 600; color: var(--color-olive-900, #1F2918); margin: 0; }
        .recipesSub { font-size: 0.875rem; color: var(--color-muted, #7A7166); margin: 4px 0 0; }
        .recipesToolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 24px; }
        .recipesGrid { display: grid; gap: 20px; grid-template-columns: 1fr; }
        @media(min-width:640px){ .recipesGrid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .recipesGrid { grid-template-columns: repeat(3,1fr); } }
        .recipesMsg { text-align: center; padding: 48px 16px; color: var(--color-muted, #7A7166); font-size: 0.875rem; }
        .recipesError { color: #B05530; }
      `}</style>
    </div>
  );
}