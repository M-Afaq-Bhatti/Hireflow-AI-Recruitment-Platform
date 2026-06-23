import requests
import json
import streamlit as st
from typing import Any, Dict, Optional
from datetime import datetime

class APIClient:
    def __init__(self, base_url: str = None):
        """Initialize API client with base URL"""
        if base_url is None:
            base_url = st.secrets.get("API_URL", "http://localhost:5000/api")
        self.base_url = base_url
        self.session = requests.Session()
        self.token = st.session_state.get("token")
        if self.token:
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
    
    def _update_token(self):
        """Update session token from state"""
        self.token = st.session_state.get("token")
        if self.token:
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
    
    def request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        files: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Make an HTTP request to the API"""
        self._update_token()
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, data=data, json=json_data, files=files)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=json_data)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=json_data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json() if response.text else {}
        except requests.exceptions.HTTPError as e:
            error_data = {}
            try:
                error_data = e.response.json()
            except:
                error_data = {"error": str(e)}
            st.error(f"API Error: {error_data.get('error', str(e))}")
            raise
        except Exception as e:
            st.error(f"Request failed: {str(e)}")
            raise
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        return self.request("GET", endpoint, params=params)
    
    def post(self, endpoint: str, data: Optional[Dict] = None, json_data: Optional[Dict] = None, files: Optional[Dict] = None) -> Dict[str, Any]:
        return self.request("POST", endpoint, data=data, json_data=json_data, files=files)
    
    def put(self, endpoint: str, json_data: Optional[Dict] = None) -> Dict[str, Any]:
        return self.request("PUT", endpoint, json_data=json_data)
    
    def patch(self, endpoint: str, json_data: Optional[Dict] = None) -> Dict[str, Any]:
        return self.request("PATCH", endpoint, json_data=json_data)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        return self.request("DELETE", endpoint)


# Convenience functions
def get_api_client() -> APIClient:
    """Get API client instance"""
    if "api_client" not in st.session_state:
        st.session_state.api_client = APIClient()
    return st.session_state.api_client
