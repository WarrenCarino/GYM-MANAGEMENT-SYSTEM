-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 05, 2026 at 04:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gym_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_table`
--

CREATE TABLE `admin_table` (
  `admin_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'admin',
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_table`
--

INSERT INTO `admin_table` (`admin_id`, `name`, `contact`, `email`, `password`, `role`, `status`, `created_at`) VALUES
(1, 'John Admin', '09111111111', 'admin@melgym.com', 'admin123', 'admin', 'Active', NULL),
(2, 'Maria Santos', '09111111112', 'maria@melgym.com', 'admin456', 'admin', 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL,
  `member_id` int(11) DEFAULT NULL,
  `walkin_id` int(11) DEFAULT NULL,
  `scanned_at` datetime NOT NULL,
  `date` date NOT NULL,
  `time_in` time NOT NULL,
  `time_out` time DEFAULT '00:00:00',
  `status` varchar(20) NOT NULL DEFAULT 'Present'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance_logs`
--

INSERT INTO `attendance_logs` (`id`, `member_id`, `walkin_id`, `scanned_at`, `date`, `time_in`, `time_out`, `status`) VALUES
(1, 1, NULL, '2026-04-10 08:00:00', '2026-04-10', '08:00:00', '10:00:00', 'Completed'),
(2, 2, NULL, '2026-04-10 09:00:00', '2026-04-10', '09:00:00', '11:00:00', 'Completed'),
(3, 3, NULL, '2026-04-11 07:00:00', '2026-04-11', '07:00:00', '09:00:00', 'Completed'),
(4, 1, NULL, '2026-04-12 08:00:00', '2026-04-12', '08:00:00', '00:00:00', 'Present'),
(5, NULL, 1, '2026-04-10 10:00:00', '2026-04-10', '10:00:00', '11:30:00', 'Completed'),
(6, NULL, 2, '2026-04-10 10:30:00', '2026-04-10', '10:30:00', '12:00:00', 'Completed'),
(7, NULL, 3, '2026-04-11 09:00:00', '2026-04-11', '09:00:00', '10:30:00', 'Completed'),
(8, 1, NULL, '2026-04-12 23:08:26', '2026-04-12', '08:00:00', '09:00:00', 'Completed'),
(9, 2, NULL, '2026-04-12 23:08:26', '2026-04-12', '09:00:00', '10:00:00', 'Completed'),
(10, 3, NULL, '2026-04-12 23:08:26', '2026-04-12', '07:00:00', '08:00:00', 'Completed'),
(11, 1, NULL, '2026-04-12 23:08:26', '2026-04-11', '08:00:00', '09:00:00', 'Completed'),
(12, 2, NULL, '2026-04-12 23:08:26', '2026-04-11', '09:00:00', '10:00:00', 'Completed'),
(13, NULL, 1, '2026-04-12 23:08:26', '2026-04-12', '10:00:00', NULL, 'Present'),
(14, NULL, 2, '2026-04-12 23:08:26', '2026-04-12', '11:00:00', NULL, 'Present');

-- --------------------------------------------------------

--
-- Table structure for table `audit_trail`
--

