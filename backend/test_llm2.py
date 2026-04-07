"""Deep test for GPT-5 reasoning model via Orimise."""
from dotenv import load_dotenv
load_dotenv()

from core.config import config
import httpx
import json

# Test with different parameters to coax content out of GPT-5
print("=" * 60)

# Test 1: Try with explicit instruction to not use reasoning
print("\n[Test 1] Force short response, no reasoning...")
resp = httpx.post(
    f"{config.ORIMISE_BASE_URL}/chat/completions",
    headers={
        "Authorization": f"Bearer {config.ORIMISE_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": config.ORIMISE_MODEL,
        "messages": [
            {"role": "user", "content": "Say hello in one word."}
        ],
        "temperature": 1.0,  # reasoning models may need temp=1
    },
    timeout=30.0,
)
data = resp.json()
print(f"  Status: {resp.status_code}")
print(f"  Full response: {json.dumps(data, indent=2, ensure_ascii=False)[:1000]}")

# Test 2: Try with max_completion_tokens instead of max_tokens
print("\n[Test 2] With max_completion_tokens...")
resp2 = httpx.post(
    f"{config.ORIMISE_BASE_URL}/chat/completions",
    headers={
        "Authorization": f"Bearer {config.ORIMISE_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": config.ORIMISE_MODEL,
        "messages": [
            {"role": "system", "content": "Reply with only yes or no."},
            {"role": "user", "content": "Is the sky blue?"}
        ],
        "temperature": 1.0,
        "max_completion_tokens": 200,
    },
    timeout=30.0,
)
data2 = resp2.json()
print(f"  Status: {resp2.status_code}")
print(f"  Full response: {json.dumps(data2, indent=2, ensure_ascii=False)[:1000]}")

# Test 3: Try with store=false / reasoning effort
print("\n[Test 3] With reasoning effort low...")
resp3 = httpx.post(
    f"{config.ORIMISE_BASE_URL}/chat/completions",
    headers={
        "Authorization": f"Bearer {config.ORIMISE_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": config.ORIMISE_MODEL,
        "messages": [
            {"role": "user", "content": "Xin chào"}
        ],
        "temperature": 1.0,
        "reasoning": {"effort": "low"},
    },
    timeout=30.0,
)
data3 = resp3.json()
print(f"  Status: {resp3.status_code}")
print(f"  Full response: {json.dumps(data3, indent=2, ensure_ascii=False)[:1000]}")

# Test 4: Try using openai SDK directly
print("\n[Test 4] Using openai SDK directly...")
try:
    from openai import OpenAI
    client = OpenAI(
        api_key=config.ORIMISE_API_KEY,
        base_url=config.ORIMISE_BASE_URL,
    )
    completion = client.chat.completions.create(
        model=config.ORIMISE_MODEL,
        messages=[
            {"role": "user", "content": "Xin chào, bạn là ai?"}
        ],
    )
    msg = completion.choices[0].message
    print(f"  Content: {msg.content}")
    print(f"  Role: {msg.role}")
    print(f"  Has reasoning_content attr: {hasattr(msg, 'reasoning_content')}")
    if hasattr(msg, 'reasoning_content'):
        rc = msg.reasoning_content
        print(f"  Reasoning content: {rc[:200] if rc else 'None'}")
    print(f"  Usage: {completion.usage}")
except Exception as e:
    print(f"  ERROR: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
