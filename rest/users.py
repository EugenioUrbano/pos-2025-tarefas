import requests

BASE_URL = "https://jsonplaceholder.typicode.com/users" 

def list():
    response = requests.get(BASE_URL)
    response.raise_for_status()
    return response.json()

def create(user_data):
    response = requests.post(BASE_URL, json=user_data)
    response.raise_for_status()
    return response.json()

def read(user_id):
    response = requests.get(f"{BASE_URL}/{user_id}")
    response.raise_for_status()
    return response.json()

def update(user_id, user_data):
    response = requests.put(f"{BASE_URL}/{user_id}", json=user_data)
    response.raise_for_status()
    return response.json()

def delete(user_id):
    response = requests.delete(f"{BASE_URL}/{user_id}")
    response.raise_for_status()
    return {"message": "User deleted successfully"}