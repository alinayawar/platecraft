import Link from 'next/link';
import { Recipe } from '@/types';

interface Props { recipe: Recipe; }

export default function RecipeCard({ recipe }: Props) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="rc">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="rcImg" />
        ) : (
          <div className="rcImgPlaceholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7A7166" strokeWidth="1.5"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.657.673 3.157 1.76 4.24A6.5 6.5 0 0 0 5.5 16.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3.5a6.5 6.5 0 0 0-3.76-5.76A6.32 6.32 0 0 0 16.5 6.5 4.5 4.5 0 0 0 12 2z"/></svg>
          </div>
        )}
        <div className="rcBody">
          {recipe.category && <span className="rcCat">{recipe.category}</span>}
          <h3 className="rcTitle">{recipe.title}</h3>
          {recipe.description && <p className="rcDesc">{recipe.description}</p>}
          <div className="rcMeta">
            {totalTime > 0 && <span>{totalTime} min</span>}
            <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <style jsx>{`
          .rc { background: #FBF9F5; border: 1px solid #E8E1D5; border-radius: 16px; overflow: hidden; cursor: pointer; transition: box-shadow .2s, border-color .2s; }
          .rc:hover { border-color: #5E7148; box-shadow: 0 4px 16px rgba(42,38,32,.08); }
          .rcImg { width: 100%; height: 180px; object-fit: cover; }
          .rcImgPlaceholder { width: 100%; height: 180px; background: #EEF1E8; display: grid; place-items: center; }
          .rcBody { padding: 16px; }
          .rcCat { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #B05530; font-weight: 500; }
          .rcTitle { font-family: 'Fraunces', serif; font-size: 1.125rem; font-weight: 600; margin: 6px 0 0; color: #1F2918; line-height: 1.3; }
          .rcDesc { font-size: 0.8125rem; color: #7A7166; margin: 6px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .rcMeta { display: flex; gap: 12px; margin-top: 12px; font-size: 0.75rem; color: #7A7166; }
        `}</style>
      </div>
    </Link>
  );
}