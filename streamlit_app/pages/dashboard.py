import streamlit as st
import pandas as pd
from utils.api import get_api_client
from utils.helpers import format_stage, format_score, format_datetime

def show_dashboard():
    """Show pipeline dashboard"""
    st.markdown("## 📊 Pipeline Dashboard")
    st.markdown("Live candidate tracking across all stages")
    
    api = get_api_client()
    
    try:
        # Fetch data
        with st.spinner("Loading pipeline..."):
            candidates_response = api.get("/candidates")
            stats_response = api.get("/tenants/stats")
        
        candidates = candidates_response if isinstance(candidates_response, list) else candidates_response.get("data", [])
        stats = stats_response if isinstance(stats_response, dict) else stats_response.get("data", {})
        
        # Stats row
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Candidates", stats.get("totalCandidates", 0))
        with col2:
            st.metric("Passed Screening", stats.get("passedScreening", 0))
        with col3:
            st.metric("In Assessment", stats.get("inAssessment", 0))
        with col4:
            st.metric("Hired", stats.get("hired", 0))
        
        st.markdown("---")
        
        # Pipeline stages
        st.markdown("### Candidate Pipeline")
        
        stages = [
            ("APPLIED", "Applied / Screening", "🔵"),
            ("ASSESSMENT", "Assessment / Evaluating", "🟨"),
            ("INTERVIEW", "Interview", "🟪"),
            ("HIRED", "Hired / Rejected", "🟢"),
        ]
        
        cols = st.columns(4)
        
        for idx, (stage_key, stage_name, emoji) in enumerate(stages):
            with cols[idx]:
                st.markdown(f"### {emoji} {stage_name}")
                
                # Filter candidates for this stage
                if stage_key == "APPLIED":
                    stage_candidates = [c for c in candidates if c.get("stage") in ["APPLIED", "SCREENING", "SCREENED_OUT"]]
                elif stage_key == "ASSESSMENT":
                    stage_candidates = [c for c in candidates if c.get("stage") in ["ASSESSMENT", "EVALUATING"]]
                elif stage_key == "INTERVIEW":
                    stage_candidates = [c for c in candidates if c.get("stage") == "INTERVIEW"]
                else:  # HIRED
                    stage_candidates = [c for c in candidates if c.get("stage") in ["HIRED", "REJECTED"]]
                
                st.markdown(f"**{len(stage_candidates)} candidates**")
                
                for candidate in stage_candidates[:5]:  # Show top 5
                    score = candidate.get("screeningScore")
                    score_text = f" • {format_score(score)}" if score is not None else ""
                    
                    with st.container():
                        st.write(f"👤 **{candidate.get('name')}**")
                        st.caption(f"{format_stage(candidate.get('stage', 'N/A'))}{score_text}")
                        if st.button("View", key=f"candidate_{candidate.get('id')}", use_container_width=True):
                            st.session_state.selected_candidate_id = candidate.get("id")
                            st.session_state.page = "candidates"
                            st.rerun()
                        st.write("")
        
        # Action buttons
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("➕ Post New Job", use_container_width=True):
                st.session_state.page = "jobs"
                st.rerun()
        with col2:
            if st.button("🔄 Refresh", use_container_width=True):
                st.rerun()
                
    except Exception as e:
        st.error(f"Error loading dashboard: {str(e)}")
