import streamlit as st
from utils.api import get_api_client
from utils.helpers import format_stage

def show_public_jobs():
    """Show public jobs page for candidates"""
    st.markdown("## 📋 Available Jobs")
    st.markdown("Browse and apply for open positions")
    
    api = get_api_client()
    
    try:
        with st.spinner("Loading jobs..."):
            jobs_response = api.get("/jobs/public")
        
        jobs = jobs_response if isinstance(jobs_response, list) else jobs_response.get("data", [])
        
        if not jobs:
            st.info("No jobs available at the moment. Check back soon!")
        else:
            # Search and filter
            col1, col2 = st.columns(2)
            with col1:
                search = st.text_input("Search by title or department")
            with col2:
                department_filter = st.text_input("Filter by department")
            
            # Apply filters
            filtered_jobs = jobs
            
            if search:
                search_lower = search.lower()
                filtered_jobs = [j for j in filtered_jobs if 
                               search_lower in (j.get("title", "") or "").lower() or 
                               search_lower in (j.get("description", "") or "").lower()]
            
            if department_filter:
                dept_lower = department_filter.lower()
                filtered_jobs = [j for j in filtered_jobs if 
                               dept_lower in (j.get("department", "") or "").lower()]
            
            st.markdown(f"**{len(filtered_jobs)}** jobs found")
            st.divider()
            
            # Display jobs
            for job in filtered_jobs:
                with st.container():
                    col1, col2 = st.columns([3, 1])
                    
                    with col1:
                        st.markdown(f"### {job.get('title', 'Untitled')}")
                        
                        details = []
                        if job.get('department'):
                            details.append(f"📁 {job.get('department')}")
                        if job.get('location'):
                            details.append(f"📍 {job.get('location')}")
                        if job.get('salary'):
                            details.append(f"💰 {job.get('salary')}")
                        
                        if details:
                            st.caption(" • ".join(details))
                        
                        st.write(job.get('description', 'No description')[:300] + "...")
                        
                        # Expand button for full details
                        if st.button("📖 View Full Details", key=f"job_details_{job.get('id')}", use_container_width=True):
                            st.session_state.selected_job_id = job.get('id')
                            st.session_state.page = "job_details"
                            st.rerun()
                    
                    with col2:
                        candidates_count = job.get('_count', {}).get('candidates', 0)
                        st.metric("Applicants", candidates_count)
                        
                        if st.button("✉️ Apply", key=f"apply_job_{job.get('id')}", use_container_width=True, type="primary"):
                            st.session_state.selected_job_id = job.get('id')
                            st.session_state.show_apply_form = True
                            st.rerun()
                    
                    st.divider()
    
    except Exception as e:
        st.error(f"Error loading jobs: {str(e)}")
