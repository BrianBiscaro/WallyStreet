<?php

namespace App\Models;

class Transaction
{
    public static function record(int $userId, int $assetId, string $type, float $quantity, float $price, float $total): int
    {
        $db = DB::getConnection();
        $stmt = $db->prepare('INSERT INTO transactions (user_id, asset_id, transaction_type, quantity, price_per_unit, total_amount) VALUES (:user_id, :asset_id, :type, :quantity, :price, :total)');
        $stmt->execute([
            ':user_id' => $userId,
            ':asset_id' => $assetId,
            ':type' => $type,
            ':quantity' => $quantity,
            ':price' => $price,
            ':total' => $total
        ]);
        return (int)$db->lastInsertId();
    }

    public static function findByUser(int $userId, array $filters = []): array
    {
        $sql = 'SELECT t.id, t.transaction_type, t.quantity, t.price_per_unit, t.total_amount, t.transaction_date, a.name 
         AS asset_name 
         FROM transactions t 
         JOIN assets a ON a.id = t.asset_id 
         WHERE t.user_id = :user_id';

        $params = [':user_id' => $userId];

        if (!empty($filters['type']) && in_array(strtolower($filters['type']), ['buy', 'sell'], true)) {
            $sql .= ' AND t.transaction_type = :transaction_type';
            $params[':transaction_type'] = strtolower($filters['type']);
        }

        if (!empty($filters['asset_id'])) {
            $sql .= ' AND t.asset_id = :asset_id';
            $params[':asset_id'] = (int)$filters['asset_id'];
        }

        $sql .= ' ORDER BY t.transaction_date DESC';
        $db = DB::getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        return array_map(static function ($transaction) {
            return [
                'id' => (int)$transaction['id'],
                'asset_name' => $transaction['asset_name'],
                'type' => $transaction['transaction_type'],
                'quantity' => (float)$transaction['quantity'],
                'price_per_unit' => (float)$transaction['price_per_unit'],
                'total_amount' => (float)$transaction['total_amount'],
                'transaction_date' => $transaction['transaction_date'],
            ];
        }, $stmt->fetchAll());
    }

    public static function historyByAsset(int $assetId, int $limit = 5): array
    {
        $db = DB::getConnection();

        $stmt = $db->prepare(
            'SELECT price_per_unit, transaction_date 
            FROM transactions 
            WHERE asset_id = :asset_id 
            ORDER BY transaction_date DESC 
            LIMIT :limit'
        );

        $stmt->bindValue(':asset_id', $assetId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return array_map(static function ($row) {
            return [
                'price_per_unit' => (float)$row['price_per_unit'],
                'transaction_date' => $row['transaction_date'],
            ];
        }, $stmt->fetchAll());
    }
}
