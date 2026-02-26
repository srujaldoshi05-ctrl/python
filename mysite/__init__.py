"""
Project package init.

If mysqlclient (MySQLdb) isn't available, fall back to PyMySQL by installing it
as a MySQLdb-compatible module.
"""

try:
    import MySQLdb  # noqa: F401
except Exception:
    import pymysql

    pymysql.install_as_MySQLdb()
