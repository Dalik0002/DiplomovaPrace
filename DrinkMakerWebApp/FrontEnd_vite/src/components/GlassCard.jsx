export default function GlassCard({ index, ingredients, onClick }) {
  return (
    <div onClick={() => onClick(index)} className="glass-card">
      <h3>Sklenice {index + 1}</h3>
      <ul>
        {ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>
    </div>
  );
}
