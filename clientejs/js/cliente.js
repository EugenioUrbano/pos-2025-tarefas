// Configurações
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
let todosTipos = [];
let modal = null;
let evolucoesCache = new Map(); // Cache para evoluções

// Elementos do DOM
const tipoSelect = document.getElementById('tipoSelect');
const loadingDiv = document.getElementById('loading');
const resultadoDiv = document.getElementById('resultado');
const infoTipoDiv = document.getElementById('infoTipo');
const erroDiv = document.getElementById('erro');
const tipoNome = document.getElementById('tipoNome');
const tipoContador = document.getElementById('tipoContador');
const tipoBadge = document.getElementById('tipoBadge');

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
    carregarTipos();
});

// Carregar todos os tipos de Pokémon
async function carregarTipos() {
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}/type`);
        const data = await response.json();
        
        todosTipos = data.results.filter(tipo => 
            !['shadow', 'unknown'].includes(tipo.name)
        );
        
        tipoSelect.innerHTML = '<option value="">Selecione um tipo...</option>';
        todosTipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.name;
            option.textContent = capitalizarPrimeiraLetra(tipo.name);
            tipoSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar tipos:', error);
        tipoSelect.innerHTML = '<option value="">Erro ao carregar tipos</option>';
    }
}

// Buscar Pokémon por tipo
async function buscarPokemonsPorTipo() {
    const tipoSelecionado = tipoSelect.value;
    
    if (!tipoSelecionado) {
        mostrarErro('Por favor, selecione um tipo de Pokémon!');
        return;
    }
    
    mostrarLoading(true);
    limparResultados();
    
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}/type/${tipoSelecionado}`);
        const tipoData = await response.json();
        
        exibirInfoTipo(tipoData);
        await exibirPokemonsIniciais(tipoData.pokemon);
        
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro('Erro ao buscar Pokémon. Verifique sua conexão e tente novamente.');
    } finally {
        mostrarLoading(false);
    }
}

// Exibir informações do tipo
function exibirInfoTipo(tipoData) {
    const nomeFormatado = capitalizarPrimeiraLetra(tipoData.name);
    const contador = tipoData.pokemon.length;
    
    tipoNome.textContent = `Pokémon do Tipo ${nomeFormatado}`;
    tipoContador.textContent = `${contador} Pokémon encontrado${contador !== 1 ? 's' : ''}`;
    tipoBadge.textContent = nomeFormatado;
    tipoBadge.className = `badge badge-tipo tipo-${tipoData.name} fs-6 p-2`;
    
    infoTipoDiv.style.display = 'block';
}

// Exibir apenas Pokémon iniciais (primeira evolução)
async function exibirPokemonsIniciais(pokemonsLista) {
    resultadoDiv.innerHTML = '';
    
    // Ordenar por ID
    const pokemonsOrdenados = pokemonsLista
        .map(p => p.pokemon)
        .sort((a, b) => {
            const idA = parseInt(a.url.split('/').filter(Boolean).pop());
            const idB = parseInt(b.url.split('/').filter(Boolean).pop());
            return idA - idB;
        });

    const pokemonsIniciais = [];
    const idsProcessados = new Set();

    for (const pokemon of pokemonsOrdenados) {
        try {
            const pokemonId = parseInt(pokemon.url.split('/').filter(Boolean).pop());
            
            if (idsProcessados.has(pokemonId)) continue;
            
            const response = await fetch(pokemon.url);
            const pokemonData = await response.json();
            
            // Verificar se é uma forma especial (megas, gigas, etc)
            if (isFormaEspecial(pokemonData)) continue;
            
            // Buscar a cadeia de evolução
            const especieResponse = await fetch(pokemonData.species.url);
            const especieData = await especieResponse.json();
            
            const evolucaoResponse = await fetch(especieData.evolution_chain.url);
            const evolucaoData = await evolucaoResponse.json();
            
            // Encontrar o Pokémon inicial da cadeia
            const pokemonInicial = await encontrarPokemonInicial(evolucaoData.chain);
            
            if (pokemonInicial && !idsProcessados.has(pokemonInicial.id)) {
                pokemonsIniciais.push(pokemonInicial);
                idsProcessados.add(pokemonInicial.id);
                
                // Cache das evoluções
                evolucoesCache.set(pokemonInicial.id, await obterCadeiaEvolutiva(evolucaoData.chain));
            }
            
        } catch (error) {
            console.error(`Erro ao processar ${pokemon.name}:`, error);
        }
    }
    
    // Exibir Pokémon iniciais
    pokemonsIniciais.forEach(pokemon => {
        const card = criarCardPokemonInicial(pokemon);
        resultadoDiv.appendChild(card);
    });
}

