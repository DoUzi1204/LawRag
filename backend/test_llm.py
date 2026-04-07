"""Quick test to verify Orimise/GPT-5 API connectivity."""
import os
import sys

# Load .env
from dotenv import load_dotenv
load_dotenv()

from core.config import config

print("=" * 60)
print("LLM Configuration:")
print(f"  LLM_PROVIDER:   {config.LLM_PROVIDER}")
print(f"  ORIMISE_MODEL:  {config.ORIMISE_MODEL}")
print(f"  ORIMISE_BASE_URL: {config.ORIMISE_BASE_URL}")
print(f"  ORIMISE_API_KEY: {config.ORIMISE_API_KEY[:20]}...")
print(f"  LLM_TEMPERATURE: {config.LLM_TEMPERATURE}")
print("=" * 60)

# Test 1: Raw API call with httpx
print("\n[Test 1] Raw HTTP call to Orimise API...")
import httpx

try:
    resp = httpx.post(
        f"{config.ORIMISE_BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {config.ORIMISE_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": config.ORIMISE_MODEL,
            "messages": [{"role": "user", "content": "Xin chào, bạn là ai?"}],
            "temperature": 0.3,
        },
        timeout=30.0,
    )
    print(f"  Status: {resp.status_code}")
    print(f"  Response: {resp.text[:500]}")
except Exception as e:
    print(f"  ERROR: {e}")

# Test 2: LangChain ChatOpenAI
print("\n[Test 2] LangChain ChatOpenAI call...")
from langchain_openai import ChatOpenAI

try:
    model = ChatOpenAI(
        model=config.ORIMISE_MODEL,
        api_key=config.ORIMISE_API_KEY,
        base_url=config.ORIMISE_BASE_URL,
        temperature=config.LLM_TEMPERATURE,
    )
    result = model.invoke("Xin chào, bạn là ai?")
    print(f"  Type: {type(result)}")
    print(f"  Content: {result.content[:300]}")
except Exception as e:
    print(f"  ERROR: {type(e).__name__}: {e}")

# Test 3: Simple chain (simulating the routing logic)
print("\n[Test 3] Route chain test (yes/no)...")
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

try:
    model = ChatOpenAI(
        model=config.ORIMISE_MODEL,
        api_key=config.ORIMISE_API_KEY,
        base_url=config.ORIMISE_BASE_URL,
        temperature=config.LLM_TEMPERATURE,
    )
    
    route_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a query router for a Vietnamese law assistant.
Determine if the following query requires searching legal documents.
Return "yes" if it's about legal topics.
Return "no" if it's a greeting or non-legal question.
You must respond with ONLY "yes" or "no", nothing else."""),
        ("human", "Query: {query}\n\nOutput:"),
    ])
    
    chain = route_prompt | model | StrOutputParser()
    result = chain.invoke({"query": "Luật lao động quy định gì về sa thải?"})
    print(f"  Raw result: '{result}'")
    print(f"  Stripped: '{result.strip().lower()}'")
    print(f"  Is 'yes': {result.strip().lower() == 'yes'}")
except Exception as e:
    print(f"  ERROR: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print("Tests complete.")
