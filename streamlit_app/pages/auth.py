import streamlit as st
from utils.auth import login, register

def show_login():
    """Show login page"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("## 🔐 Login")
        st.markdown("---")
        
        email = st.text_input("Email Address", placeholder="you@company.com")
        password = st.text_input("Password", type="password", placeholder="••••••••")
        
        if st.button("Login", use_container_width=True, type="primary"):
            with st.spinner("Logging in..."):
                if login(email, password):
                    st.success("Login successful!")
                    st.session_state.page = "dashboard"
                    st.rerun()
        
        st.markdown("---")
        st.markdown("Don't have an account?")
        if st.button("Create one", use_container_width=True):
            st.session_state.page = "register"
            st.rerun()

def show_register():
    """Show registration page"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("## 📝 Register")
        st.markdown("Create your company account and start hiring with AI")
        st.markdown("---")
        
        # Company info
        st.markdown("### Company Details")
        company_name = st.text_input("Company Name", placeholder="Acme Corporation")
        company_email = st.text_input("Company Email", placeholder="info@acme.com")
        
        # Admin user info
        st.markdown("### Admin Account")
        user_name = st.text_input("Full Name", placeholder="John Doe")
        email = st.text_input("Email Address", placeholder="you@acme.com")
        password = st.text_input("Password", type="password", placeholder="••••••••", min_chars=8)
        
        col_a, col_b = st.columns(2)
        
        with col_a:
            if st.button("Register", use_container_width=True, type="primary"):
                if not all([company_name, company_email, user_name, email, password]):
                    st.error("Please fill in all fields")
                elif len(password) < 8:
                    st.error("Password must be at least 8 characters")
                else:
                    with st.spinner("Creating account..."):
                        if register(company_name, company_email, user_name, email, password):
                            st.success("Account created successfully!")
                            st.session_state.page = "dashboard"
                            st.rerun()
        
        with col_b:
            if st.button("Back to Login", use_container_width=True):
                st.session_state.page = "login"
                st.rerun()
