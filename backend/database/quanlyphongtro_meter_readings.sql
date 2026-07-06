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
-- Table structure for table `meter_readings`
--

DROP TABLE IF EXISTS `meter_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meter_readings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int DEFAULT NULL,
  `billing_month` date NOT NULL,
  `prev_electricity` int DEFAULT '0',
  `current_electricity` int NOT NULL,
  `prev_water` int DEFAULT '0',
  `current_water` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_meter` (`room_id`,`billing_month`),
  UNIQUE KEY `meter_readings_room_id_billing_month` (`room_id`,`billing_month`),
  KEY `idx_meter_room` (`room_id`),
  KEY `idx_meter_billing` (`billing_month`),
  CONSTRAINT `meter_readings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meter_readings`
--

LOCK TABLES `meter_readings` WRITE;
/*!40000 ALTER TABLE `meter_readings` DISABLE KEYS */;
INSERT INTO `meter_readings` VALUES (1,12,'2026-04-01',0,200,0,15,'2026-06-24 10:42:33','2026-06-24 10:42:33'),(2,12,'2026-05-01',200,250,15,18,'2026-06-24 10:42:33','2026-06-24 10:42:33'),(3,12,'2026-06-01',250,310,18,22,'2026-06-24 10:42:33','2026-06-24 10:42:33'),(4,13,'2026-05-01',0,180,0,12,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(5,13,'2026-06-01',180,230,12,15,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(6,14,'2026-05-01',0,150,0,10,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(7,14,'2026-06-01',150,195,10,13,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(8,15,'2026-05-01',0,220,0,14,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(9,15,'2026-06-01',220,280,14,18,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(10,16,'2026-05-01',0,300,0,20,'2026-06-24 10:56:08','2026-06-24 10:56:08'),(11,16,'2026-06-01',300,380,20,25,'2026-06-24 10:56:08','2026-06-24 10:56:08');
/*!40000 ALTER TABLE `meter_readings` ENABLE KEYS */;
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
