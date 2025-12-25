import { useState } from 'react'

const PokemonSearch = ({ onSearch, loading }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Digite o nome ou ID do Pokémon (ex: pikachu, 25)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !input.trim()}>
        {loading ? 'Buscando...' : 'Buscar Pokémon'}
      </button>
    </form>
  )
}

export default PokemonSearch