import os

from dotenv import load_dotenv

import mysql.connector
from mysql.connector import errorcode


load_dotenv()
MYSQL_CONFIG = {
    'user': os.getenv("user"), 
    'password': os.getenv("password"),
    'host': '127.0.0.1',
}

# Connecting to MySQL
try:
    cnx = mysql.connector.connect(**MYSQL_CONFIG)
except mysql.connector.Error as err:
    print(err)

else:
    print("Successfully connected to MySQL.")

cursor = cnx.cursor()


# Using/Creating database
DB_NAME = "taipei_attractions"

def create_database(cursor):
    try:
        cursor.execute(
            "CREATE DATABASE {} DEFAULT CHARACTER SET 'utf8'".format(DB_NAME))
    except mysql.connector.Error as err:
        print("Failed creating database: {}".format(err))
        exit(1)

try:
    cursor.execute("USE {}".format(DB_NAME))
except mysql.connector.Error as err:
    print("Database {} does not exists.".format(DB_NAME))
    if err.errno == errorcode.ER_BAD_DB_ERROR:
        create_database(cursor)
        print("Database {} created successfully.".format(DB_NAME))
        cnx.database = DB_NAME
    else:
        print(err)
        exit(1)


# Creating tables
TABLES = {}
"""
TABLES['orders'] = (
    "CREATE TABLE `orders` ("
    "  `number` bigint NOT NULL,"
    "  `contact_name` varchar(50) NOT NULL,"
    "  `contact_email` varchar(255) NOT NULL,"
    "  `contact_phone` varchar(50) NOT NULL,"
    "  `attraction_id` bigint NOT NULL,"
    "  `attraction_name` varchar(50) NOT NULL,"
    "  `attraction_address` varchar(50),"
    "  `attraction_image` varchar(3000),"
    "  `date` date NOT NULL,"
    "  `time` varchar(30) NOT NULL,"
    "  `price` int NOT NULL,"
    "  `order_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,"
    "  `status` varchar(5) NOT NULL,"
    "  PRIMARY KEY (`number`),"
    "  UNIQUE (`number`))")   
"""

TABLES['table1_seq'] = (
    "CREATE TABLE `table1_seq`(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)") 

TABLES['table1'] = (
    "CREATE TABLE table1(id VARCHAR(7) NOT NULL PRIMARY KEY DEFAULT '0', name VARCHAR(30), time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP)")  

for table_name in TABLES:
    table_description = TABLES[table_name]
    try:
        print("Creating table {}: ".format(table_name), end='')
        cursor.execute(table_description)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
            print("already exists.")
        else:
            print(err.msg)
    else:
        print("OK")

sql = ("CREATE TRIGGER tg_table1_insert BEFORE INSERT ON table1 FOR EACH ROW BEGIN INSERT INTO table1_seq() VALUES (); SET NEW.id = CONCAT(datetime, LPAD(LAST_INSERT_ID(), 3, '0')); END")

cursor.execute(sql)


"""
# Inserting datas
DATAS_PATH = "taipei-attractions.json"

with open (DATAS_PATH) as f:
    datas = json.load(f)
spots = datas["result"]["results"]


# Inserting spot info
add_spot_info = ("INSERT INTO spots "
                 "(name, category, description, address, transport, mrt, latitude, longitude, open_time, source) "
                 "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")

for spot in spots:
    name = spot["stitle"]
    category = spot["CAT2"]
    description = spot["xbody"]
    address = spot["address"]
    transport = spot["info"]
    mrt = spot["MRT"]
    latitude = spot["latitude"]
    longitude = spot["longitude"]
    open_time = spot["MEMO_TIME"]
    source = spot["idpt"]

    spot_info = (name, category, description, address, transport, mrt, latitude, longitude, open_time, source)

    cursor.execute(add_spot_info, spot_info)


# Inserting spot image
add_spot_image = ("INSERT INTO images "
                  "(name, image_url) "
                  "VALUES (%s, %s)")

for spot in spots:
    images = spot["file"].split("https://")
    for image in images[1:]:
        reg = re.compile(r".jpg$", flags = re.I)
        if reg.search(image):
            name = spot["stitle"]
            image_url = "https://" + image
            spot_image = (name, image_url)
            cursor.execute(add_spot_image, spot_image)
            continue
        else:
            continue


# Concating i.image_urls into s.images
cursor.execute("SET group_concat_max_len=102400")
cursor.execute("UPDATE spots s INNER JOIN (SELECT s.name, GROUP_CONCAT(DISTINCT i.image_url) AS `images` "
               "FROM spots s, images i WHERE s.name = i.name GROUP BY s.name) temp "
               "ON s.name = temp.name SET s.images = temp.images")

"""

cnx.commit()

print("Closing")
cursor.close()
cnx.close()
