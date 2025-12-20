import { pokeAPI } from '../api/pokeapi.js';
import { capitalizarPrimeiraLetra } from '../utils/helpers.js';

export class UIManager {
    constructor() {
        // Elementos do DOM
        this.tipoSelect = document.getElementById('tipoSelect');
        this.buscarBtn = document.getElementById('buscarBtn');
        this.loadingDiv = document.getElementById('loading');
        this.resultadoDiv = document.getElementById('resultado');
        this.infoTipoDiv = document.getElementById('infoTipo');
        this.erroDiv = document.getElementById('erro');
        this.tipoNome = document.getElementById('tipoNome');
        this.tipoContador = document.getElementById('tipoContador');
        this.tipoBadge = document.getElementById('tipoBadge');
        
        // Modal
        this.modalElement = document.getElementById('pokemonModal');
        this.modal = null;
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        
        // Bind de métodos
        this.buscarPokemonsPorTipo = this.buscarPokemonsPorTipo.bind(this);
        this.abrirEvolucoes = this.abrirEvolucoes.bind(this);
        this.abrirDetalhes = this.abrirDetalhes.bind(this);
    }

    // Inicialização
    init() {
        // Inicializar modal do Bootstrap
        if (this.modalElement) {
            this.modal = new bootstrap.Modal(this.modalElement);
        }
        
        // Adicionar event listeners
        this.buscarBtn.addEventListener('click', this.buscarPokemonsPorTipo);
        
        // Carregar tipos
        this.carregarTipos();
        
        // Expor métodos globalmente para uso em onclick
        window.abrirEvolucoes = this.abrirEvolucoes;
        window.abrirDetalhes = this.abrirDetalhes;
    }

    // Carregar tipos no select
    async carregarTipos() {
        try {
            const tipos = await pokeAPI.carregarTipos();
            
            this.tipoSelect.innerHTML = '<option value="">Selecione um tipo...</option>';
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.name;
                option.textContent = capitalizarPrimeiraLetra(tipo.name);
                this.tipoSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Erro ao carregar tipos:', error);
            this.tipoSelect.innerHTML = '<option value="">Erro ao carregar tipos</option>';
        }
    }

    // Buscar Pokémon por tipo
    async buscarPokemonsPorTipo() {
        const tipoSelecionado = this.tipoSelect.value;
        
        if (!tipoSelecionado) {
            this.mostrarErro('Por favor, selecione um tipo de Pokémon!');
            return;
        }
        
        this.mostrarLoading(true);
        this.limparResultados();
        
        try {
            const tipoData = await pokeAPI.buscarPokemonsPorTipo(tipoSelecionado);
            
            this.exibirInfoTipo(tipoData);
            const pokemonsIniciais = await pokeAPI.filtrarPokemonsIniciais(tipoData.pokemon);
            this.exibirPokemonsIniciais(pokemonsIniciais);
            
        } catch (error) {
            console.error('Erro:', error);
            this.mostrarErro('Erro ao buscar Pokémon. Verifique sua conexão e tente novamente.');
        } finally {
            this.mostrarLoading(false);
        }
    }

    // Exibir informações do tipo
    exibirInfoTipo(tipoData) {
        const nomeFormatado = capitalizarPrimeiraLetra(tipoData.name);
        const contador = tipoData.pokemon.length;
        
        this.tipoNome.textContent = `Pokémon do Tipo ${nomeFormatado}`;
        this.tipoContador.textContent = `${contador} Pokémon encontrado${contador !== 1 ? 's' : ''}`;
        this.tipoBadge.textContent = nomeFormatado;
        this.tipoBadge.className = `badge badge-tipo tipo-${tipoData.name} fs-6 p-2`;
        
        this.infoTipoDiv.style.display = 'block';
    }

    // Exibir Pokémon iniciais
    exibirPokemonsIniciais(pokemons) {
        this.resultadoDiv.innerHTML = '';
        
        pokemons.forEach(pokemon => {
            const card = this.criarCardPokemonInicial(pokemon);
            this.resultadoDiv.appendChild(card);
        });
    }

    // Criar card do Pokémon inicial
    criarCardPokemonInicial(pokemon) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';
        
        const tipos = pokemon.types.map(t => `
            <span class="badge badge-tipo tipo-${t.type.name}">${capitalizarPrimeiraLetra(t.type.name)}</span>
        `).join('');
        
        col.innerHTML = `
            <div class="card pokemon-card h-100" onclick="abrirEvolucoes(${pokemon.id})" style="cursor: pointer;">
                <div class="card-body text-center">
                    <small class="text-muted">#${pokemon.id.toString().padStart(3, '0')}</small>
                    <h6 class="card-title">${capitalizarPrimeiraLetra(pokemon.name)}</h6>
                    <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                         class="pokemon-img my-2" 
                         alt="${pokemon.name}"
                         onerror="this.src='https://via.placeholder.com/120x120/666666/ffffff?text=?'">
                    <div class="pokemon-tipos">${tipos}</div>
                    <small class="text-muted">Clique para ver evoluções</small>
                </div>
            </div>
        `;
        
