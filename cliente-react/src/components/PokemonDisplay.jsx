const PokemonDisplay = ({ pokemon }) => {
  // Função para formatar o nome do Pokémon
  const formatName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Cores para cada tipo de Pokémon
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dark: '#705848',
    dragon: '#7038F8',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  }

  return (
    <div className="pokemon-display">
      <div className="pokemon-header">
        <h2>{formatName(pokemon.name)}</h2>
        <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
      </div>
      
      <img 
        src={pokemon.sprites.front_default} 
        alt={pokemon.name}
        className="pokemon-image"
      />
      
      <div className="pokemon-types">
        {pokemon.types.map((typeInfo, index) => (
          <span 
            key={index} 
            className="type"
            style={{ backgroundColor: typeColors[typeInfo.type.name] || '#777' }}
          >
            {typeInfo.type.name}
          </span>
        ))}
      </div>
      
      <div className="pokemon-info">
        <p>
          <strong>Altura:</strong> {pokemon.height / 10} m
        </p>
        <p>
          <strong>Peso:</strong> {pokemon.weight / 10} kg
        </p>
      </div>
    </div>
  )
}

export default PokemonDisplay