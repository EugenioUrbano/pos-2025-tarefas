import { useState } from 'react'
import axios from 'axios'
import PokemonSearch from './components/PokemonSearch'
import PokemonDisplay from './components/PokemonDisplay'
import PokemonStats from './components/PokemonStats'
import PokemonAbilities from './components/PokemonAbilities'
import ErrorMessage from './components/ErrorMessage'
import './App.css'

function App() {
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPokemon = async (pokemonName) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
      )
      setPokemon(response.data)
    } catch (err) {
      setError(err.response?.status === 404 
        ? 'Pokémon não encontrado!' 
        : 'Erro ao buscar Pokémon')
      setPokemon(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Pokédex - React</h1>
      <PokemonSearch onSearch={fetchPokemon} loading={loading} />
      
      {error && <ErrorMessage message={error} />}
      
      {pokemon && (
        <div className="pokemon-container">
          <PokemonDisplay pokemon={pokemon} />
          <div className="pokemon-details">
            <PokemonStats stats={pokemon.stats} />
            <PokemonAbilities abilities={pokemon.abilities} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
