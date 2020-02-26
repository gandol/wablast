CREATE TABLE `nomor_tujuan` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nomor` varchar(255) UNIQUE,
  `send` bool DEFAULT false
);
