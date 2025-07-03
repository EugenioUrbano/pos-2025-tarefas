import argparse
import json
import users  

def main():
    parser = argparse.ArgumentParser(description="CLI para gerenciar usuários via API")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("list", help="Listar todos os usuários")

    read_parser = subparsers.add_parser("read", help="Ler um usuário")
    read_parser.add_argument("id", help="ID do usuário")

    create_parser = subparsers.add_parser("create", help="Criar um novo usuário")
    create_parser.add_argument("data", help="Dados do usuário em JSON")

    update_parser = subparsers.add_parser("update", help="Atualizar um usuário")
    update_parser.add_argument("id", help="ID do usuário")
    update_parser.add_argument("data", help="Dados atualizados em JSON")

    delete_parser = subparsers.add_parser("delete", help="Deletar um usuário")
    delete_parser.add_argument("id", help="ID do usuário")

    args = parser.parse_args()

    try:
        if args.command == "list":
            print(json.dumps(users.list(), indent=2))

        elif args.command == "read":
            print(json.dumps(users.read(args.id), indent=2))

        elif args.command == "create":
            data = json.loads(args.data)
            print(json.dumps(users.create(data), indent=2))

        elif args.command == "update":
            data = json.loads(args.data)
            print(json.dumps(users.update(args.id, data), indent=2))

        elif args.command == "delete":
            print(json.dumps(users.delete(args.id), indent=2))

    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    main()