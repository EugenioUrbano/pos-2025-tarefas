import { extrairIdDaUrl, isFormaEspecial } from '../utils/helpers.js';

// Configurações da API
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

// Cache para evoluções
const evolucoesCache = new Map();

// Wrapper da PokeAPI
export const pokeAPI = {
    // Tipos
    async carregarTipos() {
        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/type`);
            const data = await response.json();
            
            return data.results.filter(tipo => 
                !['shadow', 'unknown'].includes(tipo.name)
            );
        } catch (error) {
            console.error('Erro ao carregar tipos:', error);
            throw error;
        }
    },

    // Pokémon por tipo
    async buscarPokemonsPorTipo(tipo) {
        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/type/${tipo}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar Pokémon por tipo:', error);
            throw error;
        }
    },

    // Detalhes do Pokémon
    async getPokemon(idOuNome) {
        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOuNome}`);
            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar Pokémon ${idOuNome}:`, error);
            throw error;
        }
    },

    // Espécie do Pokémon
    async getEspecie(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar espécie:', error);
            throw error;
        }
    },

    // Cadeia evolutiva
    async getCadeiaEvolutiva(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar cadeia evolutiva:', error);
            throw error;
        }
    },

    // Encontrar Pokémon inicial da cadeia
    async encontrarPokemonInicial(chain) {
        let current = chain;
        while (current.evolves_to.length > 0) {
            current = current.evolves_to[0];
        }
        
        const pokemonId = extrairIdDaUrl(current.species.url);
        return await this.getPokemon(pokemonId);
    },

    // Obter toda a cadeia evolutiva
    async obterCadeiaEvolutivaCompleta(chain) {
        const cadeia = [];
        let current = chain;
        
        while (current) {
            const pokemonId = extrairIdDaUrl(current.species.url);
            const pokemonData = await this.getPokemon(pokemonId);
            
            cadeia.push(pokemonData);
            
            if (current.evolves_to.length > 0) {
                current = current.evolves_to[0];
            } else {
                current = null;
            }
        }
        
        return cadeia;
    },

    // Filtrar Pokémon iniciais
    async filtrarPokemonsIniciais(pokemonsLista) {
        const pokemonsOrdenados = pokemonsLista
            .map(p => p.pokemon)
            .sort((a, b) => {
                const idA = extrairIdDaUrl(a.url);
                const idB = extrairIdDaUrl(b.url);
                return idA - idB;
            });

        const pokemonsIniciais = [];
        const idsProcessados = new Set();

        for (const pokemon of pokemonsOrdenados) {
            try {
                const pokemonId = extrairIdDaUrl(pokemon.url);
                
                if (idsProcessados.has(pokemonId)) continue;
                
                const pokemonData = await this.getPokemon(pokemonId);
                
                // Verificar se é uma forma especial
                if (isFormaEspecial(pokemonData)) continue;
                
                // Buscar a cadeia de evolução
                const especieData = await this.getEspecie(pokemonData.species.url);
                const evolucaoData = await this.getCadeiaEvolutiva(especieData.evolution_chain.url);
                
                // Encontrar o Pokémon inicial da cadeia
                const pokemonInicial = await this.encontrarPokemonInicial(evolucaoData.chain);
                
                if (pokemonInicial && !idsProcessados.has(pokemonInicial.id)) {
                    pokemonsIniciais.push(pokemonInicial);
                    idsProcessados.add(pokemonInicial.id);
                    
                    // Cache das evoluções
                    const cadeiaEvolutiva = await this.obterCadeiaEvolutivaCompleta(evolucaoData.chain);
                    evolucoesCache.set(pokemonInicial.id, cadeiaEvolutiva);
                }
                
            } catch (error) {
                console.error(`Erro ao processar ${pokemon.name}:`, error);
            }
        }
        
        return pokemonsIniciais;
    },

    // Getters para cache
    getEvolucoesCache() {
        return evolucoesCache;
    },

    limparCache() {
        evolucoesCache.clear();
    }
};