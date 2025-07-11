WSDL_URL = 'https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL'
client = Client(WSDL_URL)

from zeep import Client
from zeep.exceptions import Fault

WSDL_URL = 'https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL'

def main():
    client = Client(WSDL_URL)
    service = client.service

    while True:
        entrada = input("Digite um número inteiro (ou 'sair' para encerrar): ").strip()
        if entrada.lower() in ('sair', 'exit', 'q'):
            print("Encerrando...")
            break

        if not entrada.isdigit():
            print("Por favor, digite apenas dígitos.")
            continue

        try:
            numero = int(entrada)
            resposta = service.NumberToWords(ubiNum=numero)
            print(f"\n{numero} por extenso (em inglês):\n{resposta}\n")
        except Fault as e:
            print("Erro no serviço SOAP:", e)
        except Exception as ex:
            print("Ocorreu um erro:", ex)

if __name__ == '__main__':
    main()
