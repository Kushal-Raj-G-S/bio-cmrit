import requests
r = requests.get("http://127.0.0.1:8000/api/gateway/krishiausadh/health")
print(r.status_code)
print(r.json())
