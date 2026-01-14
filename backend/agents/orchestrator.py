"""
LangGraph Orchestrator - Manages the multi-agent resume pipeline.
"""

import logging
from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END

from .state import ResumeState, create_initial_state
from .generator import GeneratorAgent
from .reviewer import ReviewerAgent
from .analyzer import AnalyzerAgent

logger = logging.getLogger(__name__)


class ResumeOrchestrator:
    """
    Orchestrates the multi-agent resume generation pipeline using LangGraph.
    
    Pipeline flow:
    start -> generator -> reviewer -> (conditional) -> analyzer -> end
                          ^                |
                          |                v
                          +-- regenerate --+
    """
    
    def __init__(self):
        self.generator = GeneratorAgent()
        self.reviewer = ReviewerAgent()
        self.analyzer = AnalyzerAgent()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        
        # Create workflow with state type
        workflow = StateGraph(ResumeState)
        
        # Add nodes for each agent
        workflow.add_node("generator", self._run_generator)
        workflow.add_node("reviewer", self._run_reviewer)
        workflow.add_node("analyzer", self._run_analyzer)
        
        # Set entry point
        workflow.set_entry_point("generator")
        
        # Add edges
        workflow.add_edge("generator", "reviewer")
        
        # Conditional edge from reviewer
        workflow.add_conditional_edges(
            "reviewer",
            self._should_regenerate,
            {
                "regenerate": "generator",
                "continue": "analyzer"
            }
        )
        
        # Final edge to END
        workflow.add_edge("analyzer", END)
        
        # Compile the graph
        return workflow.compile()
    
    def _run_generator(self, state: ResumeState) -> ResumeState:
        """Run the generator agent."""
        logger.info("Running Generator Agent")
        return self.generator.process(dict(state))
    
    def _run_reviewer(self, state: ResumeState) -> ResumeState:
        """Run the reviewer agent."""
        logger.info("Running Reviewer Agent")
        return self.reviewer.process(dict(state))
    
    def _run_analyzer(self, state: ResumeState) -> ResumeState:
        """Run the analyzer agent."""
        logger.info("Running Analyzer Agent")
        return self.analyzer.process(dict(state))
    
    def _should_regenerate(self, state: ResumeState) -> Literal["regenerate", "continue"]:
        """Decide whether to regenerate or continue."""
        should_regen = state.get('should_regenerate', False)
        iteration = state.get('iteration', 0)
        max_iterations = state.get('max_iterations', 3)
        
        if should_regen and iteration < max_iterations:
            logger.info(f"Regenerating (iteration {iteration}/{max_iterations})")
            return "regenerate"
        
        logger.info("Continuing to analyzer")
        return "continue"
    
    def run(
        self,
        user_id: str,
        ground_truth: Dict[str, Any],
        job_description: str = None,
        max_iterations: int = 3
    ) -> Dict[str, Any]:
        """
        Run the complete resume generation pipeline.
        
        Args:
            user_id: User identifier
            ground_truth: User's career data
            job_description: Optional target job description
            max_iterations: Max regeneration attempts
            
        Returns:
            Final state with generated resume
        """
        logger.info(f"Starting resume pipeline for user {user_id}")
        
        # Create initial state
        initial_state = create_initial_state(
            user_id=user_id,
            ground_truth=ground_truth,
            job_description=job_description,
            max_iterations=max_iterations
        )
        
        # Run the graph
        try:
            final_state = self.graph.invoke(initial_state)
            logger.info(f"Pipeline completed. Score: {final_state.get('overall_score')}")
            return dict(final_state)
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            initial_state['errors'] = [str(e)]
            return dict(initial_state)
    
    def run_step(self, state: Dict[str, Any], step: str) -> Dict[str, Any]:
        """
        Run a single step of the pipeline.
        Useful for debugging or step-by-step execution.
        """
        if step == "generator":
            return self._run_generator(state)
        elif step == "reviewer":
            return self._run_reviewer(state)
        elif step == "analyzer":
            return self._run_analyzer(state)
        else:
            raise ValueError(f"Unknown step: {step}")


# Singleton instance
_orchestrator = None

def get_orchestrator() -> ResumeOrchestrator:
    """Get or create the orchestrator singleton."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ResumeOrchestrator()
    return _orchestrator
