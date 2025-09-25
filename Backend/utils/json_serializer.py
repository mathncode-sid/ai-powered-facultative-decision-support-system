"""
JSON serialization utilities for handling complex objects
"""
import json
import logging
from datetime import datetime, date
from decimal import Decimal
from typing import Any, Dict, List
from uuid import UUID

logger = logging.getLogger(__name__)

def make_json_serializable(obj: Any) -> Any:
    """
    Recursively convert an object to be JSON serializable
    
    Args:
        obj: Object to convert
        
    Returns:
        JSON serializable version of the object
    """
    if obj is None:
        return None
    
    # Handle basic types that are already JSON serializable
    if isinstance(obj, (str, int, float, bool)):
        return obj
    
    # Handle datetime objects
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    
    # Handle UUID objects
    if isinstance(obj, UUID):
        return str(obj)
    
    # Handle Decimal objects
    if isinstance(obj, Decimal):
        return float(obj)
    
    # Handle Pydantic models
    if hasattr(obj, 'dict'):
        try:
            return make_json_serializable(obj.dict())
        except Exception as e:
            logger.warning(f"Failed to convert Pydantic model to dict: {e}")
            return str(obj)
    
    # Handle dictionaries
    if isinstance(obj, dict):
        return {key: make_json_serializable(value) for key, value in obj.items()}
    
    # Handle lists and tuples
    if isinstance(obj, (list, tuple)):
        return [make_json_serializable(item) for item in obj]
    
    # Handle sets
    if isinstance(obj, set):
        return [make_json_serializable(item) for item in obj]
    
    # Handle custom objects by converting to string
    try:
        # Try to see if it's already JSON serializable
        json.dumps(obj)
        return obj
    except (TypeError, ValueError):
        # If not, convert to string
        logger.debug(f"Converting non-serializable object {type(obj)} to string: {obj}")
        return str(obj)

def safe_json_dumps(obj: Any, **kwargs) -> str:
    """
    Safely convert an object to JSON string
    
    Args:
        obj: Object to convert
        **kwargs: Additional arguments for json.dumps
        
    Returns:
        JSON string representation
    """
    try:
        serializable_obj = make_json_serializable(obj)
        return json.dumps(serializable_obj, **kwargs)
    except Exception as e:
        logger.error(f"Failed to serialize object to JSON: {e}")
        # Return a fallback JSON representation
        return json.dumps({
            "error": "Serialization failed",
            "type": str(type(obj)),
            "string_representation": str(obj)[:1000]  # Limit size
        })

def validate_json_serializable(obj: Any) -> bool:
    """
    Check if an object is JSON serializable
    
    Args:
        obj: Object to check
        
    Returns:
        True if serializable, False otherwise
    """
    try:
        json.dumps(make_json_serializable(obj))
        return True
    except Exception:
        return False