#!/usr/bin/env python3
"""
Backend API Testing for Alarm Clock App
Tests the health check endpoint and basic functionality
"""

import requests
import json
import sys
from datetime import datetime

# Use the backend URL from frontend .env
BACKEND_URL = "https://awake-alarm.preview.emergentagent.com/api"

def test_health_check():
    """Test the basic health check endpoint GET /api/"""
    print("🔍 Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Health check endpoint working correctly")
                return True
            else:
                print(f"❌ Unexpected response data: {data}")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check request failed: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by testing status endpoints"""
    print("\n🔍 Testing MongoDB Connection via Status Endpoints...")
    
    # Test creating a status check
    try:
        test_data = {
            "client_name": "test_alarm_client"
        }
        
        print("Testing POST /api/status...")
        response = requests.post(f"{BACKEND_URL}/status", 
                               json=test_data, 
                               timeout=10)
        print(f"POST Status Code: {response.status_code}")
        print(f"POST Response: {response.text}")
        
        if response.status_code == 200:
            created_status = response.json()
            print("✅ Status creation successful")
            
            # Test getting status checks
            print("\nTesting GET /api/status...")
            get_response = requests.get(f"{BACKEND_URL}/status", timeout=10)
            print(f"GET Status Code: {get_response.status_code}")
            print(f"GET Response: {get_response.text}")
            
            if get_response.status_code == 200:
                status_list = get_response.json()
                print(f"✅ Retrieved {len(status_list)} status checks")
                return True
            else:
                print(f"❌ GET status failed with status {get_response.status_code}")
                return False
        else:
            print(f"❌ POST status failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ MongoDB connection test failed: {e}")
        return False

def test_backend_availability():
    """Test if backend is reachable"""
    print("🔍 Testing Backend Availability...")
    try:
        response = requests.get(BACKEND_URL, timeout=5)
        print(f"Backend reachable - Status: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend not reachable: {e}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("🚀 ALARM CLOCK APP - BACKEND API TESTING")
    print("=" * 60)
    print(f"Testing Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Backend availability
    results['availability'] = test_backend_availability()
    
    # Test 2: Health check endpoint
    results['health_check'] = test_health_check()
    
    # Test 3: MongoDB connection
    results['mongodb_connection'] = test_mongodb_connection()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())