        return col;
    }

    // Abrir modal com evoluções
    async abrirEvolucoes(pokemonInicialId) {
        try {
            const evolucoesCache = pokeAPI.getEvolucoesCache();
            const cadeiaEvolutiva = evolucoesCache.get(pokemonInicialId);
            
            if (!cadeiaEvolutiva) {
                this.mostrarErro('Evoluções não encontradas para este Pokémon.');
                return;
            }
            
            this.modalTitle.textContent = 'Cadeia Evolutiva';
            this.modalBody.innerHTML = this.criarModalEvolucoes(cadeiaEvolutiva);
            this.modal.show();
            
        } catch (error) {
            console.error('Erro ao carregar evoluções:', error);
        }
    }

    // Criar conteúdo do modal de evoluções
    criarModalEvolucoes(cadeiaEvolutiva) {
        const evolucoesHTML = cadeiaEvolutiva.map((pokemon, index) => {
            const tipos = pokemon.types.map(t => `
                <span class="badge badge-tipo tipo-${t.type.name} me-1">${capitalizarPrimeiraLetra(t.type.name)}</span>
            `).join('');
            
            const isUltimaEvolucao = index === cadeiaEvolutiva.length - 1;
            
            return `
                <div class="col-md-${cadeiaEvolutiva.length > 2 ? '4' : '6'} text-center mb-4">
                    <div class="evolution-stage">
                        <div class="evolution-pokemon" onclick="abrirDetalhes(${pokemon.id})" style="cursor: pointer;">
                            <h6>${capitalizarPrimeiraLetra(pokemon.name)}</h6>
                            <small class="text-muted">#${pokemon.id.toString().padStart(3, '0')}</small>
                            <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                                 class="img-fluid my-2 evolution-img"
                                 alt="${pokemon.name}"
                                 onerror="this.src='https://via.placeholder.com/150x150/666666/ffffff?text=?'">
                            <div class="evolution-tipos">${tipos}</div>
                        </div>
                        ${!isUltimaEvolucao ? '<div class="evolution-arrow"><i class="bi bi-arrow-down fs-4 text-muted"></i></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="evolution-chain">
                <div class="row justify-content-center align-items-center">
                    ${evolucoesHTML}
                </div>
                <div class="text-center mt-3">
                    <small class="text-muted">Clique em um Pokémon para ver detalhes</small>
                </div>
            </div>
        `;
    }

    // Abrir modal com detalhes do Pokémon
    async abrirDetalhes(pokemonId) {
        try {
            const pokemon = await pokeAPI.getPokemon(pokemonId);
            
            this.modalTitle.textContent = 
                `#${pokemon.id.toString().padStart(3, '0')} - ${capitalizarPrimeiraLetra(pokemon.name)}`;
            
            this.modalBody.innerHTML = this.criarModalContent(pokemon);
            this.modal.show();
            
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    }

    // Criar conteúdo do modal de detalhes
    criarModalContent(pokemon) {
        const tipos = pokemon.types.map(t => `
            <span class="badge badge-tipo tipo-${t.type.name} me-1">${capitalizarPrimeiraLetra(t.type.name)}</span>
        `).join('');
        
        const stats = pokemon.stats.map(stat => `
            <div class="mb-2">
                <div class="d-flex justify-content-between">
                    <small class="text-muted">${capitalizarPrimeiraLetra(stat.stat.name)}</small>
                    <small>${stat.base_stat}</small>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${(stat.base_stat / 255) * 100}%"></div>
                </div>
            </div>
        `).join('');
        
        const habilidades = pokemon.abilities.map(a => 
            `<span class="badge bg-secondary me-1">${capitalizarPrimeiraLetra(a.ability.name)}</span>`
        ).join('');
        
        return `
            <div class="row">
                <div class="col-md-4 text-center">
                    <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                         class="img-fluid mb-3"
                         alt="${pokemon.name}"
                         onerror="this.src='https://via.placeholder.com/200x200/666666/ffffff?text=?'">
                    <div class="mb-3">${tipos}</div>
                </div>
                <div class="col-md-8">
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Altura:</strong><br>
                            <span class="text-muted">${pokemon.height / 10}m</span>
                        </div>
                        <div class="col-6">
                            <strong>Peso:</strong><br>
                            <span class="text-muted">${pokemon.weight / 10}kg</span>
                        </div>
                    </div>
                    
                    <h6>Habilidades</h6>
                    <div class="mb-3">${habilidades}</div>
                    
                    <h6>Estatísticas</h6>
                    ${stats}
                </div>
            </div>
        `;
    }

    // Funções auxiliares de UI
    mostrarLoading(mostrar) {
        this.loadingDiv.style.display = mostrar ? 'block' : 'none';
    }

    mostrarErro(mensagem) {
        this.erroDiv.textContent = mensagem;
        this.erroDiv.style.display = 'block';
    }

    limparResultados() {
        this.resultadoDiv.innerHTML = '';
        this.infoTipoDiv.style.display = 'none';
        this.erroDiv.style.display = 'none';
        pokeAPI.limparCache();
    }
}