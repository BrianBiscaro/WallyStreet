<?php

namespace App\Models;

use App\Exceptions\NotFoundException;
use App\Exceptions\ConflictException;

class Portfolio
{
    public static function summaryByUser(int $userId): array
    {
        $db = DB::getConnection();
        $stmt = $db->prepare(
            'SELECT p.quantity, a.id 
            AS asset_id, a.name, a.current_price 
            FROM portfolio p 
            JOIN assets a 
            ON a.id = p.asset_id 
            WHERE p.user_id = :user_id'
        );
        $stmt->execute([':user_id' => $userId]);

        $holdings = [];
        $totalValue = 0.0;

        foreach ($stmt->fetchAll() as $row) {
            $value = (float)$row['quantity'] * (float)$row['current_price'];
            $holdings[] = [
                'asset_id' => (int)$row['asset_id'],
                'asset_name' => $row['name'],
                'quantity' => (float)$row['quantity'],
                'current_price' => (float)$row['current_price'],
                'value' => $value,
            ];
            $totalValue += $value;
        }

        return ['total_value' => $totalValue, 'holdings' => $holdings];
    }

    public static function getHolding(int $userId, int $assetId): ?array
    {
        $db = DB::getConnection();
        $stmt = $db->prepare(
            'SELECT id, quantity 
            FROM portfolio 
            WHERE user_id = :user_id AND asset_id = :asset_id'
        );
        $stmt->execute([':user_id' => $userId, ':asset_id' => $assetId]);
        $holding = $stmt->fetch();

        return $holding ?: null;
    }

    public static function deleteAsset(int $userId, int $assetId): array
    {
        $holding = self::getHolding($userId, $assetId);
        if (!$holding) {
            throw new NotFoundException('No tienes ese activo en tu portfolio.');
        }

        if ((float)$holding['quantity'] != 0) {
            throw new ConflictException('No puedes eliminar un activo que aún tienes en tu portfolio. Vende tus unidades primero.');
        }

        $db = DB::getConnection();
        $stmt = $db->prepare(
            'DELETE FROM portfolio 
            WHERE user_id = :user_id 
            AND asset_id = :asset_id'
        );
        $stmt->execute([':user_id' => $userId, ':asset_id' => $assetId]);

        return ['message' => 'Activo eliminado del portfolio.'];
    }

    public static function addQuantity(int $userId, int $assetId, float $quantity): void
    {
        $db = DB::getConnection();

        $sql = 'INSERT INTO portfolio (user_id, asset_id, quantity) 
                VALUES (:user_id, :asset_id, :quantity) 
                ON DUPLICATE KEY UPDATE quantity = quantity + :quantity_update';

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId,
            ':asset_id' => $assetId,
            ':quantity' => $quantity,
            ':quantity_update' => $quantity
        ]);
    }

    public static function reduceQuantity(int $userId, int $assetId, float $quantity): void
    {
        $db = DB::getConnection();
        $stmt = $db->prepare('UPDATE portfolio SET quantity = quantity - :quantity WHERE user_id = :user_id AND asset_id = :asset_id');
        $stmt->execute([':quantity' => $quantity, ':user_id' => $userId, ':asset_id' => $assetId]);
    }
}
