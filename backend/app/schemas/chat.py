from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="allow", protected_namespaces=())

    message: str = Field(default="")
    scene: str = Field(default="general")
    experiment_id: str | None = None
    step_id: str | None = None
    current_step: str | None = None
    pageContext: str | None = None
    platform: str | None = None
    model: str | None = None
    systemPrompt: str | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)
    messages: list[dict[str, Any]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    success: bool
    message: str
    platform: str
    model: str
    scene: str
    timestamp: int
    sources: list[dict[str, Any]] = Field(default_factory=list)
