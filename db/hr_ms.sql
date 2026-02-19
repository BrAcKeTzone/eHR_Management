-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 18, 2026 at 05:46 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr_ms`
--

-- --------------------------------------------------------

--
-- Table structure for table `application`
--

CREATE TABLE `application` (
  `id` int(11) NOT NULL,
  `attemptNumber` int(11) NOT NULL DEFAULT 1,
  `status` enum('PENDING','ACKNOWLEDGED','FOR_EVALUATION','APPROVED','REJECTED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `documents` longtext DEFAULT NULL,
  `demoSchedule` datetime(3) DEFAULT NULL,
  `totalScore` double DEFAULT NULL,
  `result` enum('PASS','FAIL') DEFAULT NULL,
  `hrNotes` text DEFAULT NULL,
  `applicantId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `demoDuration` int(11) DEFAULT NULL,
  `demoLocation` varchar(191) DEFAULT NULL,
  `demoNotes` text DEFAULT NULL,
  `demoRescheduleCount` int(11) NOT NULL DEFAULT 0,
  `demoRescheduleReason` varchar(191) DEFAULT NULL,
  `interviewEligible` tinyint(1) NOT NULL DEFAULT 0,
  `interviewNotes` text DEFAULT NULL,
  `interviewResult` enum('PASS','FAIL') DEFAULT NULL,
  `interviewScore` double DEFAULT NULL,
  `specializationId` int(11) DEFAULT NULL,
  `educationalBackground` text DEFAULT NULL,
  `motivation` text DEFAULT NULL,
  `program` varchar(191) DEFAULT NULL,
  `subjectSpecialization` varchar(191) DEFAULT NULL,
  `teachingExperience` text DEFAULT NULL,
  `instructorAttributesScore` double DEFAULT NULL,
  `knowledgeOfSubjectScore` double DEFAULT NULL,
  `studentLearningActionsScore` double DEFAULT NULL,
  `teachingMethodScore` double DEFAULT NULL,
  `demoFeedback` text DEFAULT NULL,
  `finalInterviewFeedback` text DEFAULT NULL,
  `finalInterviewResult` enum('PASS','FAIL') DEFAULT NULL,
  `initialInterviewFeedback` text DEFAULT NULL,
  `initialInterviewResult` enum('PASS','FAIL') DEFAULT NULL,
  `initialInterviewSchedule` datetime(3) DEFAULT NULL,
  `initialInterviewRescheduleCount` int(11) NOT NULL DEFAULT 0,
  `initialInterviewRescheduleReason` varchar(191) DEFAULT NULL,
  `finalInterviewSchedule` datetime(3) DEFAULT NULL,
  `finalInterviewRescheduleCount` int(11) NOT NULL DEFAULT 0,
  `finalInterviewRescheduleReason` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(191) NOT NULL,
  `sentAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applicationId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` enum('UNREAD','READ') NOT NULL DEFAULT 'UNREAD'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp`
--

CREATE TABLE `otp` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `otp` varchar(191) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `preemploymentrequirement`
--

CREATE TABLE `preemploymentrequirement` (
  `id` int(11) NOT NULL,
  `sss` varchar(191) DEFAULT NULL,
  `philhealth` varchar(191) DEFAULT NULL,
  `tin` varchar(191) DEFAULT NULL,
  `pagibig` varchar(191) DEFAULT NULL,
  `photo2x2` varchar(191) DEFAULT NULL,
  `coe` varchar(191) DEFAULT NULL,
  `marriageContract` varchar(191) DEFAULT NULL,
  `prcLicense` varchar(191) DEFAULT NULL,
  `civilService` varchar(191) DEFAULT NULL,
  `mastersUnits` varchar(191) DEFAULT NULL,
  `car` varchar(191) DEFAULT NULL,
  `tor` varchar(191) DEFAULT NULL,
  `otherCert` varchar(191) DEFAULT NULL,
  `tesdaCerts` longtext DEFAULT NULL,
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `specialization`
--

CREATE TABLE `specialization` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `role` enum('APPLICANT','HR','ADMIN') NOT NULL DEFAULT 'APPLICANT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `profilePicture` varchar(191) DEFAULT NULL,
  `profilePicturePublicId` varchar(191) DEFAULT NULL,
  `barangay` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `civilStatus` varchar(191) DEFAULT NULL,
  `education` longtext DEFAULT NULL,
  `houseNo` varchar(191) DEFAULT NULL,
  `province` varchar(191) DEFAULT NULL,
  `references` longtext DEFAULT NULL,
  `street` varchar(191) DEFAULT NULL,
  `zipCode` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('030f749c-bd85-4309-9118-f58e75e4de59', '6b0c60a684e81f2fb8466dc936bb0659abbe6416b40d92d1bc478ded0be53927', '2026-02-18 16:45:52.451', '20260216112023_add_personal_info_fields_to_user', NULL, NULL, '2026-02-18 16:45:52.441', 1),
('08b648d1-260e-4263-b638-5f64eccf36fe', '5878811b94fbde867e1ef8245ee8be475e508666ccf15241cb7d0b6e8ba6f077', '2026-02-18 16:45:52.206', '20260215094757_add_demo_feedback_and_interview_fields', NULL, NULL, '2026-02-18 16:45:52.196', 1),
('108ecce9-368f-408a-b1d9-37387d7576e4', 'ccbac4bfbc3c8aa3c0992bc829ace19e5fe72a655dcd44cd52d1e725407004ab', '2026-02-18 16:45:51.736', '20251207162642_add_demo_reschedule_reason_to_application', NULL, NULL, '2026-02-18 16:45:51.727', 1),
('1a8425ce-00a0-4c42-9e9a-00ac7e5b09ab', 'ef3260941faf5209c14e0b4c81d82e6b512218207d221a1e3a163546e1837698', '2026-02-18 16:45:52.183', '20260213152450_add_notification_status_field', NULL, NULL, '2026-02-18 16:45:52.160', 1),
('21fff95e-1c92-4295-9d88-2066b7ad063c', 'a98680d40d8238f73a8bdeb77d8375e564cdec6c5a6de4c4f831b2a2311aed93', '2026-02-18 16:45:51.767', '20251208193015_add_interview_reschedule_fields', NULL, NULL, '2026-02-18 16:45:51.758', 1),
('2fab40f8-2524-4cc4-8ce5-1b22c3bcbd07', '45652c2c39e7856c88f8b73b516935fc01fbc3e49ab9b60de6a202d05d3ffc1b', '2026-02-18 16:45:51.934', '20260212030455_add_application_details_fields', NULL, NULL, '2026-02-18 16:45:51.922', 1),
('39e2ce7e-b4f3-427e-a637-6d88e76fda80', '4f4fbc75bc33493906c214468aa147ab85697c8268cff7a303768d4f73d0164b', '2026-02-18 16:45:51.716', '20251207094028_add_demo_reschedule_count_to_application', NULL, NULL, '2026-02-18 16:45:51.706', 1),
('4450803d-d142-4dea-bade-23a301471611', 'c2faa4a5f7b1ed386f2eac454966ea0877b31c4e94183bc1bb2ee39803f4c75d', '2026-02-18 16:45:52.342', '20260215125108_change_interview_results_to_enum_and_remove_stage_scores', NULL, NULL, '2026-02-18 16:45:52.326', 1),
('45ecee68-a7c5-461e-8936-70e2abb70e76', '60be6bb19389c81bff254a44287c0bfd696a4939151195df40097e485eae05ec', '2026-02-18 16:45:52.324', '20260215121500_set_interview_results_enum', NULL, NULL, '2026-02-18 16:45:52.208', 1),
('45fbab6c-6a4c-4e5d-adc6-4c0a61ab9cc7', '9ac4630a61a3bd7822bca13076821cd0b4eb9bc5e45758ab2731902d7ddb1b42', '2026-02-18 16:45:51.649', '20251015012247_change_documents_to_longtext', NULL, NULL, '2026-02-18 16:45:51.578', 1),
('4b21e607-4495-4ad2-83fd-253d312bb8a7', 'e0132c459b5fcdd232c8eb4be7600941fcc49bc358502db62c528c580ca81776', '2026-02-18 16:45:51.576', '20251014151009_add_demo_schedule_details', NULL, NULL, '2026-02-18 16:45:51.561', 1),
('4e142fd6-6668-4505-9fc2-ee70ca14666e', '32ff313ab92ffdffc5ae7442cce457a1620972256677e0bbb46cb51657875598', '2026-02-18 16:45:51.777', '20251208195402_add_interview_rating_fields', NULL, NULL, '2026-02-18 16:45:51.768', 1),
('5aa43ff5-8b5d-48ba-a0fc-bd2be8e4603a', '83da5535b526c161aebbe81922126c4aa1ceb49f97d308d173ada0dffaafe06a', '2026-02-18 16:45:50.943', '20250909041110_add_verified_to_otp', NULL, NULL, '2026-02-18 16:45:49.857', 1),
('76aa941e-febc-4c9b-b438-06a046448307', 'dba0cba6ea256c456a3e39c6ab2b4ffbbd0a0b1c8e17f9c39c5c72a9f071e6d2', '2026-02-18 16:45:51.757', '20251208170349_add_interview_schedule_to_application', NULL, NULL, '2026-02-18 16:45:51.749', 1),
('80981125-59d2-4eb4-9112-ce1c2ca0fc02', '70ead0c31a6e86eadccdffe4462eab33a94b41b76758022963bb9da711992029', '2026-02-18 16:45:52.158', '20260212052610_add_pre_employment_model_and_restore_enum', NULL, NULL, '2026-02-18 16:45:52.017', 1),
('81892505-5706-4084-91b3-350e65031203', '9e766b8b135d648f3b6c14ef8d954ce9fcade948b30f3188a76495e08dd759f1', '2026-02-18 16:45:51.725', '20251207160646_add_profile_picture_to_user', NULL, NULL, '2026-02-18 16:45:51.717', 1),
('826ce959-5274-4b03-bf39-c20d19164b34', '469c1d42650c82c10f91fb16e88b4a28d942b613f7f194b47b8bb0a12e7fa43f', '2026-02-18 16:45:51.559', '20250921145051_transform_to_hr_application_system', NULL, NULL, '2026-02-18 16:45:50.945', 1),
('99ed0775-773f-49e2-836f-d69941e2a762', '27fb5238ab65532462e1eac940d6eb62967a8ca9153d5df81d52b49466883a1a', '2026-02-18 16:45:52.364', '20260215133000_split_interview_schedule', NULL, NULL, '2026-02-18 16:45:52.345', 1),
('b4896fd1-f322-4299-9391-89002e790ab1', 'f0e36dd3dbef8ac2d6a69cf626d9b8548dc58619ab6aa94083a1d99504e038d6', '2026-02-18 16:45:51.747', '20251208162920_add_interview_eligible_to_application', NULL, NULL, '2026-02-18 16:45:51.738', 1),
('b7f1b1fb-bd5c-4ea8-8e6a-3c123b548185', '8e13e0f1a20d5cd17ceb0fae6ff0ee510f968d6567e5bc1b79c4bc3ff84f06ce', '2026-02-18 16:45:51.705', '20251102093136_separate_first_and_last_name', NULL, NULL, '2026-02-18 16:45:51.686', 1),
('be7e23d0-1d40-44c0-9044-9926d08badf1', '5076d317e645722c478581e4800860d777d0b137e5a9ee32483253d521b028f0', '2026-02-18 16:45:52.015', '20260212033717_add_acknowledged_and_for_evaluation_statuses', NULL, NULL, '2026-02-18 16:45:51.935', 1),
('c1d873cd-e008-47e3-8513-59617db6f26d', '9fec567336b80fbe6b077a6aab9a31ef90b54621d63dcacbf825d03b27d4a5c7', '2026-02-18 16:45:52.440', '20260215135009_separate_initial_final_columns', NULL, NULL, '2026-02-18 16:45:52.365', 1),
('cdb32285-558d-4893-8fe7-9f80dbdec621', '8dde25fc0287e5866e7b90f61bd37e5461000c2343482328dbafa08198966703', '2026-02-18 16:45:51.920', '20260212021837_add_specialization_to_application', NULL, NULL, '2026-02-18 16:45:51.832', 1),
('d8b4e8e6-9f86-4d57-ad9f-5ad5861d4792', 'e2919169049609c3883727aad5e24b551be6ba7a32a73f42b5f2bfedf2f87d27', '2026-02-18 16:45:51.831', '20260212012043_add_specialization_model', NULL, NULL, '2026-02-18 16:45:51.778', 1),
('dd0c156a-21af-44f6-beda-e2fdc166f7d3', 'b8fdf1845c7487019376c3aa7b7f02b32ac7dae473fb3e5c628e777313bbde5e', '2026-02-18 16:45:52.194', '20260215020950_add_demo_category_scores', NULL, NULL, '2026-02-18 16:45:52.184', 1),
('f472fc14-7c59-49a6-b2d7-a79745249df5', 'a890c370a7e216cdd7f35ef029c211b07dd0a17d7cd7da90056fed7fb1db35e0', '2026-02-18 16:45:51.684', '20251102_remove_rubric_score_models', NULL, NULL, '2026-02-18 16:45:51.650', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `application`
--
ALTER TABLE `application`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Application_applicantId_attemptNumber_idx` (`applicantId`,`attemptNumber`),
  ADD KEY `Application_specializationId_idx` (`specializationId`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_email_idx` (`email`),
  ADD KEY `Notification_status_idx` (`status`);

--
-- Indexes for table `otp`
--
ALTER TABLE `otp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Otp_email_idx` (`email`);

--
-- Indexes for table `preemploymentrequirement`
--
ALTER TABLE `preemploymentrequirement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PreEmploymentRequirement_userId_key` (`userId`);

--
-- Indexes for table `specialization`
--
ALTER TABLE `specialization`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Specialization_name_key` (`name`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `application`
--
ALTER TABLE `application`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otp`
--
ALTER TABLE `otp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `preemploymentrequirement`
--
ALTER TABLE `preemploymentrequirement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `specialization`
--
ALTER TABLE `specialization`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `application`
--
ALTER TABLE `application`
  ADD CONSTRAINT `Application_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Application_specializationId_fkey` FOREIGN KEY (`specializationId`) REFERENCES `specialization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `preemploymentrequirement`
--
ALTER TABLE `preemploymentrequirement`
  ADD CONSTRAINT `PreEmploymentRequirement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
