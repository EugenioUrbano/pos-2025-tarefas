import json

with open("imobiliaria.json", "r", encoding="utf-8") as f:
    dados = json.load(f)

imoveis = dados["imobiliaria"]

print("Imóveis disponíveis:")
for idx, imovel in enumerate(imoveis, start=1):
    print(f"{idx} - {imovel['descricao']}")

try:
    escolha = int(input("\nDigite o número do imóvel para ver os detalhes: "))
    if 1 <= escolha <= len(imoveis):
        imovel = imoveis[escolha - 1]

        print("\nDetalhes do Imóvel:")
        print(f"Descrição: {imovel['descricao']}")
        print("\nProprietário:")
        print(f"  Nome: {imovel['proprietario']['nome']}")
        if imovel['proprietario']['telefones']:
            print("  Telefones:")
            for tel in imovel['proprietario']['telefones']:
                print(f"    - {tel}")
        if imovel['proprietario']['emails']:
            print("  Emails:")
            for email in imovel['proprietario']['emails']:
                print(f"    - {email}")

        print("\nEndereço:")
        print(f"  Rua: {imovel['endereco']['rua']}")
        print(f"  Bairro: {imovel['endereco']['bairro']}")
        print(f"  Cidade: {imovel['endereco']['cidade']}")
        numero = imovel['endereco']['numero']
        print(f"  Número: {numero if numero else 'Não informado'}")

        print("\nCaracterísticas:")
        print(f"  Tamanho: {imovel['caracteristicas']['tamanho']}")
        print(f"  Quartos: {imovel['caracteristicas']['numQuartos']}")
        print(f"  Banheiros: {imovel['caracteristicas']['numBanheiros']}")

        print(f"\nValor: R$ {imovel['valor']}")
    else:
        print("Número inválido. Por favor, selecione um número do menu.")
except ValueError:
    print("Entrada inválida. Por favor, digite um número.")