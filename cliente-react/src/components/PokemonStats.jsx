const PokemonStats = ({ stats }) => {
  const statNames = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defesa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defesa Especial',
    speed: 'Velocidade'
  }

  return (
    <div className="stats-container">
      <h3>Estatísticas</h3>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <span className="stat-name">
              {statNames[stat.stat.name] || stat.stat.name}
            </span>
            <span className="stat-value">{stat.base_stat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PokemonStats