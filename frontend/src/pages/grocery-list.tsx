import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import apiClient from '@/api/client';
import { GroceryItem } from '@/types';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiShoppingCart } from 'react-icons/fi';
import styles from '@/components/grocery/GroceryList.module.css';

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [weekStart, setWeekStart] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/grocery-list', { params: { weekStart } });
      setItems(res.data);
    } catch {
      setError('Failed to load grocery list.');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post('/api/grocery-list/generate', { weekStart });
      setItems(res.data.map((it: any) => ({ ...it, weekStart })));
    } catch {
      setError('Failed to generate grocery list.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (item: GroceryItem) => {
    const newChecked = !item.checked;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: newChecked } : i));
    try {
      await apiClient.patch(`/api/grocery-list/${item.id}`, { checked: newChecked });
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !newChecked } : i));
    }
  };

  const prevWeek = () => setWeekStart(format(subWeeks(new Date(weekStart), 1), 'yyyy-MM-dd'));
  const nextWeek = () => setWeekStart(format(addWeeks(new Date(weekStart), 1), 'yyyy-MM-dd'));

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const uncheckedCount = items.filter(i => !i.checked).length;

  // Group by aisle
  const grouped: Record<string, GroceryItem[]> = {};
  filtered.forEach(item => {
    const aisle = item.aisle || 'Other';
    if (!grouped[aisle]) grouped[aisle] = [];
    grouped[aisle].push(item);
  });
  const sortedAisles = Object.keys(grouped).sort((a, b) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b));

  const weekEnd = format(addWeeks(new Date(weekStart), 1), 'MMM d');
  const weekStartLabel = format(new Date(weekStart), 'MMM d');

  return (
    <>
      <Head><title>Grocery List — Platecraft</title></Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.subtitle}>Week of {weekStartLabel} – {weekEnd}</p>
            <h1 className={styles.title}>Grocery List</h1>
          </div>
          <div className={styles.actions}>
            <div className={styles.weekNav}>
              <button onClick={prevWeek} className={styles.navBtn} aria-label="Previous week"><FiChevronLeft /></button>
              <button onClick={nextWeek} className={styles.navBtn} aria-label="Next week"><FiChevronRight /></button>
            </div>
            <button onClick={handleGenerate} disabled={generating} className={styles.generateBtn}>
              <FiRefreshCw className={generating ? styles.spin : ''} />
              {generating ? 'Generating…' : 'Generate from meals'}
            </button>
          </div>
        </header>

        <div className={styles.toolbar}>
          <label className={styles.searchWrap}>
            <FiSearch className={styles.searchIcon} />
            <input type="search" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
          </label>
          <div className={styles.stats}>
            <span className={styles.totalBadge}>{items.length} items</span>
            {uncheckedCount > 0 && <span className={styles.remainBadge}>{uncheckedCount} to buy</span>}
            {uncheckedCount === 0 && items.length > 0 && <span className={styles.doneBadge}>All set!</span>}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <FiShoppingCart size={40} />
            <p className={styles.emptyTitle}>No grocery items yet</p>
            <p className={styles.emptyDesc}>Generate a list from your planned meals for the week.</p>
            <button onClick={handleGenerate} disabled={generating} className={styles.generateBtn}>
              <FiRefreshCw /> Generate from meals
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No items match &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className={styles.listContainer}>
            {sortedAisles.map(aisle => (
              <div key={aisle} className={styles.aisleGroup}>
                <h3 className={styles.aisleLabel}>{aisle}</h3>
                <ul className={styles.itemList}>
                  {grouped[aisle].map(item => (
                    <li key={item.id} className={styles.item}>
                      <label className={styles.itemLabel}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggle(item)}
                          className={styles.checkbox}
                        />
                        <span className={`${styles.itemName} ${item.checked ? styles.checked : ''}`}>{item.name}</span>
                      </label>
                      <span className={styles.itemQty}>
                        {item.quantity != null ? item.quantity : ''}{item.unit ? ` ${item.unit}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}