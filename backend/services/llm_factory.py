"""Factory utilities for creating chat models from runtime configuration."""

from typing import Any

import torch

from core.config import config


def create_chat_model() -> Any:
    """Create a chat-compatible LLM based on config.LLM_PROVIDER."""
    provider = (config.LLM_PROVIDER or "google").strip().lower()

    if provider in {"cloudflare", "cf", "cloudflare_workers"}:
        from services.llm.cloudflare_worker import ChatCloudflareWorker

        if not config.CLOUDFLARE_BASE_URL:
            raise ValueError(
                "CLOUDFLARE_BASE_URL is empty. "
                "Set CLOUDFLARE_BASE_URL to your Cloudflare Workers AI endpoint "
                "(e.g., 'https://your-worker.workers.dev')."
            )

        return ChatCloudflareWorker(
            base_url=config.CLOUDFLARE_BASE_URL,
            api_key=config.CLOUDFLARE_API_KEY,
            model_name=config.CLOUDFLARE_MODEL,
            temperature=config.LLM_TEMPERATURE,
        )

    if provider in {"orimise", "openai_compatible"}:
        from langchain_openai import ChatOpenAI

        if not config.ORIMISE_API_KEY:
            raise ValueError(
                "ORIMISE_API_KEY is empty. "
                "Set ORIMISE_API_KEY or switch LLM_PROVIDER to another provider."
            )

        return ChatOpenAI(
            base_url=config.ORIMISE_BASE_URL,
            api_key=config.ORIMISE_API_KEY,
            model=config.ORIMISE_MODEL,
            temperature=config.LLM_TEMPERATURE,
        )

    if provider in {"ollama", "local_ollama"}:
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=config.OLLAMA_MODEL,
            base_url=config.OLLAMA_BASE_URL,
            temperature=config.LLM_TEMPERATURE,
        )

    if provider in {"google", "gemini"}:
        if not config.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is empty. Set GEMINI_API_KEY or switch LLM_PROVIDER to ollama/huggingface_local."
            )

        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=config.MODEL,
            google_api_key=config.GEMINI_API_KEY,
            temperature=config.LLM_TEMPERATURE,
        )

    if provider in {"huggingface_local", "hf_local", "huggingface"}:
        from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
        from langchain_huggingface import HuggingFacePipeline, ChatHuggingFace

        torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        model_kwargs = {
            "torch_dtype": torch_dtype,
            "trust_remote_code": True,
        }
        if torch.cuda.is_available():
            model_kwargs["device_map"] = "auto"

        tokenizer = AutoTokenizer.from_pretrained(
            config.LOCAL_LLM_MODEL_ID,
            trust_remote_code=True,
        )
        model = AutoModelForCausalLM.from_pretrained(
            config.LOCAL_LLM_MODEL_ID,
            **model_kwargs,
        )

        text_gen = pipeline(
            task="text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=config.LOCAL_LLM_MAX_NEW_TOKENS,
            temperature=config.LLM_TEMPERATURE,
            do_sample=config.LLM_TEMPERATURE > 0,
            repetition_penalty=1.05,
            return_full_text=False,
        )

        llm = HuggingFacePipeline(pipeline=text_gen)
        return ChatHuggingFace(llm=llm)

    raise ValueError(
        f"Unsupported LLM_PROVIDER '{config.LLM_PROVIDER}'. "
        "Use 'cloudflare', 'ollama', 'google', or 'huggingface_local'."
    )
