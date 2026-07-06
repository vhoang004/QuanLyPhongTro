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
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `citizen_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citizen_id` (`citizen_id`),
  UNIQUE KEY `citizen_id_2` (`citizen_id`),
  UNIQUE KEY `citizen_id_3` (`citizen_id`),
  UNIQUE KEY `citizen_id_4` (`citizen_id`),
  UNIQUE KEY `citizen_id_5` (`citizen_id`),
  UNIQUE KEY `citizen_id_6` (`citizen_id`),
  UNIQUE KEY `citizen_id_7` (`citizen_id`),
  UNIQUE KEY `citizen_id_8` (`citizen_id`),
  UNIQUE KEY `citizen_id_9` (`citizen_id`),
  UNIQUE KEY `citizen_id_10` (`citizen_id`),
  UNIQUE KEY `citizen_id_11` (`citizen_id`),
  UNIQUE KEY `citizen_id_12` (`citizen_id`),
  UNIQUE KEY `citizen_id_13` (`citizen_id`),
  UNIQUE KEY `citizen_id_14` (`citizen_id`),
  UNIQUE KEY `citizen_id_15` (`citizen_id`),
  UNIQUE KEY `citizen_id_16` (`citizen_id`),
  UNIQUE KEY `citizen_id_17` (`citizen_id`),
  UNIQUE KEY `citizen_id_18` (`citizen_id`),
  UNIQUE KEY `citizen_id_19` (`citizen_id`),
  UNIQUE KEY `citizen_id_20` (`citizen_id`),
  UNIQUE KEY `citizen_id_21` (`citizen_id`),
  UNIQUE KEY `citizen_id_22` (`citizen_id`),
  UNIQUE KEY `citizen_id_23` (`citizen_id`),
  UNIQUE KEY `citizen_id_24` (`citizen_id`),
  UNIQUE KEY `citizen_id_25` (`citizen_id`),
  UNIQUE KEY `citizen_id_26` (`citizen_id`),
  UNIQUE KEY `citizen_id_27` (`citizen_id`),
  UNIQUE KEY `citizen_id_28` (`citizen_id`),
  UNIQUE KEY `citizen_id_29` (`citizen_id`),
  UNIQUE KEY `citizen_id_30` (`citizen_id`),
  UNIQUE KEY `citizen_id_31` (`citizen_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (4,'Nguyễn Văn A','079201234567','0909123456','hbao7888@gmail.com',NULL,'2026-06-23 17:36:38','2026-06-23 17:36:38'),(5,'Trần Thị B','079208765432','0912345678','hbao7888@gmail.com',NULL,'2026-06-23 17:36:38','2026-06-23 17:36:38'),(6,'Lê Văn C','079203456789','0923456789','hbao7888@gmail.com',NULL,'2026-06-23 17:36:38','2026-06-23 17:36:38'),(7,'Phạm Thị D','079204567890','0934567890','hbao7888@gmail.com',NULL,'2026-06-23 17:36:38','2026-06-23 17:36:38'),(8,'Nguyễn Văn A','079201234561','0909123456','hbao7888@gmail.com',NULL,'2026-06-23 17:38:17','2026-06-23 17:38:17'),(9,'Trần Thị B','079201234562','0912345678','hbao7888@gmail.com',NULL,'2026-06-23 17:38:17','2026-06-23 17:38:17'),(10,'Lê Văn C','079201234563','0923456789','hbao7888@gmail.com',NULL,'2026-06-23 17:38:17','2026-06-23 17:38:17'),(11,'Nguyễn Văn An','0792100000','0910000000','hbao7888@gmail.com',NULL,'2026-06-23 17:46:37','2026-06-23 17:46:37'),(12,'Trần Thị Bình','0792100001','0910000001','hbao7888@gmail.com',NULL,'2026-06-23 17:46:37','2026-06-23 17:46:37'),(13,'Lê Văn Cường','0792100002','0910000002','hbao7888@gmail.com',NULL,'2026-06-23 17:46:37','2026-06-23 17:46:37'),(14,'Phạm Thị Dung','0792100010','0910000100','hbao7888@gmail.com',NULL,'2026-06-23 17:46:37','2026-06-23 17:46:37'),(15,'Hoàng Văn Em','0792100011','0910000101','hbao7888@gmail.com',NULL,'2026-06-23 17:46:37','2026-06-23 17:46:37'),(16,'Vũ Thị Phượng','0792100020','0910000200','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(17,'Đặng Văn Frank','0792100021','0910000201','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(18,'Bùi Thị Hà','0792100030','0910000300','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(19,'Ngô Văn Ích','0792100031','0910000301','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(20,'Trương Thị J','0792100040','0910000400','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(21,'Phan Văn K','0792100041','0910000401','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(22,'Đỗ Thị L','0792100050','0910000500','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(23,'Cao Văn M','0792100051','0910000501','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(24,'Huỳnh Thị N','0792100052','0910000502','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(25,'Bạch Văn O','0792100060','0910000600','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(26,'Hồ Thị P','0792100061','0910000601','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(27,'Lý Văn Q','0792100070','0910000700','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(28,'Mai Thị R','0792100071','0910000701','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(29,'Đinh Văn S','0792100080','0910000800','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(30,'Thân Thị T','0792100081','0910000801','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(31,'Võ Văn U','0792100090','0910000900','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(32,'Nguyễn Thị V','0792100091','0910000901','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(33,'Chu Văn W','0792100100','0910001000','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(34,'Trịnh Thị X','0792100101','0910001001','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(35,'Hà Văn Y','0792100102','0910001002','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(36,'Lương Thị Z','0792100110','0910001100','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(37,'Tô Văn AA','0792100111','0910001101','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(38,'Vương Thị BB','0792100120','0910001200','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(39,'Trần Văn CC','0792100121','0910001201','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(40,'Lê Thị DD','0792100130','0910001300','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(41,'Phạm Văn EE','0792100131','0910001301','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(42,'Nguyễn Thị FF','0792100140','0910001400','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(43,'Hoàng Văn GG','0792100141','0910001401','hbao7888@gmail.com',NULL,'2026-06-23 17:46:38','2026-06-23 17:46:38'),(44,'Trần Việt Hoàng','0193394823','09239383248','hbao7888@gmail.com','','2026-06-23 19:02:53','2026-06-23 19:02:53'),(45,'Trần Việt Hoàng','03929493292394','09834752645','hbao7888@gmail.com','','2026-06-23 19:09:15','2026-06-23 19:09:15'),(46,'Bùi hoàng giang','03492381118','00223982334','hbao7888@gmail.com','','2026-06-24 02:31:30','2026-06-24 02:31:30'),(47,'hoàng đạt','008668556756','066546645','hbao7888@gmail.com','','2026-06-24 02:37:42','2026-06-24 02:37:42'),(48,'Trần Trung Kiên','001292390132','01385834234','hbao7888@gmail.com','','2026-06-24 02:49:39','2026-06-24 02:49:39'),(49,'Pham Van D','079208008901','0934567890','hbao7888@gmail.com','321 Le Duan, HN','2026-06-24 10:54:23','2026-06-24 10:54:23'),(50,'Hoang Thi E','079209009012','0945678901','hbao7888@gmail.com','654 Truong Chinh, HN','2026-06-24 10:54:23','2026-06-24 10:54:23'),(51,'Nguyen Van F','079210010123','0956789012','hbao7888@gmail.com','987 Bach Dang, HCM','2026-06-24 10:54:23','2026-06-24 10:54:23'),(52,'Tran Van G','079211011234','0967890123','hbao7888@gmail.com','147 Nguyen Hue, HCM','2026-06-24 10:54:23','2026-06-24 10:54:23');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
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
