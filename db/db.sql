CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_pic_url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(43) NOT NULL,
  `user_name` varchar(8644) NOT NULL,
  `destination_id` varchar(18) NOT NULL,
  `destination_name` varchar(200) NOT NULL,
  `destination_rating` varchar(305) NOT NULL,
  `destination_category` varchar(305) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(43) NOT NULL,
  `description` varchar(8644) NOT NULL,
  `category` varchar(18) NOT NULL,
  `price` int NOT NULL,
  `rating` decimal(3,1) NOT NULL,
  `image_url` varchar(305) NOT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `maps_url` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=944 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `bookmarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `destination_id` varchar(18) NOT NULL,
  `user_id` varchar(18) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
