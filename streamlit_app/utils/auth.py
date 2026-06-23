import streamlit as st
from .api import get_api_client
from typing import Optional, Dict, Any

def is_authenticated() -> bool:
    """Check if user is authenticated"""
    return st.session_state.get("token") is not None and st.session_state.get("user") is not None

def get_current_user() -> Optional[Dict[str, Any]]:
    """Get current authenticated user"""
    return st.session_state.get("user")

def register(company_name: str, company_email: str, user_name: str, email: str, password: str) -> bool:
    """Register a new company and admin user"""
    try:
        api = get_api_client()
        response = api.post("/auth/register", json_data={
            "companyName": company_name,
            "companyEmail": company_email,
            "userName": user_name,
            "email": email,
            "password": password
        })
        
        if response and response.get("token"):
            st.session_state.token = response["token"]
            st.session_state.user = response.get("user", {})
            st.session_state.tenant_id = response.get("tenant", {}).get("id")
            return True
        return False
    except Exception as e:
        st.error(f"Registration failed: {str(e)}")
        return False

def login(email: str, password: str) -> bool:
    """Login with email and password"""
    try:
        api = get_api_client()
        response = api.post("/auth/login", json_data={
            "email": email,
            "password": password
        })
        
        if response and response.get("token"):
            st.session_state.token = response["token"]
            st.session_state.user = response.get("user", {})
            st.session_state.tenant_id = response.get("user", {}).get("tenantId")
            return True
        return False
    except Exception as e:
        st.error(f"Login failed: {str(e)}")
        return False

def logout():
    """Logout user"""
    st.session_state.token = None
    st.session_state.user = None
    st.session_state.tenant_id = None

def require_auth():
    """Decorator to require authentication"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not is_authenticated():
                st.warning("Please login to access this page")
                st.stop()
            return func(*args, **kwargs)
        return wrapper
    return decorator
