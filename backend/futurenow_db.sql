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
  `image_data` longblob DEFAULT NULL,
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
  `brain_type` enum('ASSISTANT','CHATGPT') DEFAULT NULL,
  `caractere` varchar(255) DEFAULT NULL,
  `color_background` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `connections` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `fonction` varchar(255) DEFAULT NULL,
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
  `render_mode` enum('KIOSK','WEB','WIDGET') DEFAULT NULL,
  `show_cards` bit(1) NOT NULL,
  `voice` varchar(255) DEFAULT NULL,
  `watermark` varchar(255) DEFAULT NULL,
  `weblink` varchar(255) DEFAULT NULL,
  `welcome` bit(1) NOT NULL,
  `welcome_message` bit(1) NOT NULL,
  `widget_link` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `assistant_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- -------------------------------------------------------

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
  `user_role` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Index pour la table `users`
--
--
-- AUTO_INCREMENT pour les tables déchargées
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);
--
-- AUTO_INCREMENT pour la table `card`
--
ALTER TABLE `card`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT;

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
COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
