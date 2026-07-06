-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: quanlyphongtro
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_type` enum('standard','deluxe','suite') COLLATE utf8mb4_unicode_ci DEFAULT 'standard',
  `base_price` decimal(12,2) NOT NULL,
  `area` decimal(6,2) DEFAULT NULL,
  `floor` int DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `images` json DEFAULT NULL,
  `status` enum('available','rented','maintenance','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `max_occupancy` int DEFAULT '1',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `deposit_amount` decimal(12,2) DEFAULT '0.00',
  `electricity_price` decimal(10,2) DEFAULT '3500.00',
  `water_price` decimal(10,2) DEFAULT '15000.00',
  `internet_price` decimal(10,2) DEFAULT '0.00',
  `parking_price` decimal(10,2) DEFAULT '0.00',
  `other_services_price` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  UNIQUE KEY `room_number_2` (`room_number`),
  UNIQUE KEY `room_number_3` (`room_number`),
  UNIQUE KEY `room_number_4` (`room_number`),
  UNIQUE KEY `room_number_5` (`room_number`),
  UNIQUE KEY `room_number_6` (`room_number`),
  UNIQUE KEY `room_number_7` (`room_number`),
  UNIQUE KEY `room_number_8` (`room_number`),
  UNIQUE KEY `room_number_9` (`room_number`),
  UNIQUE KEY `room_number_10` (`room_number`),
  UNIQUE KEY `room_number_11` (`room_number`),
  UNIQUE KEY `room_number_12` (`room_number`),
  UNIQUE KEY `room_number_13` (`room_number`),
  UNIQUE KEY `room_number_14` (`room_number`),
  UNIQUE KEY `room_number_15` (`room_number`),
  UNIQUE KEY `room_number_16` (`room_number`),
  UNIQUE KEY `room_number_17` (`room_number`),
  UNIQUE KEY `room_number_18` (`room_number`),
  UNIQUE KEY `room_number_19` (`room_number`),
  UNIQUE KEY `room_number_20` (`room_number`),
  UNIQUE KEY `room_number_21` (`room_number`),
  UNIQUE KEY `room_number_22` (`room_number`),
  UNIQUE KEY `room_number_23` (`room_number`),
  UNIQUE KEY `room_number_24` (`room_number`),
  UNIQUE KEY `room_number_25` (`room_number`),
  UNIQUE KEY `room_number_26` (`room_number`),
  UNIQUE KEY `room_number_27` (`room_number`),
  UNIQUE KEY `room_number_28` (`room_number`),
  UNIQUE KEY `room_number_29` (`room_number`),
  UNIQUE KEY `room_number_30` (`room_number`),
  UNIQUE KEY `room_number_31` (`room_number`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (6,'101','Phòng 101 - Tầng 1','standard',2500000.00,20.00,1,'','[]','available','2026-06-23 16:54:33','2026-06-24 09:29:15',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"fingerprint_lock\"]',5000000.00,3500.00,15000.00,150000.00,0.00,0.00),(7,'102','Phòng 102 - Tầng 1','standard',2800000.00,25.00,1,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',5600000.00,3500.00,15000.00,150000.00,0.00,0.00),(8,'103','Phòng 103 - Tầng 1','standard',3000000.00,28.00,1,NULL,'[]','rented','2026-06-23 16:54:33','2026-06-24 18:14:53',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"wardrobe\"]',6000000.00,3500.00,15000.00,150000.00,0.00,0.00),(9,'104','Phòng 104 - Tầng 1','standard',3200000.00,30.00,1,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',6400000.00,3500.00,15000.00,150000.00,0.00,0.00),(10,'105','Phòng 105 - Tầng 1','standard',2800000.00,24.00,1,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\"]',5600000.00,3500.00,15000.00,150000.00,0.00,0.00),(11,'106','Phòng 106 - Tầng 1','standard',2500000.00,20.00,1,'','[\"/uploads/images-1782277163392-10885555.jpg\"]','maintenance','2026-06-23 16:54:33','2026-06-24 04:59:26',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\"]',5000000.00,3500.00,15000.00,150000.00,0.00,0.00),(12,'107','Phòng 107 - Tầng 1','standard',2700000.00,22.00,1,NULL,'[]','rented','2026-06-23 16:54:33','2026-06-23 16:54:33',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"balcony\"]',5400000.00,3500.00,15000.00,150000.00,0.00,0.00),(13,'108','Phòng 108 - Tầng 1','standard',2600000.00,21.00,1,NULL,'[]','available','2026-06-23 16:54:33','2026-06-24 09:46:06',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\"]',5200000.00,3500.00,15000.00,150000.00,0.00,0.00),(14,'109','Phòng 109 - Tầng 1','standard',2900000.00,26.00,1,NULL,'[]','rented','2026-06-23 16:54:33','2026-06-24 10:54:23',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\"]',5800000.00,3500.00,15000.00,150000.00,0.00,0.00),(15,'110','Phòng 110 - Tầng 1','standard',2400000.00,18.00,1,NULL,'[]','rented','2026-06-23 16:54:33','2026-06-24 10:54:23',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\"]',4800000.00,3500.00,15000.00,150000.00,0.00,0.00),(16,'201','Phòng 201 - Tầng 2','standard',2800000.00,24.00,2,NULL,'[]','rented','2026-06-23 16:54:33','2026-06-24 10:54:23',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"parking\"]',5600000.00,3500.00,15000.00,150000.00,100000.00,0.00),(17,'202','Phòng 202 - Tầng 2','deluxe',4000000.00,30.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\", \"parking\"]',8000000.00,3500.00,15000.00,200000.00,150000.00,0.00),(18,'203','Phòng 203 - Tầng 2','standard',3000000.00,28.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',6000000.00,3500.00,15000.00,150000.00,0.00,0.00),(19,'204','Phòng 204 - Tầng 2','deluxe',4500000.00,35.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',9000000.00,3500.00,15000.00,200000.00,150000.00,0.00),(20,'205','Phòng 205 - Tầng 2','standard',2900000.00,25.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',5800000.00,3500.00,15000.00,150000.00,0.00,0.00),(21,'206','Phòng 206 - Tầng 2','deluxe',4200000.00,32.00,2,NULL,'[]','maintenance','2026-06-23 16:54:33','2026-06-23 16:54:33',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\"]',8400000.00,3500.00,15000.00,200000.00,0.00,0.00),(22,'207','Phòng 207 - Tầng 2','standard',2700000.00,23.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',5400000.00,3500.00,15000.00,150000.00,0.00,0.00),(23,'208','Phòng 208 - Tầng 2','standard',3100000.00,29.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\"]',6200000.00,3500.00,15000.00,150000.00,0.00,0.00),(24,'209','Phòng 209 - Tầng 2','deluxe',3800000.00,28.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"balcony\"]',7600000.00,3500.00,15000.00,200000.00,0.00,0.00),(25,'210','Phòng 210 - Tầng 2','standard',2600000.00,20.00,2,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\"]',5200000.00,3500.00,15000.00,150000.00,0.00,0.00),(26,'301','Phòng 301 - Tầng 3','deluxe',4500000.00,35.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\"]',9000000.00,3500.00,15000.00,200000.00,150000.00,0.00),(27,'302','Phòng 302 - Tầng 3','deluxe',5000000.00,40.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\"]',10000000.00,3500.00,15000.00,200000.00,150000.00,0.00),(28,'303','Phòng 303 - Tầng 3','suite',6500000.00,50.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',5,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\", \"kitchen\"]',13000000.00,3500.00,15000.00,250000.00,200000.00,0.00),(29,'304','Phòng 304 - Tầng 3','deluxe',4800000.00,36.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',9600000.00,3500.00,15000.00,200000.00,150000.00,0.00),(30,'305','Phòng 305 - Tầng 3','suite',7000000.00,55.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',5,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\", \"kitchen\", \"water_heater\"]',14000000.00,3500.00,15000.00,250000.00,200000.00,0.00),(31,'306','Phòng 306 - Tầng 3','deluxe',4200000.00,32.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\", \"parking\"]',8400000.00,3500.00,15000.00,200000.00,150000.00,0.00),(32,'307','Phòng 307 - Tầng 3','deluxe',4600000.00,34.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',9200000.00,3500.00,15000.00,200000.00,150000.00,0.00),(33,'308','Phòng 308 - Tầng 3','suite',6800000.00,52.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',5,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\", \"kitchen\"]',13600000.00,3500.00,15000.00,250000.00,200000.00,0.00),(34,'309','Phòng 309 - Tầng 3','deluxe',4400000.00,33.00,3,NULL,'[]','maintenance','2026-06-23 16:54:33','2026-06-23 16:54:33',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\"]',8800000.00,3500.00,15000.00,200000.00,0.00,0.00),(35,'310','Phòng 310 - Tầng 3','deluxe',4700000.00,35.00,3,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\"]',9400000.00,3500.00,15000.00,200000.00,150000.00,0.00),(36,'401','Phòng 401 - Tầng 4','standard',3200000.00,28.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"parking\"]',6400000.00,3500.00,15000.00,150000.00,100000.00,0.00),(37,'402','Phòng 402 - Tầng 4','deluxe',5000000.00,40.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\"]',10000000.00,3500.00,15000.00,200000.00,150000.00,0.00),(38,'403','Phòng 403 - Tầng 4','standard',3000000.00,26.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',6000000.00,3500.00,15000.00,150000.00,0.00,0.00),(39,'404','Phòng 404 - Tầng 4','suite',7500000.00,60.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',6,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\", \"kitchen\", \"water_heater\"]',15000000.00,3500.00,15000.00,250000.00,200000.00,0.00),(40,'405','Phòng 405 - Tầng 4','deluxe',4800000.00,36.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',9600000.00,3500.00,15000.00,200000.00,150000.00,0.00),(41,'406','Phòng 406 - Tầng 4','standard',2800000.00,24.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',5600000.00,3500.00,15000.00,150000.00,0.00,0.00),(42,'407','Phòng 407 - Tầng 4','deluxe',5200000.00,42.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',4,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\"]',10400000.00,3500.00,15000.00,200000.00,150000.00,0.00),(43,'408','Phòng 408 - Tầng 4','standard',3100000.00,27.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 18:57:01',2,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',6200000.00,3500.00,15000.00,150000.00,0.00,0.00),(44,'409','Phòng 409 - Tầng 4','suite',7200000.00,58.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',5,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\", \"kitchen\"]',14400000.00,3500.00,15000.00,250000.00,200000.00,0.00),(45,'410','Phòng 410 - Tầng 4','standard',3300000.00,29.00,4,NULL,'[]','available','2026-06-23 16:54:33','2026-06-23 16:54:33',3,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"parking\"]',6600000.00,3500.00,15000.00,150000.00,100000.00,0.00);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-25 12:42:57
