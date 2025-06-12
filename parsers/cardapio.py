from xml.dom.minidom import parse

doc = parse("cardapio.xml")

pratos = doc.getElementsByTagName("prato")

menu = {}

print("Menu:")
for prato in pratos:
    id_prato = prato.getAttribute("id")
    nome = prato.getElementsByTagName("nome")[0].firstChild.nodeValue
    menu[id_prato] = prato
    print(f"{id_prato} - {nome}")

escolha = input("\nDigite o ID do prato para ver os detalhes: ").strip()

if escolha in menu:
    prato = menu[escolha]
    nome = prato.getElementsByTagName("nome")[0].firstChild.nodeValue
    descricao = prato.getElementsByTagName("descricao")[0].firstChild.nodeValue
    ingredientes = prato.getElementsByTagName("ingrediente")
    preco = prato.getElementsByTagName("preco")[0].firstChild.nodeValue.strip()
    moeda = prato.getElementsByTagName("preco")[0].getAttribute("moeda")
    calorias = prato.getElementsByTagName("calorias")[0].firstChild.nodeValue
    tempo = prato.getElementsByTagName("tempoPreparo")[0].firstChild.nodeValue

    print(f"\nDetalhes do prato '{nome}':")
    print(f"Descrição: {descricao}")
    print("Ingredientes:")
    for ing in ingredientes:
        print(f" - {ing.firstChild.nodeValue}")
    print(f"Preço: {preco} ({moeda})")
    print(f"Calorias: {calorias}")
    print(f"Tempo de Preparo: {tempo}")
else:
    print("ID de prato não encontrado.")