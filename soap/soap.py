import urllib.request
import xml.dom.minidom as minidom

WSDL_URL = "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso"

SOAP_HEADERS = {
    "Content-Type": "text/xml; charset=utf-8"
}

def call_soap(soap_action, body_xml):
    req = urllib.request.Request(WSDL_URL, data=body_xml.encode("utf-8"), headers={
        **SOAP_HEADERS,
        "SOAPAction": soap_action
    })
    with urllib.request.urlopen(req) as res:
        return res.read()

def list_countries():
    body = """<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <ListOfCountryNamesByName xmlns="http://www.oorsprong.org/websamples.countryinfo"/>
      </soap:Body>
    </soap:Envelope>"""
    resp = call_soap("http://www.oorsprong.org/websamples.countryinfo/ListOfCountryNamesByName", body)
    dom = minidom.parseString(resp)
    countries = dom.getElementsByTagName("tCountryCodeAndName")
    print("=== Países (código - nome) ===")
    for country in countries[:20]:  
        code = country.getElementsByTagName("sISOCode")[0].firstChild.nodeValue
        name = country.getElementsByTagName("sName")[0].firstChild.nodeValue
        print(f"{code} – {name}")
    if len(countries) > 20:
        print(f"... e mais {len(countries) - 20} países")

def country_currency(iso_code):
    body = f"""<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <CountryCurrency xmlns="http://www.oorsprong.org/websamples.countryinfo">
          <sCountryISOCode>{iso_code}</sCountryISOCode>
        </CountryCurrency>
      </soap:Body>
    </soap:Envelope>"""
    resp = call_soap("http://www.oorsprong.org/websamples.countryinfo/CountryCurrency", body)
    dom = minidom.parseString(resp)
    currency = dom.getElementsByTagName("tCurrency")[0]
    code = currency.getElementsByTagName("sISOCode")[0].firstChild.nodeValue
    name = currency.getElementsByTagName("sName")[0].firstChild.nodeValue
    print(f"Moeda de {iso_code}: {code} – {name}")

def capital_city(iso_code):
    body = f"""<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <CapitalCity xmlns="http://www.oorsprong.org/websamples.countryinfo">
          <sCountryISOCode>{iso_code}</sCountryISOCode>
        </CapitalCity>
      </soap:Body>
    </soap:Envelope>"""
    resp = call_soap("http://www.oorsprong.org/websamples.countryinfo/CapitalCity", body)
    dom = minidom.parseString(resp)
    capital = dom.getElementsByTagName("m:CapitalCityResult")
    if not capital:
        capital = dom.getElementsByTagName("CapitalCityResult")
    city = capital[0].firstChild.nodeValue if capital and capital[0].firstChild else "(não informado)"
    print(f"Capital de {iso_code}: {city}")

def main():
    while True:
        print("\n=== Menu CountryInfoService ===")
        print("1 – Listar países")
        print("2 – Mostrar moeda de um país (ISO)")
        print("3 – Mostrar capital de um país (ISO)")
        print("0 – Sair")
        escolha = input("Digite sua opção: ").strip()
        if escolha == "1":
            list_countries()
        elif escolha in ("2", "3"):
            iso = input("Digite o código ISO do país (ex.: BR, US, JP): ").strip().upper()
            if escolha == "2":
                country_currency(iso)
            else:
                capital_city(iso)
        elif escolha == "0":
            print("Tchau!")
            break
        else:
            print("Opção inválida, tente de novo.")

if __name__ == "__main__":
    main()
