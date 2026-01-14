"""
LangGraph Multi-Agent State Definition.
Defines the shared state that flows through the agent pipeline.
"""

from typing import TypedDict, List, Optional, Dict, Any
from dataclasses import dataclass, field


class ResumeState(TypedDict):
    """
    Shared state for the multi-agent resume pipeline.
    This state flows through: Generator -> Reviewer -> Analyzer
    """
    # Input data
    user_id: str
    job_description: Optional[str]
    ground_truth: Dict[str, Any]  # User's career data
    
    # Agent outputs (accumulated)
    generated_content: Optional[Dict[str, Any]]  # Generator output
    review_feedback: Optional[Dict[str, Any]]    # Reviewer output
    analysis_result: Optional[Dict[str, Any]]    # Analyzer output
    
    # Pipeline control
    current_step: str
    iteration: int
    max_iterations: int
    should_regenerate: bool
    
    # Error handling
    errors: List[str]
    
    # Final output
    final_resume: Optional[Dict[str, Any]]
    overall_score: Optional[float]


@dataclass
class AgentMessage:
    """Message passed between agents."""
    agent_name: str
    content: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: "")
    success: bool = True
    error: Optional[str] = None


def create_initial_state(
    user_id: str,
    ground_truth: Dict[str, Any],
    job_description: Optional[str] = None,
    max_iterations: int = 3
) -> ResumeState:
    """Create initial state for the pipeline."""
    return ResumeState(
        user_id=user_id,
        job_description=job_description,
        ground_truth=ground_truth,
        generated_content=None,
        review_feedback=None,
        analysis_result=None,
        current_step="start",
        iteration=0,
        max_iterations=max_iterations,
        should_regenerate=False,
        errors=[],
        final_resume=None,
        overall_score=None
    )
