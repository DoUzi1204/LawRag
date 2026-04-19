"""Custom LangChain ChatModel for Cloudflare Workers AI.

This wraps a Cloudflare Worker that exposes a custom text-generation API:
  - Endpoint: POST /
  - Input:  {"prompt": "...", "systemPrompt": "...", "history": [...]}
  - Output: {"response": "..."}
"""

import logging
from typing import Any, List, Optional

import httpx
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from pydantic import Field

logger = logging.getLogger(__name__)


class ChatCloudflareWorker(BaseChatModel):
    """LangChain ChatModel that calls a Cloudflare Workers AI endpoint.

    The Worker expects:
      POST / with JSON body:
        {
          "prompt": "<user message>",
          "systemPrompt": "<optional system instruction>",
          "history": [{"role": "user"|"assistant", "content": "..."}]
        }

    And returns:
        {"response": "<generated text>"}
    """

    base_url: str = Field(description="Cloudflare Worker URL (e.g., https://xxx.workers.dev)")
    api_key: str = Field(default="", description="Bearer token for the Worker")
    model_name: str = Field(default="", description="Model identifier (for logging)")
    temperature: float = Field(default=0.3, description="Generation temperature")
    request_timeout: int = Field(default=120, description="HTTP timeout in seconds")

    @property
    def _llm_type(self) -> str:
        return "cloudflare-workers-ai"

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Convert LangChain messages to Worker format and call the API."""

        # ── Convert LangChain messages → Worker body ──────────────────────
        system_prompt: Optional[str] = None
        history: List[dict] = []
        prompt: str = ""

        for msg in messages:
            if isinstance(msg, SystemMessage):
                # Use the last system message as systemPrompt
                system_prompt = msg.content
            elif isinstance(msg, HumanMessage):
                # If we already have a prompt, push it to history first
                if prompt:
                    history.append({"role": "user", "content": prompt})
                prompt = msg.content
            elif isinstance(msg, AIMessage):
                # Push previous prompt to history if exists
                if prompt:
                    history.append({"role": "user", "content": prompt})
                    prompt = ""
                history.append({"role": "assistant", "content": msg.content})

        if not prompt:
            raise ValueError("No HumanMessage found in the message list.")

        # ── Build request ─────────────────────────────────────────────────
        body: dict = {"prompt": prompt}
        if self.model_name:
            body["model"] = self.model_name
        if system_prompt:
            body["systemPrompt"] = system_prompt
        if history:
            body["history"] = history

        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        logger.debug(
            f"[CloudflareWorker] Calling {self.base_url} "
            f"(prompt={prompt[:80]}..., history_len={len(history)})"
        )

        # ── Call the Worker ───────────────────────────────────────────────
        try:
            response = httpx.post(
                self.base_url.rstrip("/") + "/",
                json=body,
                headers=headers,
                timeout=self.request_timeout,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            logger.error(f"[CloudflareWorker] HTTP {e.response.status_code}: {error_detail}")
            raise RuntimeError(
                f"Cloudflare Worker returned {e.response.status_code}: {error_detail}"
            ) from e
        except httpx.RequestError as e:
            logger.error(f"[CloudflareWorker] Request failed: {e}")
            raise RuntimeError(f"Failed to connect to Cloudflare Worker: {e}") from e

        # ── Parse response ────────────────────────────────────────────────
        result = response.json()
        text = result.get("response", "")

        if not text:
            logger.warning(
                f"[CloudflareWorker] Empty response from Worker. "
                f"Full response: {result}"
            )

        return ChatResult(
            generations=[ChatGeneration(message=AIMessage(content=text))]
        )
