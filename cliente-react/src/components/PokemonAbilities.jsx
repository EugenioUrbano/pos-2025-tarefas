const PokemonAbilities = ({ abilities }) => {
  return (
    <div className="abilities-container">
      <h3>Habilidades</h3>
      <ul className="abilities-list">
        {abilities.map((ability, index) => (
          <li key={index} className="ability-item">
            <span className="ability-name">
              {ability.ability.name.replace('-', ' ')}
            </span>
            {ability.is_hidden && (
              <span className="ability-hidden">Oculta</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PokemonAbilities