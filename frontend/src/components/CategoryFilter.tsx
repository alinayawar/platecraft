interface Props { categories: string[]; active: string; onChange: (c: string) => void; }

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="cfWrap">
      {categories.map(c => (
        <button key={c} className={`cfBtn ${c === active ? 'cfActive' : ''}`} onClick={() => onChange(c)}>{c}</button>
      ))}
      <style jsx>{`
        .cfWrap { display: flex; flex-wrap: wrap; gap: 6px; }
        .cfBtn { height: 32px; padding: 0 14px; border-radius: 8px; border: 1px solid #E8E1D5; background: #FBF9F5; font-size: 0.8125rem; color: #2A2620; cursor: pointer; font-family: 'Inter', sans-serif; transition: all .15s; }
        .cfBtn:hover { border-color: #5E7148; }
        .cfActive { background: #4A5B37; color: #F7F3EC; border-color: #4A5B37; font-weight: 500; }
      `}</style>
    </div>
  );
}