CREATE TABLE `audit_trail` (
  `audit_id` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `role` varchar(20) NOT NULL,
  `action` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_trail`
--

INSERT INTO `audit_trail` (`audit_id`, `id`, `role`, `action`, `status`, `timestamp`) VALUES
(1, 1, 'admin', 'Logged in', 'success', '2026-04-10 08:00:00'),
(2, 1, 'admin', 'Added member Jose Cruz', 'success', '2026-04-10 08:05:00'),
(3, 1, 'cashier', 'Processed transaction', 'success', '2026-04-10 08:30:00'),
(4, 2, 'cashier', 'Logged in', 'success', '2026-04-10 09:00:00'),
(5, 1, 'trainer', 'Updated session type', 'success', '2026-04-11 07:30:00'),
(6, 1, 'member', 'Logged in', 'success', '2026-04-12 08:00:00'),
(7, 2, 'cashier', 'LOGIN', 'success', '2026-04-12 23:26:55'),
(8, 2, 'cashier', 'NAVIGATE TO - Payments', 'SUCCESS', '2026-04-12 23:26:59'),
(9, 2, 'cashier', 'ADD WALKIN - warren', 'SUCCESS', '2026-04-12 23:27:16'),
(10, 2, 'cashier', 'CHECKOUT - warren (OR: OR-0007)', 'SUCCESS', '2026-04-12 23:27:33'),
(11, 2, 'cashier', 'NAVIGATE TO - Inventory', 'SUCCESS', '2026-04-12 23:27:50'),
(12, 2, 'cashier', 'NAVIGATE TO - Membership', 'SUCCESS', '2026-04-12 23:27:55'),
(13, 2, 'cashier', 'NAVIGATE TO - RFID Management', 'SUCCESS', '2026-04-12 23:27:58'),
(14, 2, 'cashier', 'RFID MANAGEMENT PAGE - Accessed', 'SUCCESS', '2026-04-12 23:27:59'),
(15, 2, 'cashier', 'RFID MANAGEMENT PAGE - Accessed', 'SUCCESS', '2026-04-12 23:27:59'),
(16, 2, 'cashier', 'FETCH RFID DATA - Success', 'SUCCESS', '2026-04-12 23:27:59'),
(17, 2, 'cashier', 'FETCH RFID DATA - Success', 'SUCCESS', '2026-04-12 23:27:59'),
(18, 2, 'cashier', 'NAVIGATE TO - Attendance', 'SUCCESS', '2026-04-12 23:28:01'),
(19, 2, 'cashier', 'NAVIGATE TO - Reports Generation', 'SUCCESS', '2026-04-12 23:28:05'),
(20, 2, 'cashier', 'NAVIGATE TO - Profile & Settings', 'SUCCESS', '2026-04-12 23:28:08'),
(21, 2, 'cashier', 'PROFILE PAGE - Accessed', 'SUCCESS', '2026-04-12 23:28:08'),
(22, 2, 'cashier', 'PROFILE PAGE - Accessed', 'SUCCESS', '2026-04-12 23:28:08'),
(23, 2, 'cashier', 'FETCH PROFILE - Carlo Reyes', 'SUCCESS', '2026-04-12 23:28:08'),
(24, 2, 'cashier', 'FETCH PROFILE - Carlo Reyes', 'SUCCESS', '2026-04-12 23:28:08'),
(25, 2, 'cashier', 'NAVIGATE TO - Dashboard', 'SUCCESS', '2026-04-12 23:28:12'),
(26, 2, 'cashier', 'NAVIGATE TO - Dashboard', 'SUCCESS', '2026-04-12 23:28:25'),
(27, 2, 'cashier', 'NAVIGATE TO - Dashboard', 'SUCCESS', '2026-04-12 23:28:28'),
(28, 2, 'cashier', 'NAVIGATE TO - Dashboard', 'SUCCESS', '2026-04-12 23:28:30'),
(29, 2, 'cashier', 'RFID MANAGEMENT PAGE - Accessed', 'SUCCESS', '2026-04-12 23:28:31'),
(30, 2, 'cashier', 'RFID MANAGEMENT PAGE - Accessed', 'SUCCESS', '2026-04-12 23:28:31'),
(31, 2, 'cashier', 'FETCH RFID DATA - Success', 'SUCCESS', '2026-04-12 23:28:31'),
(32, 2, 'cashier', 'FETCH RFID DATA - Success', 'SUCCESS', '2026-04-12 23:28:31'),
(33, 2, 'cashier', 'NAVIGATE TO - Dashboard', 'SUCCESS', '2026-04-12 23:28:32'),
(34, 2, 'cashier', 'LOGOUT FROM SIDEBAR - Carlo Reyes', 'SUCCESS', '2026-04-12 23:28:38');

-- --------------------------------------------------------

--
-- Table structure for table `capacity`
--

CREATE TABLE `capacity` (
  `Capacity_id` int(11) NOT NULL,
  `Capacity_number` int(11) NOT NULL DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `capacity`
--

INSERT INTO `capacity` (`Capacity_id`, `Capacity_number`) VALUES
(1, 56);

-- --------------------------------------------------------

--
-- Table structure for table `cashiers_login`
--

CREATE TABLE `cashiers_login` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cashiers_login`
--

INSERT INTO `cashiers_login` (`id`, `name`, `phone`, `email`, `password`, `status`, `created_at`) VALUES
(1, 'Anna Cashier', '09222222221', 'anna@melgym.com', 'cashier123', 'active', NULL),
(2, 'Carlo Reyes', '09222222222', 'carlo@melgym.com', 'cashier456', 'active', NULL),
(3, 'Warren', '09567380216', 'warrenvince982@gmail.com', '123456', 'Active', '2026-04-12 22:57:42');

-- --------------------------------------------------------

--
-- Table structure for table `classes_table`
--

CREATE TABLE `classes_table` (
  `classes_id` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `classes_type` varchar(100) NOT NULL,
  `classes_date` date NOT NULL,
  `classes_timein` time NOT NULL,
  `classes_timout` time DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes_table`
--

INSERT INTO `classes_table` (`classes_id`, `id`, `classes_type`, `classes_date`, `classes_timein`, `classes_timout`, `status`, `created_at`) VALUES
(1, 1, 'Yoga', '2026-04-15', '08:00:00', '09:00:00', 'pending', '2026-04-12 23:05:04'),
(2, 2, 'Zumba', '2026-04-15', '09:00:00', '10:00:00', 'pending', '2026-04-12 23:05:04'),
(3, 3, 'Boxing', '2026-04-16', '07:00:00', '08:00:00', 'pending', '2026-04-12 23:05:04'),
(4, 4, 'Pilates', '2026-04-16', '10:00:00', '11:00:00', 'pending', '2026-04-12 23:05:04'),
(5, 5, 'Cardio', '2026-04-17', '06:00:00', '07:00:00', 'approved', '2026-04-12 23:05:04');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `member_name` varchar(100) NOT NULL,
  `rfid` varchar(50) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `membership_type` varchar(50) DEFAULT NULL,
  `membership_start` date DEFAULT NULL,
  `membership_end` date DEFAULT NULL,
  `membership_time` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `member_name`, `rfid`, `contact_number`, `email`, `address`, `password`, `membership_type`, `membership_start`, `membership_end`, `membership_time`, `created_at`, `status`) VALUES
(1, 'Jose Cruz', 'RFID001', '09444444441', 'jose@email.com', 'Masbate City', 'member123', 'Monthly', '2026-03-01', '2026-04-01', '08:00:00', '2026-04-12 11:35:15', 'active'),
(2, 'Ana Reyes', 'RFID002', '09444444442', 'ana@email.com', 'Masbate City', 'member456', 'Weekly', '2026-04-07', '2026-04-14', '09:00:00', '2026-04-12 11:35:15', 'active'),
(3, 'Pedro Bautista', 'RFID003', '09444444443', 'pedro@email.com', 'Masbate City', 'member789', 'Monthly', '2026-03-15', '2026-04-15', '07:00:00', '2026-04-12 11:35:15', 'active'),
(4, 'Rosa Lim', 'RFID004', '09444444444', 'rosa@email.com', 'Masbate City', 'member000', 'Weekly', '2026-04-01', '2026-04-08', '10:00:00', '2026-04-12 11:35:15', 'inactive'),
(5, 'Diego Ramos', 'RFID005', '09444444445', 'diego@email.com', 'Masbate City', 'member111', 'Monthly', '2026-02-01', '2026-03-01', '06:00:00', '2026-04-12 11:35:15', 'inactive');

-- --------------------------------------------------------

--
-- Table structure for table `membership_plan`
--

CREATE TABLE `membership_plan` (
  `membershipplan_id` int(11) NOT NULL,
  `membershipplanname` varchar(100) NOT NULL,
  `membershipplanbenefits` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_plan`
--

INSERT INTO `membership_plan` (`membershipplan_id`, `membershipplanname`, `membershipplanbenefits`) VALUES
(1, 'Weekly', 'Access to gym facilities'),
(2, 'Weekly', 'Use of basic equipment'),
(3, 'Weekly', 'Locker room access'),
(4, 'Monthly', 'Access to gym facilities'),
(5, 'Monthly', 'Use of all equipment'),
(6, 'Monthly', 'Locker room access'),
(7, 'Monthly', 'Free fitness assessment'),
(8, 'Monthly', '1 free trainer session');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_name`, `price`, `stock_quantity`) VALUES
(1, 'Whey Protein', 500.00, 65),
(2, 'Energy Drink', 60.00, 59),
(3, 'Water Bottle', 20.00, 45);

-- --------------------------------------------------------

--
-- Table structure for table `sessions_table`
--

CREATE TABLE `sessions_table` (
  `session_id` int(11) NOT NULL,
  `trainer_name` varchar(100) DEFAULT NULL,
  `trainer_id` int(11) DEFAULT NULL,
  `client_name` varchar(100) NOT NULL,
  `client_contact` varchar(20) DEFAULT NULL,
  `client_email` varchar(100) DEFAULT NULL,
  `session_type` varchar(50) DEFAULT NULL,
  `session_date` date NOT NULL,
  `session_timein` time NOT NULL,
  `session_timeout` time DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions_table`
--

INSERT INTO `sessions_table` (`session_id`, `trainer_name`, `trainer_id`, `client_name`, `client_contact`, `client_email`, `session_type`, `session_date`, `session_timein`, `session_timeout`, `status`, `notes`, `created_at`) VALUES
(1, 'John Trainer', NULL, 'Jose Cruz', '09444444441', 'jose@email.com', 'personal', '2026-04-15', '08:00:00', '09:00:00', 'pending', NULL, '2026-04-12 23:13:30'),
(2, 'Jane Trainer', NULL, 'Ana Reyes', '09444444442', 'ana@email.com', 'class', '2026-04-15', '09:00:00', '10:00:00', 'pending', NULL, '2026-04-12 23:13:30'),
(3, NULL, NULL, 'Pedro Bautista', '09444444443', 'pedro@email.com', 'personal', '2026-04-16', '07:00:00', '08:00:00', 'pending', NULL, '2026-04-12 23:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `trainers_table`
--

CREATE TABLE `trainers_table` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `session_type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trainers_table`
--

INSERT INTO `trainers_table` (`id`, `name`, `contact_number`, `email`, `password`, `session_type`, `status`, `created_at`) VALUES
(1, 'Rico Trainer', '09333333331', 'rico@melgym.com', 'trainer123', 'Personal', 'active', NULL),
(2, 'Liza Fitness', '09333333332', 'liza@melgym.com', 'trainer456', 'Group', 'active', NULL),
(3, 'Mark Strength', '09333333333', 'mark@melgym.com', 'trainer789', 'Personal', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `or_number` varchar(20) DEFAULT NULL,
  `member_name` varchar(100) NOT NULL,
  `product` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'paid',
  `transaction_datetime` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `or_number`, `member_name`, `product`, `quantity`, `total_amount`, `status`, `transaction_datetime`) VALUES
(1, 'OR-0001', 'Jose Cruz', 'Monthly Membership', 1, 800.00, 'paid', '2026-03-01 08:00:00'),
(2, 'OR-0002', 'Ana Reyes', 'Weekly Membership', 1, 250.00, 'paid', '2026-04-07 09:00:00'),
(3, 'OR-0003', 'Pedro Bautista', 'Monthly Membership', 1, 800.00, 'paid', '2026-03-15 07:00:00'),
(4, 'OR-0004', 'Juan Dela Cruz', 'Walk-in Fee', 1, 50.00, 'paid', '2026-04-10 10:00:00'),
(5, 'OR-0005', 'Jose Cruz', 'Protein Shake', 2, 150.00, 'paid', '2026-04-10 08:30:00'),
(6, 'OR-0005', 'Jose Cruz', 'Gym Gloves', 1, 200.00, 'paid', '2026-04-10 08:30:00'),
(7, 'OR-0007', 'warren', 'Walk-in: warren', 1, 100.00, 'paid', '2026-04-12 23:27:33');

-- --------------------------------------------------------

--
-- Table structure for table `walk_in`
--

CREATE TABLE `walk_in` (
  `walkin_id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `RFID_number` varchar(50) NOT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `walk_in`
--

INSERT INTO `walk_in` (`walkin_id`, `fullname`, `RFID_number`, `date`) VALUES
(1, 'Juan Dela Cruz', 'WRFID001', '2026-04-10'),
(2, 'Maria Clara', 'WRFID002', '2026-04-10'),
(3, 'Luis Santos', 'WRFID003', '2026-04-11'),
(4, 'Elena Torres', 'WRFID004', '2026-04-11'),
(5, 'Ramon Garcia', 'WRFID005', '2026-04-12'),
(6, 'warren', '', '2026-04-12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_table`
--
ALTER TABLE `admin_table`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `uq_admin_contact` (`contact`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attendance_member` (`member_id`),
  ADD KEY `idx_attendance_walkin` (`walkin_id`),
  ADD KEY `idx_attendance_date` (`date`);

--
-- Indexes for table `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `idx_audit_role` (`role`),
  ADD KEY `idx_audit_timestamp` (`timestamp`);

--
-- Indexes for table `capacity`
--
ALTER TABLE `capacity`
  ADD PRIMARY KEY (`Capacity_id`);

--
-- Indexes for table `cashiers_login`
--
ALTER TABLE `cashiers_login`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `classes_table`
--
ALTER TABLE `classes_table`
  ADD PRIMARY KEY (`classes_id`),
  ADD KEY `id` (`id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_member_rfid` (`rfid`);

--
-- Indexes for table `membership_plan`
--
ALTER TABLE `membership_plan`
  ADD PRIMARY KEY (`membershipplan_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions_table`
--
ALTER TABLE `sessions_table`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `trainers_table`
--
ALTER TABLE `trainers_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transaction_or` (`or_number`),
  ADD KEY `idx_transaction_member` (`member_name`);

--
-- Indexes for table `walk_in`
--
ALTER TABLE `walk_in`
  ADD PRIMARY KEY (`walkin_id`),
  ADD UNIQUE KEY `uq_walkin_rfid` (`RFID_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_table`
--
ALTER TABLE `admin_table`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `audit_trail`
--
ALTER TABLE `audit_trail`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `cashiers_login`
--
ALTER TABLE `cashiers_login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `classes_table`
--
ALTER TABLE `classes_table`
  MODIFY `classes_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `membership_plan`
--
ALTER TABLE `membership_plan`
  MODIFY `membershipplan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sessions_table`
--
ALTER TABLE `sessions_table`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `trainers_table`
--
ALTER TABLE `trainers_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `walk_in`
--
ALTER TABLE `walk_in`
  MODIFY `walkin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `fk_attendance_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_walkin` FOREIGN KEY (`walkin_id`) REFERENCES `walk_in` (`walkin_id`) ON DELETE SET NULL;

--
-- Constraints for table `classes_table`
--
ALTER TABLE `classes_table`
  ADD CONSTRAINT `classes_table_ibfk_1` FOREIGN KEY (`id`) REFERENCES `members` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
