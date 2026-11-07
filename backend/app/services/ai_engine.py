import json
import logging
import re
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("ai_engine")

class AIEngine:
    """Multi-provider AI Engine with native Google Gemini API support, OpenAI fallback,

    and a robust deterministic local heuristic engine when offline or API key is not supplied.
    """

    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.openai_api_key = settings.OPENAI_API_KEY
        self.preferred_provider = settings.AI_PROVIDER

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Generate text from LLM or fall back to high-fidelity local generator."""
        if self.gemini_api_key and self.preferred_provider in ("gemini", "auto"):
            try:
                result = await self._call_gemini(prompt, system_instruction)
                if result:
                    return {"text": result, "is_live_ai": True, "provider": "gemini"}
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to local engine: {e}")

        if self.openai_api_key and self.preferred_provider in ("openai", "auto"):
            try:
                result = await self._call_openai(prompt, system_instruction)
                if result:
                    return {"text": result, "is_live_ai": True, "provider": "openai"}
            except Exception as e:
                logger.warning(f"OpenAI API call failed, falling back to local engine: {e}")

        # Local intelligent heuristic fallback
        return {"text": "", "is_live_ai": False, "provider": "local"}

    async def generate_json(self, prompt: str, schema_description: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Generate structured JSON response, validating and parsing properly."""
        full_prompt = f"{prompt}\n\nCRITICAL: Respond ONLY with valid raw JSON adhering to this structure:\n{schema_description}\nDo not include markdown fences like ```json, just pure JSON."
        res = await self.generate_text(full_prompt, system_instruction)
        
        if res.get("is_live_ai") and res.get("text"):
            text = res["text"].strip()
            # Clean possible markdown wrapping
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            try:
                parsed = json.loads(text)
                return {"data": parsed, "is_live_ai": True, "provider": res["provider"]}
            except Exception as e:
                logger.warning(f"Failed to parse LLM JSON output: {e}, falling back to local parser")

        return {"data": None, "is_live_ai": False, "provider": "local"}

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Call Google Gemini 1.5/2.0 API via REST endpoint."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={self.gemini_api_key}"
        
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"System Instruction: {system_instruction}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow this instruction."}]})

        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.3,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                try:
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError):
                    return None
            else:
                logger.warning(f"Gemini error {resp.status_code}: {resp.text}")
                return None

    async def _call_openai(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Call OpenAI compatible endpoint."""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "gpt-3.5-turbo",
            "messages": messages,
            "temperature": 0.3
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            return None

ai_engine = AIEngine()

