interface Props { value: string; onChange: (v: string) => void; }

export default function RecipeSearch({ value, onChange }: Props) {
  return (
    <div className="searchWrap">
      <svg className="searchIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="search"
        placeholder="Search recipes…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="searchInput"
      />
      <style jsx>{`
        .searchWrap { position: relative; flex: 1; min-width: 200px; max-width: 320px; }
        .searchIcon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #7A7166; pointer-events: none; }
        .searchInput { width: 100%; height: 40px; padding: 0 12px 0 36px; border-radius: 10px; border: 1px solid #E8E1D5; background: #FBF9F5; font-size: 0.875rem; color: #2A2620; outline: none; font-family: 'Inter', sans-serif; }
        .searchInput:focus { border-color: #5E7148; box-shadow: 0 0 0 3px rgba(94,113,72,.15); }
      `}</style>
    </div>
  );
}