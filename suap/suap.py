import requests
from getpass import getpass
from rich.console import Console
from rich.table import Table

API_BASE_URL = "https://suap.ifrn.edu.br/api/"
console = Console()


def autenticar_usuario():
    """Autentica o usuário no SUAP e retorna o token de acesso."""
    usuario = input("Usuário SUAP: ")
    senha = getpass("Senha: ")
    dados_login = {"username": usuario, "password": senha}

    resposta = requests.post(f"{API_BASE_URL}v2/autenticacao/token/", json=dados_login)
    
    if resposta.status_code != 200:
        console.print("❌ [red]Erro ao autenticar.[/red]")
        console.print(f"[yellow]Detalhes:[/yellow] {resposta.text}")
        exit(1)

    return resposta.json()["access"]


def buscar_boletim(token, ano):
    """Busca o boletim do ano informado usando o token de autenticação."""
    headers = {"Authorization": f"Bearer {token}"}
    url_boletim = f"{API_BASE_URL}edu/meu-boletim/{ano}/1/"
    
    resposta = requests.get(url_boletim, headers=headers)

    if resposta.status_code != 200:
        console.print("❌ [red]Erro ao buscar boletim.[/red]")
        console.print(f"[yellow]Detalhes:[/yellow] {resposta.text}")
        exit(1)

    return resposta.json()


def exibir_boletim(boletim, ano):
    """Exibe o boletim em formato de tabela formatada."""
    tabela = Table(title=f"Boletim {ano} - 1º período")

    tabela.add_column("Disciplina", style="deep_pink1")
    tabela.add_column("1ª Unidade", style="#9B59B6")
    tabela.add_column("2ª Unidade", style="#9B59B6")
    tabela.add_column("3ª Unidade", style="#9B59B6")
    tabela.add_column("4ª Unidade", style="#9B59B6")
    tabela.add_column("Média Final", style="red")
    tabela.add_column("Situação", style="green")
    tabela.add_column("Faltas", style="white")

    for disciplina in boletim:
        tabela.add_row(
            disciplina.get("disciplina", "—"),
            str(disciplina.get("nota_etapa_1", {}).get("nota", "—")),
            str(disciplina.get("nota_etapa_2", {}).get("nota", "—")),
            str(disciplina.get("nota_etapa_3", {}).get("nota", "—")),
            str(disciplina.get("nota_etapa_4", {}).get("nota", "—")),
            str(disciplina.get("media_final_disciplina", "—")),
            disciplina.get("situacao", "—"),
            str(disciplina.get("numero_faltas", "—")),
        )

    console.print(tabela)


def main():
    token = autenticar_usuario()
    ano_letivo = input("Digite o ano (ex: 2024): ")
    boletim = buscar_boletim(token, ano_letivo)
    exibir_boletim(boletim, ano_letivo)


if __name__ == "__main__":
    main()
