import streamlit as st
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Page config
st.set_page_config(
    page_title="HireFlow - AI Recruitment",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None
if "tenant_id" not in st.session_state:
    st.session_state.tenant_id = None

# Custom CSS
st.markdown("""
<style>
    .main {
        max-width: 1400px;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
    }
    .candidate-card {
        border-left: 4px solid #667eea;
        padding: 15px;
        border-radius: 5px;
        background-color: #f8f9fa;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Import auth utilities
from utils.auth import is_authenticated, get_current_user, logout

def show_home():
    """Show home page"""
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.title("🎯 HireFlow")
        st.markdown("""
        ### Hire smarter. 3 minutes, not weeks.
        
        HireFlow's AI-powered recruitment platform automates the entire hiring process:
        
        **🤖 4-Stage AI Pipeline:**
        - 📄 Resume Screening - AI scores against job description
        - 📝 Assessment - Custom tests generated automatically
        - 📊 Evaluation - Answers graded by AI
        - 🎤 AI Interview - Live voice interviews conducted
        
        **Why HireFlow?**
        ✅ Reduce hiring time from weeks to minutes
        ✅ AI-powered screening eliminates bias
        ✅ Automated assessments and evaluations
        ✅ Scale recruitment without hiring teams
        """)
        
        col1a, col1b = st.columns(2)
        with col1a:
            if st.button("🚀 Get Started", use_container_width=True):
                st.session_state.page = "register"
                st.rerun()
        with col1b:
            if st.button("📋 Browse Jobs", use_container_width=True):
                st.session_state.page = "jobs"
                st.rerun()
    
    with col2:
        st.markdown("""
        #### How it works:
        
        1. **Post Job** - Create job posting with description
        2. **Receive Applications** - Candidates apply with resume
        3. **AI Screening** - System automatically screens candidates
        4. **Assessment** - AI generates custom technical assessment
        5. **Evaluation** - AI evaluates candidate responses
        6. **Interview** - AI conducts voice interview
        7. **Decision** - Get final recommendation
        
        ---
        
        **Trusted by companies worldwide**
        
        🌟 Save 90% recruitment time
        💰 Reduce hiring costs
        🎯 Better candidate quality
        🌍 Global talent access
        """)

def show_sidebar():
    """Show sidebar navigation"""
    with st.sidebar:
        st.title("HireFlow")
        
        if not is_authenticated():
            st.markdown("---")
            if st.button("🔐 Login", use_container_width=True):
                st.session_state.page = "login"
                st.rerun()
            if st.button("📝 Register", use_container_width=True):
                st.session_state.page = "register"
                st.rerun()
            if st.button("📋 Browse Jobs", use_container_width=True):
                st.session_state.page = "jobs"
                st.rerun()
        else:
            user = get_current_user()
            st.markdown(f"**👤 {user.get('name', 'User')}**")
            st.markdown(f"_{user.get('email', '')}_")
            st.markdown("---")
            
            st.markdown("### Dashboard")
            if st.button("📊 Pipeline", use_container_width=True):
                st.session_state.page = "dashboard"
                st.rerun()
            
            st.markdown("### Management")
            if st.button("💼 Jobs", use_container_width=True):
                st.session_state.page = "jobs"
                st.rerun()
            if st.button("👥 Candidates", use_container_width=True):
                st.session_state.page = "candidates"
                st.rerun()
            
            st.markdown("---")
            if st.button("🚪 Logout", use_container_width=True):
                logout()
                st.session_state.page = "home"
                st.rerun()

# Initialize page
if "page" not in st.session_state:
    st.session_state.page = "home"

# Show sidebar
show_sidebar()

# Route pages
if is_authenticated():
    if st.session_state.page == "dashboard":
        from pages.dashboard import show_dashboard
        show_dashboard()
    elif st.session_state.page == "jobs":
        from pages.jobs import show_jobs
        show_jobs()
    elif st.session_state.page == "candidates":
        from pages.candidates import show_candidates
        show_candidates()
    else:
        from pages.dashboard import show_dashboard
        show_dashboard()
else:
    if st.session_state.page == "login":
        from pages.auth import show_login
        show_login()
    elif st.session_state.page == "register":
        from pages.auth import show_register
        show_register()
    elif st.session_state.page == "jobs":
        from pages.public_jobs import show_public_jobs
        show_public_jobs()
    else:
        show_home()
