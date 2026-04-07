"""Test working models on Orimise."""
from dotenv import load_dotenv
load_dotenv()

from core.config import config
import httpx

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
                "messages": [{"role": "user", "content": "Xin chào, bạn là ai? Trả lời ngắn gọn."}],
                "temperature": 0.3,
            },
            timeout=60.0,
        )
        data = resp.json()
        if resp.status_code == 200:
            content = data["choices"][0]["message"].get("content")
            reasoning = data["choices"][0]["message"].get("reasoning_content")
            print(f"  Content: {content[:200] if content else 'NULL'}")
            if reasoning:
                print(f"  Reasoning: {reasoning[:100]}...")
        else:
            print(f"  Error ({resp.status_code}): {resp.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")

# Test models that are likely to work
models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3-flash",
    "claude-sonnet-4-5-20250929",
    "gpt-5.1",
    "gpt-5.2",
    "gpt-5.4",
]

for m in models:
    test_model(m)
