import requests

API_URL = "http://localhost:3001/api"
API_KEY = "04d0646e99813bf0c9b56034de40ada548dcd247f7986dce96db7376b37d9e25"

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

# Update item value
def update_item(name, value, date):
    response = requests.post(
        f"{API_URL}/items/{name}/update",
        headers=headers,
        json={"value": value, "date": date}
    )
    return response.json()

# Example usage
result = update_item("Pika", 4500, "2025-01-22")
print(result)