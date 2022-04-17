import mysql.connector
from mysql.connector import pooling

class Database:
    def __init__(self, config):
        self.config = config
        self.cnxpool = self.create_cnxpool()

    def create_cnxpool(self):
        try:
            cnxpool = pooling.MySQLConnectionPool(
                pool_name = "cnxpool",
                pool_size = 5,
                **self.config
            )
        except mysql.connector.Error as err:
            print(err)
        
        return cnxpool

    def close(self, cursor, cnx):
        cursor.close()
        cnx.close()

    def execute_sql(self, sql, sql_data, method, commit=False):
        try:
            cnx = self.cnxpool.get_connection()
            cursor = cnx.cursor(dictionary = True)

            cursor.execute(sql, sql_data)
            if method == "one":
                result = cursor.fetchone()
            elif method == "all":
                result = cursor.fetchall()
            elif method == "rowcount":
                result = cursor.rowcount

        except:
            cnx.rollback()

        finally:
            if commit is True:
                cnx.commit()
                self.close(cursor, cnx)
            else:
                self.close(cursor, cnx)
        
        return result
