-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 17 avr. 2025 à 10:21
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `futurenow_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `card`
--

CREATE TABLE `card` (
  `id` bigint(20) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `prompt` varchar(255) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) NOT NULL,
  `brain_type` tinyint(4) DEFAULT NULL,
  `caractere` varchar(255) DEFAULT NULL,
  `color_background` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `connections` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `google_voice_api_key` varchar(255) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL,
  `kiosk_code` varchar(255) DEFAULT NULL,
  `kiosk_sdk` varchar(255) DEFAULT NULL,
  `knowledges` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `max_response_length` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `native_language` varchar(255) DEFAULT NULL,
  `preview_image` varchar(255) DEFAULT NULL,
  `prompt` text DEFAULT NULL,
  `render_mode` tinyint(4) DEFAULT NULL,
  `show_cards` bit(1) NOT NULL,
  `fonction` varchar(255) DEFAULT NULL,         
  `voice` varchar(255) DEFAULT NULL,
  `watermark` varchar(255) DEFAULT NULL,
  `weblink` varchar(255) DEFAULT NULL,
  `welcome` bit(1) NOT NULL,
  `welcome_message` bit(1) NOT NULL,
  `widget_link` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Déchargement des données de la table `projects`
--

INSERT INTO `projects` 
(`id`, `brain_type`, `caractere`, `color_background`, `company_name`, `connections`, `description`, `google_voice_api_key`, `instructions`, `kiosk_code`, `kiosk_sdk`, `knowledges`, `logo`, `max_response_length`, `name`, `native_language`, `preview_image`, `prompt`, `render_mode`, `show_cards`, `fonction`, `voice`, `watermark`, `weblink`, `welcome`, `welcome_message`, `widget_link`, `user_id`) 
VALUES
(1, 0, NULL, '#0a1f44', 'Default Company', NULL, 'Default project created on signup', NULL, 'Feel free to ask anything!', NULL, NULL, NULL, 'assets/doctor.png', 0, 'My First AI', 'English', NULL, 'You are a male virtual assistant named My First AI. ...', NULL, b'0', 'Virtual Assistant', 'nova', NULL, NULL, b'0', b'0', NULL, 2),
(2, 0, NULL, '#f4a7b9', 'future now', NULL, 'sales agent', NULL, 'sales agent', NULL, NULL, NULL, 'assets/madame.png', 0, 'alexa', '', NULL, 'You are a female sales agent named alexa. ...', NULL, b'0', 'Sales Agent', 'nova', NULL, NULL, b'0', b'0', NULL, 2);

-- --------------------------------------------------------

--
-- Structure de la table `system_api_key`
--

CREATE TABLE `system_api_key` (
  `id` bigint(20) NOT NULL,
  `google_voice_key` varchar(255) DEFAULT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `open_ai_key` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `code_postal` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `pays` varchar(255) DEFAULT NULL,
  `phone_number` int(11) DEFAULT NULL,
  `user_role` tinyint(4) DEFAULT NULL,
  `system_api_key_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `address`, `code_postal`, `email`, `first_name`, `last_name`, `password`, `pays`, `phone_number`, `user_role`, `system_api_key_id`) VALUES
(1, NULL, NULL, 'admin@test.com', 'Admin', 'Account', '$2a$10$zV0RfCt2MZp/hkq5id6LB.tP8zljuyeAgzFDL0B5qkSB4Yutmz6ce', NULL, NULL, 0, NULL),
(2, NULL, NULL, 'mahdi@gmail.com', 'mahdi', 'zgolli', '$2a$10$3cfepsma9giufjK1R2f9QuK0AggZSeStkkwhZDWOw/OZzs/hnUHTS', NULL, NULL, 2, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKpqmuclfb4lxjbfurbmvktv7df` (`project_id`);

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKhswfwa3ga88vxv1pmboss6jhm` (`user_id`);

--
-- Index pour la table `system_api_key`
--
ALTER TABLE `system_api_key`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_rj8dfk9wynravvieunllm9chb` (`system_api_key_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `card`
--
ALTER TABLE `card`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `system_api_key`
--
ALTER TABLE `system_api_key`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `FKpqmuclfb4lxjbfurbmvktv7df` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Contraintes pour la table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `FKhswfwa3ga88vxv1pmboss6jhm` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FKsxcbh57m2io5ew8ohbqkfi1wb` FOREIGN KEY (`system_api_key_id`) REFERENCES `system_api_key` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