// Verificar se é uma forma especial (mega, giga, etc)
function isFormaEspecial(pokemonData) {
    const nome = pokemonData.name.toLowerCase();
    return nome.includes('-mega') || nome.includes('-gmax') || 
           nome.includes('-alola') || nome.includes('-galar') ||
           nome.includes('-hisui') || nome.includes('-paldea');
}

// Encontrar Pokémon inicial da cadeia evolutiva
async function encontrarPokemonInicial(chain) {
    let current = chain;
    while (current.evolves_to.length > 0) {
        current = current.evolves_to[0];
    }
    
    const pokemonId = parseInt(current.species.url.split('/').filter(Boolean).pop());
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
    return await response.json();
}

// Obter toda a cadeia evolutiva
async function obterCadeiaEvolutiva(chain) {
    const cadeia = [];
    let current = chain;
    
    while (current) {
        const pokemonId = parseInt(current.species.url.split('/').filter(Boolean).pop());
        const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
        const pokemonData = await response.json();
        
        cadeia.push(pokemonData);
        
        if (current.evolves_to.length > 0) {
            current = current.evolves_to[0];
        } else {
            current = null;
        }
    }
    
    return cadeia;
}

// Criar card do Pokémon inicial
function criarCardPokemonInicial(pokemon) {
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
async function abrirEvolucoes(pokemonInicialId) {
    try {
        const cadeiaEvolutiva = evolucoesCache.get(pokemonInicialId);
        
        if (!cadeiaEvolutiva) {
            mostrarErro('Evoluções não encontradas para este Pokémon.');
            return;
        }
        
        document.getElementById('modalTitle').textContent = 'Cadeia Evolutiva';
        document.getElementById('modalBody').innerHTML = criarModalEvolucoes(cadeiaEvolutiva);
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar evoluções:', error);
    }
}

// Criar conteúdo do modal de evoluções
function criarModalEvolucoes(cadeiaEvolutiva) {
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

// Abrir modal com detalhes do Pokémon (agora separado das evoluções)
async function abrirDetalhes(pokemonId) {
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
        const pokemon = await response.json();
        
        document.getElementById('modalTitle').textContent = 
            `#${pokemon.id.toString().padStart(3, '0')} - ${capitalizarPrimeiraLetra(pokemon.name)}`;
        
        document.getElementById('modalBody').innerHTML = criarModalContent(pokemon);
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
    }
}

// Criar conteúdo do modal de detalhes (mantido igual)
function criarModalContent(pokemon) {
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
        `<span class="badge bg-secondary me-1">${a.ability.name}</span>`
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

// Funções auxiliares
function capitalizarPrimeiraLetra(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function mostrarLoading(mostrar) {
    loadingDiv.style.display = mostrar ? 'block' : 'none';
}

function mostrarErro(mensagem) {
    erroDiv.textContent = mensagem;
    erroDiv.style.display = 'block';
}

function limparResultados() {
    resultadoDiv.innerHTML = '';
    infoTipoDiv.style.display = 'none';
    erroDiv.style.display = 'none';
    evolucoesCache.clear();
}