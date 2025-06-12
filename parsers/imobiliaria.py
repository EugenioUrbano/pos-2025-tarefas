import json
from xml.dom.minidom import parse

def get_text(node):
    """Retorna o valor de texto de um nó XML."""
    return node.firstChild.nodeValue.strip() if node.firstChild else ""

dom = parse("imobiliaria.xml")

imoveis_json = []

for imovel in dom.getElementsByTagName("imovel"):
    descricao = get_text(imovel.getElementsByTagName("descricao")[0])

    prop = imovel.getElementsByTagName("proprietario")[0]
    nome = get_text(prop.getElementsByTagName("nome")[0])
    
    telefones = [get_text(tel) for tel in prop.getElementsByTagName("telefone")]
    emails = [get_text(email) for email in prop.getElementsByTagName("email")]

    endereco = imovel.getElementsByTagName("endereco")[0]
    rua = get_text(endereco.getElementsByTagName("rua")[0])
    bairro = get_text(endereco.getElementsByTagName("bairro")[0])
    cidade = get_text(endereco.getElementsByTagName("cidade")[0])
    numero_nodes = endereco.getElementsByTagName("numero")
    numero = get_text(numero_nodes[0]) if numero_nodes else None

    carac = imovel.getElementsByTagName("caracteristicas")[0]
    tamanho = get_text(carac.getElementsByTagName("tamanho")[0])
    quartos = get_text(carac.getElementsByTagName("numQuartos")[0])
    banheiros = get_text(carac.getElementsByTagName("numBanheiros")[0])

    valor = get_text(imovel.getElementsByTagName("valor")[0])

    imovel_dict = {
        "descricao": descricao,
        "proprietario": {
            "nome": nome,
            "telefones": telefones,
            "emails": emails
        },
        "endereco": {
            "rua": rua,
            "bairro": bairro,
            "cidade": cidade,
            "numero": numero
        },
        "caracteristicas": {
            "tamanho": tamanho,
            "numQuartos": quartos,
            "numBanheiros": banheiros
        },
        "valor": valor
    }

    imoveis_json.append(imovel_dict)

with open("imobiliaria.json", "w", encoding="utf-8") as f:
    json.dump({"imobiliaria": imoveis_json}, f, ensure_ascii=False, indent=4)

print("Arquivo 'imobiliaria.json' gerado com sucesso.")