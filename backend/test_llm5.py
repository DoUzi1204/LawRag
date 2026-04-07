"""Final test - focus on working models."""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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
                "messages": [{"role": "user", "content": "Say hello in Vietnamese, one sentence."}],
                "temperature": 0.3,
            },
            timeout=60.0,
        )
        data = resp.json()
        if resp.status_code == 200:
            content = data["choices"][0]["message"].get("content")
            print(f"  Content: {repr(content)}")
            print(f"  Has content: {bool(content)}")
        else:
            print(f"  Error ({resp.status_code}): {resp.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {type(e).__name__}: {e}")

# Focus on models that might work
test_model("gemini-3-flash")
test_model("gemini-3.1-pro")
test_model("claude-sonnet-4-6")
test_model("claude-sonnet-4-20250514")
test_model("claude-haiku-4-5-20251001")
test_model("claude-opus-4-6")
