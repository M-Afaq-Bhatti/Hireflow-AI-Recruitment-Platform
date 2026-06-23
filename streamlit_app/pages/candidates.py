import streamlit as st
import pandas as pd
from utils.api import get_api_client
from utils.helpers import format_stage, format_score, format_datetime

def show_candidates():
    """Show candidates management page"""
    st.markdown("## 👥 Candidates")
    
    api = get_api_client()
    
    try:
        with st.spinner("Loading candidates..."):
            candidates_response = api.get("/candidates")
        
        candidates = candidates_response if isinstance(candidates_response, list) else candidates_response.get("data", [])
        
        if not candidates:
            st.info("No candidates yet. Share your job postings to receive applications!")
        else:
            # Filter options
            col1, col2, col3 = st.columns(3)
            
            with col1:
                selected_stage = st.multiselect(
                    "Filter by Stage",
                    ["APPLIED", "SCREENING", "SCREENED_OUT", "ASSESSMENT", "EVALUATING", "INTERVIEW", "HIRED", "REJECTED"],
                    default=None
                )
            
            with col2:
                sort_by = st.selectbox("Sort by", ["Name", "Score", "Date Applied"])
            
            with col3:
                search = st.text_input("Search by name/email")
            
            # Apply filters
            filtered_candidates = candidates
            
            if selected_stage:
                filtered_candidates = [c for c in filtered_candidates if c.get("stage") in selected_stage]
            
            if search:
                search_lower = search.lower()
                filtered_candidates = [c for c in filtered_candidates if 
                                      search_lower in (c.get("name", "") or "").lower() or 
                                      search_lower in (c.get("email", "") or "").lower()]
            
            # Sort
            if sort_by == "Score":
                filtered_candidates.sort(key=lambda x: x.get("screeningScore") or 0, reverse=True)
            elif sort_by == "Date Applied":
                filtered_candidates.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
            else:
                filtered_candidates.sort(key=lambda x: x.get("name", ""))
            
            st.markdown(f"**{len(filtered_candidates)}** candidates found")
            st.divider()
            
            # Display candidates
            for candidate in filtered_candidates:
                col1, col2, col3 = st.columns([2, 1, 1])
                
                with col1:
                    st.markdown(f"### {candidate.get('name', 'Unknown')}")
                    st.caption(f"📧 {candidate.get('email', 'N/A')}")
                    if candidate.get('job'):
                        st.caption(f"💼 Applied for: {candidate.get('job', {}).get('title', 'N/A')}")
                
                with col2:
                    if candidate.get('screeningScore') is not None:
                        st.markdown(f"**Score:** {format_score(candidate.get('screeningScore'))}")
                    st.markdown(f"**Stage:** {format_stage(candidate.get('stage', 'N/A'))}")
                
                with col3:
                    if candidate.get('resume'):
                        st.markdown("[📄 Resume]()")
                    if st.button("👁️ View Details", key=f"view_candidate_{candidate.get('id')}", use_container_width=True):
                        st.session_state.selected_candidate_id = candidate.get('id')
                        st.rerun()
                
                st.divider()
    
    except Exception as e:
        st.error(f"Error loading candidates: {str(e)}")
