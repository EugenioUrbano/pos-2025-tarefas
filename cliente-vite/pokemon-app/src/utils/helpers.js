// Funções utilitárias
export function capitalizarPrimeiraLetra(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function extrairIdDaUrl(url) {
    const partes = url.split('/').filter(Boolean);
    return parseInt(partes.pop());
}

export function isFormaEspecial(pokemonData) {
    const nome = pokemonData.name.toLowerCase();
    return nome.includes('-mega') || nome.includes('-gmax') || 
           nome.includes('-alola') || nome.includes('-galar') ||
           nome.includes('-hisui') || nome.includes('-paldea');
}