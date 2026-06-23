import streamlit as st
import pandas as pd
from utils.api import get_api_client
from utils.helpers import format_datetime

def show_jobs():
    """Show jobs management page"""
    st.markdown("## 💼 Job Postings")
    
    api = get_api_client()
    
    # Tabs for view/create
    tab1, tab2 = st.tabs(["📋 View Jobs", "➕ Post New Job"])
    
    with tab1:
        try:
            with st.spinner("Loading jobs..."):
                jobs_response = api.get("/jobs")
            
            jobs = jobs_response if isinstance(jobs_response, list) else jobs_response.get("data", [])
            
            if not jobs:
                st.info("No jobs posted yet. Create your first job to get started!")
            else:
                for job in jobs:
                    with st.container():
                        col1, col2 = st.columns([3, 1])
                        
                        with col1:
                            st.markdown(f"### {job.get('title', 'Untitled')}")
                            
                            col_a, col_b = st.columns(2)
                            with col_a:
                                if job.get('department'):
                                    st.caption(f"📁 Department: {job.get('department')}")
                                if job.get('location'):
                                    st.caption(f"📍 Location: {job.get('location')}")
                            with col_b:
                                if job.get('isActive'):
                                    st.success("🟢 Active")
                                else:
                                    st.warning("🔴 Closed")
                            
                            st.write(job.get('description', 'No description')[:200] + "...")
                        
                        with col2:
                            candidates_count = job.get('_count', {}).get('candidates', 0)
                            st.metric("Candidates", candidates_count)
                        
                        col_x, col_y = st.columns(2)
                        with col_x:
                            if st.button("👁️ View", key=f"view_job_{job.get('id')}", use_container_width=True):
                                st.session_state.selected_job_id = job.get('id')
                                st.session_state.job_action = "view"
                                st.rerun()
                        with col_y:
                            if st.button("✏️ Edit", key=f"edit_job_{job.get('id')}", use_container_width=True):
                                st.session_state.selected_job_id = job.get('id')
                                st.session_state.job_action = "edit"
                                st.rerun()
                        
                        st.divider()
        
        except Exception as e:
            st.error(f"Error loading jobs: {str(e)}")
    
    with tab2:
        st.markdown("### Create New Job Posting")
        
        title = st.text_input("Job Title", placeholder="Senior Software Engineer")
        department = st.text_input("Department", placeholder="Engineering")
        location = st.text_input("Location", placeholder="New York, NY")
        
        description = st.text_area("Job Description", placeholder="Enter job details...", height=150)
        requirements = st.text_area("Requirements", placeholder="Enter job requirements...", height=150)
        
        if st.button("📤 Post Job", use_container_width=True, type="primary"):
            if not all([title, description, requirements]):
                st.error("Please fill in all required fields")
            else:
                try:
                    with st.spinner("Creating job posting..."):
                        api.post("/jobs", json_data={
                            "title": title,
                            "department": department,
                            "location": location,
                            "description": description,
                            "requirements": requirements,
                            "isActive": True
                        })
                    st.success("Job posted successfully!")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error creating job: {str(e)}")
