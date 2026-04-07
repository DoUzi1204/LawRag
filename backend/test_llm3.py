"""Test other models via Orimise to see if it's GPT-5 specific."""
from dotenv import load_dotenv
load_dotenv()

from core.config import config
import httpx
import json

def test_model(model_name):
    print(f"\n[Testing] {model_name}")
    try:
        resp = httpx.post(
            f"{config.ORIMISE_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {config.ORIMISE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": "Say hello"}],
                "temperature": 0.3,
            },
            timeout=30.0,
        )
        data = resp.json()
        if resp.status_code == 200:
            content = data["choices"][0]["message"].get("content")
            reasoning = data["choices"][0]["message"].get("reasoning_content")
            tokens = data.get("usage", {})
            print(f"  Status: {resp.status_code}")
            print(f"  Content: {content}")
            print(f"  Reasoning: {reasoning}")
            print(f"  Tokens: {tokens}")
        else:
            print(f"  Status: {resp.status_code}")
            print(f"  Error: {resp.text[:300]}")
    except Exception as e:
        print(f"  ERROR: {e}")

# Test different models
models_to_try = [
    "gpt-5",
    "gpt-4o",
    "gpt-4o-mini",
    "o4-mini",
    "gpt-3.5-turbo",
]

for m in models_to_try:
    test_model(m)

# Also test: does the Orimise /models endpoint exist?
print("\n[Models endpoint]")
try:
    resp = httpx.get(
        f"{config.ORIMISE_BASE_URL}/models",
        headers={"Authorization": f"Bearer {config.ORIMISE_API_KEY}"},
        timeout=10.0,
    )
    print(f"  Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        models = [m.get("id") for m in data.get("data", [])]
        print(f"  Available models: {models[:20]}")
except Exception as e:
    print(f"  ERROR: {e}")
