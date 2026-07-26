"""
DynamoDB Helper Module
=====================
Provides a reusable DynamoDB table resource for all Lambda handlers.
Uses a module-level lazy singleton so the boto3 resource is initialized
once per cold start and reused during warm invocations.
"""

import boto3

try:
    from src.config.settings import AWS_REGION, DYNAMODB_TABLE_NAME
except ImportError:
    from config.settings import AWS_REGION, DYNAMODB_TABLE_NAME

_dynamodb_resource = None
_table = None


def get_dynamodb_table():
    """
    Returns a DynamoDB Table resource for the Students table.

    Returns:
        boto3.resources.factory.dynamodb.Table: A DynamoDB Table resource.
    """
    global _dynamodb_resource, _table
    if _table is None:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=AWS_REGION)
        _table = _dynamodb_resource.Table(DYNAMODB_TABLE_NAME)
    return _table


# Alias
get_table = get_dynamodb_table
