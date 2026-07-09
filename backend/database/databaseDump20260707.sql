-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: quanlyphongtro
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS accounts;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE accounts (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  email varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','manager') COLLATE utf8mb4_unicode_ci DEFAULT 'manager',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  reset_otp varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  reset_otp_expires datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  UNIQUE KEY username_2 (username),
  UNIQUE KEY username_3 (username),
  UNIQUE KEY username_4 (username),
  UNIQUE KEY username_5 (username),
  UNIQUE KEY username_6 (username),
  UNIQUE KEY username_7 (username),
  UNIQUE KEY username_8 (username),
  UNIQUE KEY username_9 (username),
  UNIQUE KEY username_10 (username),
  UNIQUE KEY username_11 (username),
  UNIQUE KEY username_12 (username),
  UNIQUE KEY username_13 (username),
  UNIQUE KEY username_14 (username),
  UNIQUE KEY username_15 (username),
  UNIQUE KEY username_16 (username),
  UNIQUE KEY username_17 (username),
  UNIQUE KEY username_18 (username),
  UNIQUE KEY username_19 (username),
  UNIQUE KEY username_20 (username),
  UNIQUE KEY username_21 (username),
  UNIQUE KEY username_22 (username),
  UNIQUE KEY username_23 (username),
  UNIQUE KEY username_24 (username),
  UNIQUE KEY username_25 (username),
  UNIQUE KEY username_26 (username),
  UNIQUE KEY username_27 (username),
  UNIQUE KEY username_28 (username),
  UNIQUE KEY username_29 (username),
  UNIQUE KEY username_30 (username),
  UNIQUE KEY username_31 (username),
  UNIQUE KEY username_32 (username),
  UNIQUE KEY email (email),
  UNIQUE KEY email_2 (email),
  UNIQUE KEY email_3 (email),
  UNIQUE KEY email_4 (email),
  UNIQUE KEY email_5 (email),
  UNIQUE KEY email_6 (email),
  UNIQUE KEY email_7 (email),
  UNIQUE KEY email_8 (email),
  UNIQUE KEY email_9 (email),
  UNIQUE KEY email_10 (email),
  UNIQUE KEY email_11 (email),
  UNIQUE KEY email_12 (email),
  UNIQUE KEY email_13 (email),
  UNIQUE KEY email_14 (email),
  UNIQUE KEY email_15 (email),
  UNIQUE KEY email_16 (email),
  UNIQUE KEY email_17 (email),
  UNIQUE KEY email_18 (email),
  UNIQUE KEY email_19 (email),
  UNIQUE KEY email_20 (email),
  UNIQUE KEY email_21 (email),
  UNIQUE KEY email_22 (email),
  UNIQUE KEY email_23 (email),
  UNIQUE KEY email_24 (email),
  UNIQUE KEY email_25 (email),
  UNIQUE KEY email_26 (email),
  UNIQUE KEY email_27 (email),
  UNIQUE KEY email_28 (email),
  UNIQUE KEY email_29 (email),
  UNIQUE KEY email_30 (email),
  UNIQUE KEY email_31 (email)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES accounts WRITE;
/*!40000 ALTER TABLE accounts DISABLE KEYS */;
INSERT INTO accounts VALUES (15,'manager','$2b$10$4T0trPtWaNj67sbhh8XbgORhHHRwV01ojs45g/2A6Pn4wrWgLtNTW','viethoang101004@gmail.com','manager','active','2026-06-24 20:34:15','2026-06-24 20:40:21',NULL,NULL),(17,'admin','$2b$10$4T0trPtWaNj67sbhh8XbgORhHHRwV01ojs45g/2A6Pn4wrWgLtNTW',NULL,'admin','active','2026-07-07 04:31:21','2026-07-07 04:31:21',NULL,NULL);
/*!40000 ALTER TABLE accounts ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjustments`
--

DROP TABLE IF EXISTS adjustments;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE adjustments (
  id int NOT NULL AUTO_INCREMENT,
  contract_id int DEFAULT NULL,
  billing_month date NOT NULL,
  `type` enum('surcharge','discount') COLLATE utf8mb4_unicode_ci NOT NULL,
  amount decimal(10,2) NOT NULL,
  reason varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  created_at datetime NOT NULL,
  PRIMARY KEY (id),
  KEY idx_adjustments_contract (contract_id),
  CONSTRAINT adjustments_ibfk_1 FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjustments`
--

LOCK TABLES adjustments WRITE;
/*!40000 ALTER TABLE adjustments DISABLE KEYS */;
INSERT INTO adjustments VALUES (15,1,'2026-05-01','discount',150000.00,'Giảm giá khách hài lòng','2026-06-25 15:17:02'),(16,2,'2026-05-01','surcharge',50000.00,'Phí giặt đồ phát sinh tháng 5','2026-06-25 15:17:02'),(17,4,'2026-04-01','surcharge',200000.00,'Phí sửa chữa nhỏ phòng 104','2026-06-25 15:17:02'),(18,11,'2026-06-01','discount',100000.00,'Khuyến mãi thanh toán sớm tháng 6','2026-06-25 15:17:02'),(20,14,'2026-05-01','discount',100000.00,'Giảm giá khách cũ tháng 5','2026-06-25 15:17:02'),(22,21,'2026-04-01','surcharge',150000.00,'Phí vệ sinh đầu năm','2026-06-25 15:17:02'),(23,22,'2026-06-01','discount',50000.00,'Ưu đãi thanh toán QR','2026-06-25 15:17:02'),(24,24,'2026-05-01','surcharge',30000.00,'Phí gọi điện ngoài giờ','2026-06-25 15:17:02'),(27,17,'2026-06-01','surcharge',200000.00,'','2026-07-06 14:56:08'),(28,17,'2026-06-01','surcharge',200000.00,'','2026-07-06 14:56:20'),(29,17,'2026-06-01','surcharge',200000.00,'','2026-07-06 14:56:33'),(30,16,'2026-06-01','surcharge',200000.00,'','2026-07-06 15:42:47');
/*!40000 ALTER TABLE adjustments ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS contracts;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE contracts (
  id int NOT NULL AUTO_INCREMENT,
  room_id int DEFAULT NULL,
  tenant_id int DEFAULT NULL,
  tenant_ids json DEFAULT NULL,
  account_id int DEFAULT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  deposit decimal(10,2) DEFAULT '0.00',
  price_per_month decimal(10,2) NOT NULL,
  terms text COLLATE utf8mb4_unicode_ci,
  handover_status enum('good','damaged','none') COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `status` enum('active','expired','terminated') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  KEY idx_contracts_room (room_id),
  KEY idx_contracts_tenant (tenant_id),
  KEY idx_contracts_account (account_id),
  KEY idx_contracts_status (`status`),
  KEY idx_contracts_end_date (end_date),
  CONSTRAINT contracts_ibfk_58 FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT contracts_ibfk_59 FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT contracts_ibfk_60 FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT contracts_ibfk_61 FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES contracts WRITE;
/*!40000 ALTER TABLE contracts DISABLE KEYS */;
INSERT INTO contracts VALUES (1,1,21,'[21, 2, 23]',15,'2026-04-01','2028-03-31',5000000.00,2500000.00,'Không làm ồn sau 22h. Giữ gìn vệ sinh chung.','good','active','2026-06-25 14:56:44','2026-07-06 15:23:50'),(2,2,1,'[1]',15,'2026-05-01','2027-04-30',4600000.00,2300000.00,'Giữ gìn đồ đạc trong phòng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(3,3,3,'[3]',15,'2026-03-15','2027-03-14',4400000.00,2200000.00,'Không nuôi thú cưng trong phòng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(4,4,4,'[4]',15,'2026-04-10','2027-04-09',4800000.00,2400000.00,'Hạn chế khách qua đêm không báo trước.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(5,9,5,'[5]',15,'2026-06-01','2027-05-31',5100000.00,2550000.00,'Thanh toán tiền phòng trước ngày 5 hàng tháng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(6,11,6,'[6]',15,'2026-03-01','2027-02-28',6400000.00,3200000.00,'Không tổ chức tiệc trong phòng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(7,13,7,'[7]',15,'2026-05-05','2027-05-04',6200000.00,3100000.00,'Giữ gìn nội thất, không đụng tường.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(8,14,8,'[8]',15,'2026-04-20','2027-04-19',6600000.00,3300000.00,'Báo trước 30 ngày nếu muốn chấm dứt hợp đồng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(9,17,9,'[9]',15,'2026-06-01','2027-05-31',5200000.00,2600000.00,'Không hút thuốc trong phòng và khu vực chung.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(10,18,10,'[10]',15,'2026-05-20','2028-05-19',5000000.00,2500000.00,'Giữ gìn vệ sinh phòng và khu vực chung.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(11,21,11,'[11]',15,'2026-04-05','2027-04-04',9000000.00,4500000.00,'Không mang vật nuôi vào khuôn viên.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(12,22,12,'[12]',15,'2026-05-12','2027-05-11',8400000.00,4200000.00,'Báo trước khi sửa chữa đồ trong phòng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(13,23,13,'[13]',15,'2026-06-10','2027-06-09',8600000.00,4300000.00,'Thanh toán đúng hạn, không gia hạn quá 5 ngày.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(14,24,14,'[14]',15,'2026-03-15','2027-03-14',7600000.00,3800000.00,'Không thay đổi cấu trúc phòng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(15,27,15,'[15]',15,'2026-04-01','2027-03-31',8800000.00,4400000.00,'Trả phòng đúng hạn và đầy đủ nội thất.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(16,28,16,'[16]',15,'2026-05-01','2027-04-30',9200000.00,4600000.00,'Sử dụng điện nước tiết kiệm.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(17,31,17,'[17]',15,'2026-06-01','2027-05-31',4800000.00,2400000.00,'Giữ gìn nội thất phòng.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(18,32,18,'[18]',15,'2026-04-15','2027-04-14',6600000.00,3300000.00,'Không làm ồn sau 22h.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(19,34,19,'[19]',15,'2025-07-01','2026-07-10',9600000.00,4800000.00,'Hợp đồng sắp hết hạn - cần gia hạn.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(20,37,20,'[20]',15,'2025-08-01','2026-07-05',7000000.00,3500000.00,'Hợp đồng sắp hết hạn - cần gia hạn.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(21,38,3,'[3]',15,'2024-05-01','2026-04-30',4400000.00,2200000.00,'Hợp đồng cũ đã kết thúc bình thường.','good','active','2026-06-25 14:56:44','2026-07-06 15:00:38'),(22,39,8,'[8]',15,'2025-06-01','2026-05-31',6600000.00,3300000.00,'Hợp đồng cũ đã hết hạn.','good','expired','2026-06-25 14:56:44','2026-07-06 15:00:38'),(23,8,6,'[6]',15,'2026-05-01','2026-06-10',6000000.00,3000000.00,'Thuê ngắn hạn - đã chấm dứt.','damaged','terminated','2026-06-25 14:56:44','2026-07-06 15:00:38'),(24,40,7,'[7]',15,'2026-06-12','2026-06-20',5000000.00,2500000.00,'Test thuê ngắn - đã thanh lý.','none','terminated','2026-06-25 14:56:44','2026-07-06 15:00:38');
/*!40000 ALTER TABLE contracts ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_details`
--

DROP TABLE IF EXISTS invoice_details;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE invoice_details (
  id int NOT NULL AUTO_INCREMENT,
  invoice_id int DEFAULT NULL,
  service_id int DEFAULT NULL,
  quantity decimal(10,2) NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  PRIMARY KEY (id),
  KEY invoice_id (invoice_id),
  KEY service_id (service_id),
  CONSTRAINT invoice_details_ibfk_35 FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT invoice_details_ibfk_36 FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_details`
--

LOCK TABLES invoice_details WRITE;
/*!40000 ALTER TABLE invoice_details DISABLE KEYS */;
INSERT INTO invoice_details VALUES (1,1,1,1.00,3500.00,3500.00),(2,1,3,1.00,30000.00,30000.00),(3,1,4,1.00,80000.00,80000.00),(4,1,5,1.00,200000.00,200000.00),(5,2,1,1.00,3500.00,3500.00),(6,2,3,1.00,30000.00,30000.00),(7,2,4,1.00,80000.00,80000.00),(8,2,5,1.00,200000.00,200000.00),(9,3,1,1.00,3500.00,3500.00),(10,3,3,1.00,30000.00,30000.00),(11,3,4,1.00,80000.00,80000.00),(12,3,5,1.00,200000.00,200000.00),(13,4,1,1.00,3500.00,3500.00),(14,4,3,1.00,30000.00,30000.00),(15,4,4,1.00,80000.00,80000.00),(16,4,5,1.00,200000.00,200000.00),(17,5,1,1.00,3500.00,3500.00),(18,5,3,1.00,30000.00,30000.00),(19,5,4,1.00,80000.00,80000.00),(20,5,5,1.00,200000.00,200000.00),(21,6,1,1.00,3500.00,3500.00),(22,6,3,1.00,30000.00,30000.00),(23,6,4,1.00,80000.00,80000.00),(24,6,5,1.00,200000.00,200000.00),(25,7,1,1.00,3500.00,3500.00),(26,7,3,1.00,30000.00,30000.00),(27,7,4,1.00,80000.00,80000.00),(28,7,5,1.00,200000.00,200000.00),(29,8,1,1.00,3500.00,3500.00),(30,8,3,1.00,30000.00,30000.00),(31,8,4,1.00,80000.00,80000.00),(32,8,5,1.00,200000.00,200000.00),(33,9,1,1.00,3500.00,3500.00),(34,9,3,1.00,30000.00,30000.00),(35,9,4,1.00,80000.00,80000.00),(36,9,5,1.00,200000.00,200000.00),(37,10,1,1.00,3500.00,3500.00),(38,10,3,1.00,30000.00,30000.00),(39,10,4,1.00,80000.00,80000.00),(40,10,5,1.00,200000.00,200000.00),(41,11,1,1.00,3500.00,3500.00),(42,11,3,1.00,30000.00,30000.00),(43,11,4,1.00,80000.00,80000.00),(44,11,5,1.00,200000.00,200000.00),(45,12,1,1.00,3500.00,3500.00),(46,12,3,1.00,30000.00,30000.00),(47,12,4,1.00,80000.00,80000.00),(48,12,5,1.00,200000.00,200000.00),(49,13,1,1.00,3500.00,3500.00),(50,13,3,1.00,30000.00,30000.00),(51,13,4,1.00,80000.00,80000.00),(52,13,5,1.00,200000.00,200000.00),(53,14,1,1.00,3500.00,3500.00),(54,14,3,1.00,30000.00,30000.00),(55,14,4,1.00,80000.00,80000.00),(56,14,5,1.00,200000.00,200000.00),(57,15,1,1.00,3500.00,3500.00),(58,15,3,1.00,30000.00,30000.00),(59,15,4,1.00,80000.00,80000.00),(60,15,5,1.00,200000.00,200000.00),(61,16,1,1.00,3500.00,3500.00),(62,16,3,1.00,30000.00,30000.00),(63,16,4,1.00,80000.00,80000.00),(64,16,5,1.00,200000.00,200000.00),(65,17,1,1.00,3500.00,3500.00),(66,17,3,1.00,30000.00,30000.00),(67,17,4,1.00,80000.00,80000.00),(68,17,5,1.00,200000.00,200000.00),(69,18,1,1.00,3500.00,3500.00),(70,18,3,1.00,30000.00,30000.00),(71,18,4,1.00,80000.00,80000.00),(72,18,5,1.00,200000.00,200000.00),(73,19,1,1.00,3500.00,3500.00),(74,19,3,1.00,30000.00,30000.00),(75,19,4,1.00,80000.00,80000.00),(76,19,5,1.00,200000.00,200000.00),(77,20,1,1.00,3500.00,3500.00),(78,20,3,1.00,30000.00,30000.00),(79,20,4,1.00,80000.00,80000.00),(80,20,5,1.00,200000.00,200000.00),(81,21,1,1.00,3500.00,3500.00),(82,21,3,1.00,30000.00,30000.00),(83,21,4,1.00,80000.00,80000.00),(84,21,5,1.00,200000.00,200000.00),(85,22,1,1.00,3500.00,3500.00),(86,22,3,1.00,30000.00,30000.00),(87,22,4,1.00,80000.00,80000.00),(88,22,5,1.00,200000.00,200000.00);
/*!40000 ALTER TABLE invoice_details ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS invoices;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE invoices (
  id int NOT NULL AUTO_INCREMENT,
  contract_id int DEFAULT NULL,
  billing_month date NOT NULL,
  room_price decimal(10,2) NOT NULL,
  electricity_amount decimal(10,2) DEFAULT '0.00',
  water_amount decimal(10,2) DEFAULT '0.00',
  total_service_price decimal(10,2) DEFAULT '0.00',
  adjustment_amount decimal(10,2) DEFAULT '0.00',
  total_amount decimal(10,2) NOT NULL,
  `status` enum('unpaid','partial','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  payment_date date DEFAULT NULL,
  payment_method enum('cash','bank_transfer','qr') COLLATE utf8mb4_unicode_ci DEFAULT 'cash',
  qr_content varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_invoice (contract_id,billing_month),
  UNIQUE KEY invoices_contract_id_billing_month (contract_id,billing_month),
  KEY idx_invoices_contract (contract_id),
  KEY idx_invoices_status (`status`),
  KEY idx_invoices_billing (billing_month),
  CONSTRAINT invoices_ibfk_1 FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES invoices WRITE;
/*!40000 ALTER TABLE invoices DISABLE KEYS */;
INSERT INTO invoices VALUES (1,1,'2026-07-01',2500000.00,0.00,0.00,313500.00,0.00,2813500.00,'paid','2026-06-25','cash',NULL,'2026-06-25 08:22:33','2026-07-06 15:30:21'),(2,1,'2026-06-01',2500000.00,87500.00,60000.00,313500.00,0.00,2961000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(3,2,'2026-06-01',2300000.00,59500.00,30000.00,313500.00,0.00,2703000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(4,3,'2026-06-01',2200000.00,59500.00,30000.00,313500.00,0.00,2603000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(5,4,'2026-06-01',2400000.00,84000.00,60000.00,313500.00,0.00,2857500.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(6,5,'2026-06-01',2550000.00,175000.00,90000.00,313500.00,0.00,3128500.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(7,6,'2026-06-01',3200000.00,122500.00,75000.00,313500.00,0.00,3711000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(8,7,'2026-06-01',3100000.00,115500.00,60000.00,313500.00,0.00,3589000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(9,8,'2026-06-01',3300000.00,122500.00,75000.00,313500.00,0.00,3811000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(10,9,'2026-06-01',2600000.00,192500.00,105000.00,313500.00,0.00,3211000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(11,10,'2026-06-01',2500000.00,77000.00,45000.00,313500.00,0.00,2935500.00,'unpaid',NULL,'cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=2935500&addInfo=208%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:18','2026-06-25 08:33:11'),(12,11,'2026-06-01',4500000.00,192500.00,120000.00,313500.00,-100000.00,5026000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:18','2026-06-25 08:28:18'),(13,12,'2026-06-01',4200000.00,157500.00,90000.00,313500.00,0.00,4761000.00,'unpaid',NULL,'cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=4761000&addInfo=302%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:18','2026-06-25 09:05:14'),(14,13,'2026-06-01',4300000.00,210000.00,120000.00,313500.00,0.00,4943500.00,'paid','2026-06-25','cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=4963500&addInfo=303%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-06-25 10:33:02'),(15,14,'2026-06-01',3800000.00,140000.00,75000.00,313500.00,0.00,4328500.00,'paid','2026-06-25','cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=4328500&addInfo=304%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-06-25 09:05:28'),(16,15,'2026-06-01',4400000.00,129500.00,75000.00,313500.00,0.00,4918000.00,'paid','2026-06-25','cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=4918000&addInfo=307%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-06-25 13:12:03'),(17,16,'2026-06-01',4600000.00,203000.00,120000.00,313500.00,200000.00,5436500.00,'partial',NULL,'cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=5236500&addInfo=308%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-07-06 15:42:47'),(18,17,'2026-06-01',2400000.00,157500.00,75000.00,313500.00,600000.00,3546000.00,'unpaid',NULL,'cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=2946000&addInfo=401%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-07-06 15:37:15'),(19,18,'2026-06-01',3300000.00,119000.00,60000.00,313500.00,0.00,3792500.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:19','2026-06-25 08:28:19'),(20,19,'2026-06-01',4800000.00,192500.00,135000.00,313500.00,0.00,5441000.00,'unpaid',NULL,'cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=5441000&addInfo=404%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-06-25 08:29:55'),(21,20,'2026-06-01',3500000.00,140000.00,75000.00,313500.00,0.00,4028500.00,'unpaid',NULL,'cash','https://img.vietqr.io/image/970422-0823330294-compact.png?amount=4028500&addInfo=407%2006%2F01&accountName=Tran%20Viet%20Hoang','2026-06-25 08:28:19','2026-06-25 11:49:23'),(22,21,'2026-06-01',2200000.00,115500.00,60000.00,313500.00,0.00,2689000.00,'unpaid',NULL,'cash',NULL,'2026-06-25 08:28:19','2026-06-25 08:28:19');
/*!40000 ALTER TABLE invoices ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meter_readings`
--

DROP TABLE IF EXISTS meter_readings;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE meter_readings (
  id int NOT NULL AUTO_INCREMENT,
  room_id int DEFAULT NULL,
  billing_month date NOT NULL,
  prev_electricity int DEFAULT '0',
  current_electricity int NOT NULL,
  prev_water int DEFAULT '0',
  current_water int NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_meter (room_id,billing_month),
  UNIQUE KEY meter_readings_room_id_billing_month (room_id,billing_month),
  KEY idx_meter_room (room_id),
  KEY idx_meter_billing (billing_month),
  CONSTRAINT meter_readings_ibfk_1 FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meter_readings`
--

LOCK TABLES meter_readings WRITE;
/*!40000 ALTER TABLE meter_readings DISABLE KEYS */;
INSERT INTO meter_readings VALUES (1,1,'2026-04-01',80,115,10,14,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(2,1,'2026-05-01',115,145,14,18,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(3,1,'2026-06-01',145,170,18,22,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(4,2,'2026-04-01',50,70,6,9,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(5,2,'2026-05-01',70,88,9,12,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(6,2,'2026-06-01',88,105,12,14,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(7,3,'2026-04-01',40,60,4,7,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(8,3,'2026-05-01',60,78,7,10,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(9,3,'2026-06-01',78,95,10,12,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(10,4,'2026-04-01',90,120,12,16,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(11,4,'2026-05-01',120,148,16,20,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(12,4,'2026-06-01',148,172,20,24,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(13,9,'2026-06-01',0,50,0,6,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(14,11,'2026-04-01',160,200,22,28,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(15,11,'2026-05-01',200,240,28,33,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(16,11,'2026-06-01',240,275,33,38,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(17,13,'2026-04-01',140,180,18,24,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(18,13,'2026-05-01',180,215,24,29,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(19,13,'2026-06-01',215,248,29,33,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(20,14,'2026-04-01',180,225,24,30,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(21,14,'2026-05-01',225,265,30,35,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(22,14,'2026-06-01',265,300,35,40,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(23,17,'2026-06-01',0,55,0,7,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(24,18,'2026-04-01',60,85,8,12,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(25,18,'2026-05-01',85,108,12,15,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(26,18,'2026-06-01',108,130,15,18,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(27,21,'2026-04-01',250,300,30,38,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(28,21,'2026-05-01',300,355,38,45,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(29,21,'2026-06-01',355,410,45,53,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(30,22,'2026-04-01',220,268,28,35,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(31,22,'2026-05-01',268,310,35,41,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(32,22,'2026-06-01',310,355,41,47,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(33,23,'2026-06-01',0,60,0,8,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(34,24,'2026-04-01',200,248,26,33,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(35,24,'2026-05-01',248,290,33,39,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(36,24,'2026-06-01',290,330,39,44,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(37,27,'2026-04-01',190,235,24,30,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(38,27,'2026-05-01',235,275,30,36,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(39,27,'2026-06-01',275,312,36,41,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(40,28,'2026-04-01',280,335,34,43,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(41,28,'2026-05-01',335,390,43,51,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(42,28,'2026-06-01',390,448,51,59,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(43,31,'2026-06-01',0,45,0,5,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(44,32,'2026-04-01',150,190,20,26,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(45,32,'2026-05-01',190,228,26,31,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(46,32,'2026-06-01',228,262,31,35,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(47,34,'2026-04-01',320,380,40,50,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(48,34,'2026-05-01',380,435,50,59,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(49,34,'2026-06-01',435,490,59,68,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(50,37,'2026-04-01',210,260,27,34,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(51,37,'2026-05-01',260,305,34,40,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(52,37,'2026-06-01',305,345,40,45,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(53,38,'2026-04-01',110,148,14,19,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(54,38,'2026-05-01',148,182,19,23,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(55,38,'2026-06-01',182,215,23,27,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(56,39,'2026-04-01',350,415,44,55,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(57,39,'2026-05-01',415,478,55,65,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(58,39,'2026-06-01',478,545,65,75,'2026-06-25 14:56:44','2026-06-25 14:56:44'),(59,1,'2026-07-01',170,200,22,25,'2026-06-25 11:42:47','2026-06-25 11:42:47'),(60,2,'2026-07-01',105,200,14,25,'2026-06-25 11:42:47','2026-06-25 11:42:47'),(61,3,'2026-07-01',95,200,12,25,'2026-06-25 11:42:47','2026-06-25 11:42:47');
/*!40000 ALTER TABLE meter_readings ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner_config`
--

DROP TABLE IF EXISTS owner_config;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE owner_config (
  id int NOT NULL AUTO_INCREMENT,
  owner_name varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  bank_account varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  bank_name varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  bank_branch varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  qr_template varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'vietqr',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner_config`
--

LOCK TABLES owner_config WRITE;
/*!40000 ALTER TABLE owner_config DISABLE KEYS */;
INSERT INTO owner_config VALUES (1,'Tran Viet Hoang','0823330294','mb','hà nội','vietqr','2026-06-22 11:39:44','2026-06-24 09:25:27');
/*!40000 ALTER TABLE owner_config ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS payments;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE payments (
  id int NOT NULL AUTO_INCREMENT,
  invoice_id int DEFAULT NULL,
  amount decimal(10,2) NOT NULL,
  payment_date datetime DEFAULT NULL,
  payment_method enum('cash','bank_transfer','qr') COLLATE utf8mb4_unicode_ci NOT NULL,
  note varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  confirmed tinyint(1) NOT NULL DEFAULT '0',
  created_at datetime NOT NULL,
  PRIMARY KEY (id),
  KEY idx_payments_invoice (invoice_id),
  KEY idx_payments_date (payment_date),
  CONSTRAINT payments_ibfk_1 FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES payments WRITE;
/*!40000 ALTER TABLE payments DISABLE KEYS */;
INSERT INTO payments VALUES (1,1,2000000.00,'2026-06-25 08:33:39','bank_transfer','Thanh toan mot phan t7',0,'2026-06-25 08:33:39'),(2,15,4328500.00,'2026-06-25 09:05:28','cash','',0,'2026-06-25 09:05:28'),(3,1,2813500.00,'2026-06-25 09:05:33','cash','Xac nhan thanh toan truc tiep',0,'2026-06-25 09:05:33'),(4,14,4000000.00,'2026-06-25 10:16:13','cash','',0,'2026-06-25 10:16:13'),(5,14,4963500.00,'2026-06-25 10:32:51','cash','Xac nhan thanh toan truc tiep',0,'2026-06-25 10:32:51'),(6,16,4000000.00,'2026-06-25 13:06:39','cash','',0,'2026-06-25 13:06:39'),(7,16,918000.00,'2026-06-25 13:12:03','cash','',0,'2026-06-25 13:12:03'),(8,17,5000000.00,'2026-06-25 13:56:38','cash','Thanh toan mot phan',0,'2026-06-25 13:56:38');
/*!40000 ALTER TABLE payments ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS rooms;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE rooms (
  id int NOT NULL AUTO_INCREMENT,
  room_number varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  room_name varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  room_type enum('standard','deluxe','suite') COLLATE utf8mb4_unicode_ci DEFAULT 'standard',
  base_price decimal(12,2) NOT NULL,
  area decimal(6,2) DEFAULT NULL,
  floor int DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  images json DEFAULT NULL,
  `status` enum('available','rented','maintenance','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  max_occupancy int DEFAULT '1',
  address varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  amenities json DEFAULT NULL,
  deposit_amount decimal(12,2) DEFAULT '0.00',
  electricity_price decimal(10,2) DEFAULT '3500.00',
  water_price decimal(10,2) DEFAULT '15000.00',
  internet_price decimal(10,2) DEFAULT '0.00',
  parking_price decimal(10,2) DEFAULT '0.00',
  other_services_price decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (id),
  UNIQUE KEY room_number (room_number),
  UNIQUE KEY room_number_2 (room_number),
  UNIQUE KEY room_number_3 (room_number),
  UNIQUE KEY room_number_4 (room_number),
  UNIQUE KEY room_number_5 (room_number),
  UNIQUE KEY room_number_6 (room_number),
  UNIQUE KEY room_number_7 (room_number),
  UNIQUE KEY room_number_8 (room_number),
  UNIQUE KEY room_number_9 (room_number),
  UNIQUE KEY room_number_10 (room_number),
  UNIQUE KEY room_number_11 (room_number),
  UNIQUE KEY room_number_12 (room_number),
  UNIQUE KEY room_number_13 (room_number),
  UNIQUE KEY room_number_14 (room_number),
  UNIQUE KEY room_number_15 (room_number),
  UNIQUE KEY room_number_16 (room_number),
  UNIQUE KEY room_number_17 (room_number),
  UNIQUE KEY room_number_18 (room_number),
  UNIQUE KEY room_number_19 (room_number),
  UNIQUE KEY room_number_20 (room_number),
  UNIQUE KEY room_number_21 (room_number),
  UNIQUE KEY room_number_22 (room_number),
  UNIQUE KEY room_number_23 (room_number),
  UNIQUE KEY room_number_24 (room_number),
  UNIQUE KEY room_number_25 (room_number),
  UNIQUE KEY room_number_26 (room_number),
  UNIQUE KEY room_number_27 (room_number),
  UNIQUE KEY room_number_28 (room_number),
  UNIQUE KEY room_number_29 (room_number),
  UNIQUE KEY room_number_30 (room_number),
  UNIQUE KEY room_number_31 (room_number)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES rooms WRITE;
/*!40000 ALTER TABLE rooms DISABLE KEYS */;
INSERT INTO rooms VALUES (1,'101','Phòng 101','standard',2500000.00,22.00,1,'Phòng standard, nội thất cơ bản.','[]','rented','2026-06-25 14:56:44','2026-06-25 09:18:17',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"parking\"]',5000000.00,3500.00,15000.00,100000.00,150000.00,0.00),(2,'102','Phòng 102','standard',2300000.00,20.00,1,'Phòng view nhẹ, phù hợp một người.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\"]',4600000.00,3500.00,15000.00,80000.00,100000.00,0.00),(3,'103','Phòng 103','standard',2200000.00,18.00,1,'Phòng nhỏ gọn, giá tốt.','[]','rented','2026-06-25 14:56:44','2026-06-25 08:32:35',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"bed\", \"water_heater\"]',4400000.00,3500.00,15000.00,80000.00,0.00,0.00),(4,'104','Phòng 104','standard',2400000.00,21.00,1,'Phòng sạch sẽ, yên tĩnh.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"tv\"]',4800000.00,3500.00,15000.00,100000.00,100000.00,0.00),(5,'105','Phòng 105','standard',2100000.00,18.00,1,'Phòng tiết kiệm chi phí.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\"]',4200000.00,3500.00,15000.00,80000.00,0.00,0.00),(6,'106','Phòng 106','standard',2350000.00,20.00,1,'Phòng trống, có thể dọn ngay.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',4700000.00,3500.00,15000.00,80000.00,100000.00,0.00),(7,'107','Phòng 107','standard',2450000.00,21.00,1,'Phòng mới, đang bảo trì nhỏ.','[]','maintenance','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\"]',4900000.00,3500.00,15000.00,100000.00,100000.00,0.00),(8,'108','Phòng 108','standard',2200000.00,19.00,1,'Phòng trống tầng 1.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"bed\"]',4400000.00,3500.00,15000.00,80000.00,0.00,0.00),(9,'109','Phòng 109','standard',2550000.00,23.00,1,'Phòng rộng hơn bình thường.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',5100000.00,3500.00,15000.00,100000.00,150000.00,0.00),(10,'110','Phòng 110','standard',2300000.00,20.00,1,'Phòng trống cuối tầng 1.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\"]',4600000.00,3500.00,15000.00,80000.00,100000.00,0.00),(11,'201','Phòng 201','deluxe',3200000.00,28.00,2,'Phòng deluxe rộng, full tiện nghi.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\"]',6400000.00,3500.00,15000.00,120000.00,150000.00,0.00),(12,'202','Phòng 202','deluxe',3000000.00,26.00,2,'Phòng deluxe, đang bảo trì.','[]','maintenance','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',6000000.00,3500.00,15000.00,100000.00,150000.00,0.00),(13,'203','Phòng 203','deluxe',3100000.00,27.00,2,'Phòng deluxe view đẹp.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\"]',6200000.00,3500.00,15000.00,120000.00,150000.00,0.00),(14,'204','Phòng 204','deluxe',3300000.00,29.00,2,'Phòng deluxe cao cấp tầng 2.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\"]',6600000.00,3500.00,15000.00,120000.00,150000.00,0.00),(15,'205','Phòng 205','deluxe',2900000.00,25.00,2,'Phòng deluxe giá tốt.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',5800000.00,3500.00,15000.00,100000.00,150000.00,0.00),(16,'206','Phòng 206','deluxe',3050000.00,26.00,2,'Phòng deluxe trống.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"balcony\"]',6100000.00,3500.00,15000.00,100000.00,150000.00,0.00),(17,'207','Phòng 207','standard',2600000.00,23.00,2,'Phòng standard rộng tầng 2.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',5200000.00,3500.00,15000.00,100000.00,100000.00,0.00),(18,'208','Phòng 208','standard',2500000.00,22.00,2,'Phòng standard tầng 2.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',5000000.00,3500.00,15000.00,100000.00,100000.00,0.00),(19,'209','Phòng 209','deluxe',3150000.00,28.00,2,'Phòng deluxe cuối hành lang.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\"]',6300000.00,3500.00,15000.00,120000.00,150000.00,0.00),(20,'210','Phòng 210','standard',2400000.00,21.00,2,'Phòng standard cuối tầng 2.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',4800000.00,3500.00,15000.00,80000.00,100000.00,0.00),(21,'301','Phòng 301','standard',4500000.00,35.00,3,'Phòng suite cao cấp, full tiện nghi.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',9000000.00,3500.00,15000.00,150000.00,200000.00,0.00),(22,'302','Phòng 302','standard',4200000.00,32.00,3,'Phòng suite family.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\"]',8400000.00,3500.00,15000.00,150000.00,200000.00,0.00),(23,'303','Phòng 303','standard',4300000.00,33.00,3,'Phòng suite góc view đẹp.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',8600000.00,3500.00,15000.00,150000.00,200000.00,0.00),(24,'304','Phòng 304','deluxe',3800000.00,30.00,3,'Phòng deluxe rộng tầng 3.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\"]',7600000.00,3500.00,15000.00,120000.00,200000.00,0.00),(25,'305','Phòng 305','deluxe',3600000.00,28.00,3,'Phòng deluxe tiết kiệm.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\"]',7200000.00,3500.00,15000.00,120000.00,150000.00,0.00),(26,'306','Phòng 306','deluxe',3700000.00,29.00,3,'Phòng deluxe trống tầng 3.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\"]',7400000.00,3500.00,15000.00,120000.00,150000.00,0.00),(27,'307','Phòng 307','standard',4400000.00,34.00,3,'Phòng suite giá tốt.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\"]',8800000.00,3500.00,15000.00,150000.00,200000.00,0.00),(28,'308','Phòng 308','standard',4600000.00,36.00,3,'Phòng suite penthouse nhỏ.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\"]',9200000.00,3500.00,15000.00,150000.00,200000.00,0.00),(29,'309','Phòng 309','deluxe',3850000.00,30.00,3,'Phòng deluxe đang bảo trì.','[]','available','2026-06-25 14:56:44','2026-06-25 09:14:08',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\"]',7700000.00,3500.00,15000.00,120000.00,200000.00,0.00),(30,'310','Phòng 310','deluxe',3650000.00,28.00,3,'Phòng deluxe cuối hành lang.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"balcony\"]',7300000.00,3500.00,15000.00,120000.00,150000.00,0.00),(31,'401','Phòng 401','standard',2400000.00,22.00,4,'Phòng standard tầng 4.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',4800000.00,3500.00,15000.00,80000.00,100000.00,0.00),(32,'402','Phòng 402','deluxe',3300000.00,27.00,4,'Phòng deluxe view hồ.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\"]',6600000.00,3500.00,15000.00,120000.00,150000.00,0.00),(33,'403','Phòng 403','standard',2350000.00,21.00,4,'Phòng standard mới cải tạo.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\"]',4700000.00,3500.00,15000.00,80000.00,100000.00,0.00),(34,'404','Phòng 404','standard',4800000.00,38.00,4,'Phòng suite penthouse.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\"]',9600000.00,3500.00,15000.00,150000.00,200000.00,0.00),(35,'405','Phòng 405','deluxe',3400000.00,28.00,4,'Phòng deluxe tầng 4.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\"]',6800000.00,3500.00,15000.00,120000.00,150000.00,0.00),(36,'406','Phòng 406','standard',2450000.00,22.00,4,'Phòng standard cuối tầng 4.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\"]',4900000.00,3500.00,15000.00,80000.00,100000.00,0.00),(37,'407','Phòng 407','deluxe',3500000.00,30.00,4,'Phòng deluxe cao cấp.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\"]',7000000.00,3500.00,15000.00,120000.00,150000.00,0.00),(38,'408','Phòng 408','standard',2500000.00,23.00,4,'Phòng standard rộng.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\"]',5000000.00,3500.00,15000.00,100000.00,100000.00,0.00),(39,'409','Phòng 409','standard',5000000.00,40.00,4,'Phòng suite VIP.','[]','rented','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\", \"camera\", \"fingerprint_lock\", \"washing_machine\", \"kitchen\", \"water_heater\"]',10000000.00,3500.00,15000.00,150000.00,200000.00,0.00),(40,'410','Phòng 410','deluxe',3600000.00,30.00,4,'Phòng deluxe cuối tầng 4.','[]','available','2026-06-25 14:56:44','2026-06-25 14:56:44',1,'123 Nguyễn Trãi, Q.1, TP.HCM','[\"wifi\", \"wc\", \"aircon\", \"bed\", \"tv\", \"wardrobe\", \"refrigerator\", \"balcony\", \"parking\"]',7200000.00,3500.00,15000.00,120000.00,150000.00,0.00);
/*!40000 ALTER TABLE rooms ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS services;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE services (
  id int NOT NULL AUTO_INCREMENT,
  service_name varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  unit varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES services WRITE;
/*!40000 ALTER TABLE services DISABLE KEYS */;
INSERT INTO services VALUES (1,'Dien',3500.00,'kWh','2026-06-25 14:56:44','2026-06-25 14:56:44'),(2,'Nuoc',15000.00,'m3','2026-06-25 14:56:44','2026-06-25 14:56:44'),(3,'Rac thai',30000.00,'thang','2026-06-25 14:56:44','2026-06-25 14:56:44'),(4,'Wifi',80000.00,'thang','2026-06-25 14:56:44','2026-06-25 14:56:44'),(5,'Gui xe',200000.00,'thang','2026-06-25 14:56:44','2026-06-25 14:56:44'),(6,'thang máy',100000.00,'tháng','2026-06-25 09:17:18','2026-06-25 09:17:18');
/*!40000 ALTER TABLE services ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS tenants;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE tenants (
  id int NOT NULL AUTO_INCREMENT,
  full_name varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  citizen_id varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  phone_number varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  email varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  address varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY citizen_id (citizen_id),
  UNIQUE KEY citizen_id_2 (citizen_id),
  UNIQUE KEY citizen_id_3 (citizen_id),
  UNIQUE KEY citizen_id_4 (citizen_id),
  UNIQUE KEY citizen_id_5 (citizen_id),
  UNIQUE KEY citizen_id_6 (citizen_id),
  UNIQUE KEY citizen_id_7 (citizen_id),
  UNIQUE KEY citizen_id_8 (citizen_id),
  UNIQUE KEY citizen_id_9 (citizen_id),
  UNIQUE KEY citizen_id_10 (citizen_id),
  UNIQUE KEY citizen_id_11 (citizen_id),
  UNIQUE KEY citizen_id_12 (citizen_id),
  UNIQUE KEY citizen_id_13 (citizen_id),
  UNIQUE KEY citizen_id_14 (citizen_id),
  UNIQUE KEY citizen_id_15 (citizen_id),
  UNIQUE KEY citizen_id_16 (citizen_id),
  UNIQUE KEY citizen_id_17 (citizen_id),
  UNIQUE KEY citizen_id_18 (citizen_id),
  UNIQUE KEY citizen_id_19 (citizen_id),
  UNIQUE KEY citizen_id_20 (citizen_id),
  UNIQUE KEY citizen_id_21 (citizen_id),
  UNIQUE KEY citizen_id_22 (citizen_id),
  UNIQUE KEY citizen_id_23 (citizen_id),
  UNIQUE KEY citizen_id_24 (citizen_id),
  UNIQUE KEY citizen_id_25 (citizen_id),
  UNIQUE KEY citizen_id_26 (citizen_id),
  UNIQUE KEY citizen_id_27 (citizen_id),
  UNIQUE KEY citizen_id_28 (citizen_id),
  UNIQUE KEY citizen_id_29 (citizen_id),
  UNIQUE KEY citizen_id_30 (citizen_id),
  UNIQUE KEY citizen_id_31 (citizen_id)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES tenants WRITE;
/*!40000 ALTER TABLE tenants DISABLE KEYS */;
INSERT INTO tenants VALUES (1,'Nguyễn Văn A','012345678901','0909123456','nguyenvana@example.com','123 Lê Lợi, Q.1, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(2,'Trần Thị B','098765432109','0912345678','tranthib@example.com','456 Đồng Khởi, Q.1, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(3,'Lê Văn C','032165498709','0938765432','levanc@example.com','789 Pasteur, Q.3, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(4,'Phạm Thị D','011223344556','0944556677','phamthid@example.com','101 Nguyễn Huệ, Q.1, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(5,'Hoàng Văn E','077889900112','0955667788','hoangvane@example.com','202 Hai Bà Trưng, Q.3, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(6,'Đỗ Thị F','033445566778','0966778899','dothif@example.com','303 Võ Văn Tần, Q.3, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(7,'Bùi Văn G','088990011223','0977889900','buivang@example.com','404 Lý Thái Tổ, Q.10, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(8,'Vũ Thị H','099001122334','0988990011','vuthih@example.com','505 Trần Hưng Đạo, Q.5, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(9,'Đặng Văn I','055667788990','0911223344','dangvani@example.com','606 Cách Mạng Tháng 8, Q.3, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(10,'Lý Thị K','066778899001','0922334455','lythik@example.com','707 Nguyễn Tri Phương, Q.10, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(11,'Trịnh Văn L','044556677889','0933445566','trinhvanl@example.com','808 Trần Phú, Q.Bình Thạnh, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(12,'Mai Thị M','022334455667','0944556677','maithim@example.com','909 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(13,'Ngô Văn N','077889900223','0955667788','ngovann@example.com','111 Phạm Ngũ Lão, Q.Gò Vấp, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(14,'Cao Thị O','088990011334','0966778899','hoangsao113aa@gmail.com','222 Quang Trung, Q.Gò Vấp, TP.HCM','2026-06-25 14:56:44','2026-06-25 11:59:34'),(15,'Dương Văn P','099001122445','0977889900','hbao7888@gmail.com','333 Lê Văn Việt, Q.Thủ Đức, TP.HCM','2026-06-25 14:56:44','2026-06-25 11:57:35'),(16,'Trần Văn Q','011223344667','0988990011','tranvanq@example.com','444 Võ Văn Ngân, Q.Thủ Đức, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(17,'Nguyễn Thị R','033445566881','0912345001','nguyenthir@example.com','555 Hoàng Diệu, Q.4, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(18,'Phạm Văn S','044556677892','0923456002','phamvans@example.com','666 Bến Vân Đồn, Q.4, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(19,'Trần Minh T','055667788903','0934567003','tranminht@example.com','777 Vàm Linh, Q.7, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(20,'Lê Hoàng U','066778899014','0945678004','lehoangu@example.com','888 Nguyễn Thị Thập, Q.7, TP.HCM','2026-06-25 14:56:44','2026-06-25 14:56:44'),(21,'Trần Việt Hoàng','34525234234','2342344442','viethoang101004@gmail.com','','2026-06-25 10:53:35','2026-06-25 10:53:35'),(22,'Trần Trung kiên','0785676756','0987234611','','','2026-07-06 15:18:05','2026-07-06 15:18:05'),(23,'Kiên','345345','3453453','','','2026-07-06 15:19:09','2026-07-06 15:19:09');
/*!40000 ALTER TABLE tenants ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07  9:28:06
