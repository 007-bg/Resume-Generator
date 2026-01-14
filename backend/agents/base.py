"""
Base Agent class for the multi-agent system.
All agents inherit from this class.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the resume pipeline.
    """
    
    name: str = "base_agent"
    description: str = "Base agent"
    
    def __init__(self):
        self.llm = self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the LLM based on configuration."""
        provider = getattr(settings, 'LLM_PROVIDER', 'huggingface')
        
        if provider == 'openai':
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model="gpt-4o-mini",
                api_key=settings.OPENAI_API_KEY,
                temperature=0.7,
            )
        else:
            # Default to Hugging Face
            from langchain_community.llms import HuggingFaceHub
            return HuggingFaceHub(
                repo_id="mistralai/Mistral-7B-Instruct-v0.2",
                huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
                model_kwargs={"temperature": 0.7, "max_new_tokens": 2048}
            )
    
    @abstractmethod
    def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the input state and return updated state.
        
        Args:
            state: Current pipeline state
            
        Returns:
            Updated state with this agent's output
        """
        pass
    
    @abstractmethod
    def get_prompt(self, state: Dict[str, Any]) -> str:
        """
        Generate the prompt for the LLM.
        
        Args:
            state: Current pipeline state
            
        Returns:
            Formatted prompt string
        """
        pass
    
    def validate_output(self, output: Dict[str, Any]) -> bool:
        """
        Validate the agent's output.
        
        Args:
            output: Agent output to validate
            
        Returns:
            True if valid, False otherwise
        """
        return output is not None
    
    def handle_error(self, error: Exception, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle errors during processing.
        
        Args:
            error: The exception that occurred
            state: Current pipeline state
            
        Returns:
            Updated state with error information
        """
        logger.error(f"Agent {self.name} error: {error}")
        state['errors'] = state.get('errors', []) + [f"{self.name}: {str(error)}"]
        return state
    
    def __call__(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Make the agent callable for LangGraph integration."""
        try:
            return self.process(state)
        except Exception as e:
            return self.handle_error(e, state)
