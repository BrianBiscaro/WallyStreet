<?php

namespace App\Models;

use PDO;

class DB
{
    private static $connection;

    public static function getConnection(): PDO
    {

        if (!self::$connection) {
            $host = getenv('DB_HOST') ?: 'db';
            $dbname = getenv('DB_NAME') ?: 'seminariophp';
            $user = getenv('DB_USER') ?: 'seminariophp';
            $pass = getenv('DB_PASS') ?: 'seminariophp';

            self::$connection = new PDO(
                "mysql:host=$host;dbname=$dbname",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        }
        return self::$connection;
    }
}
