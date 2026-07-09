<?php

namespace App\Models;

use App\Exceptions\BadRequestException;
use App\Exceptions\NotFoundException;
use App\Utils\MarketMath;

class Asset
{
    public static function list(array $filters = []): array
    {
        $conditions = [];
        $params = [];

        if (!empty($filters['type'])) {
            $conditions[] = 'name LIKE :type';
            $params[':type'] = '%' . $filters['type'] . '%';
        }

        if (isset($filters['min_price']) && $filters['min_price'] !== '') {
            if (!is_numeric($filters['min_price'])) {
                throw new BadRequestException('El parámetro min_price debe ser numérico.');
            }
            $conditions[] = 'current_price >= :min_price';
            $params[':min_price'] = (float)$filters['min_price'];
        }


        if (isset($filters['max_price']) && $filters['max_price'] !== '') {
            if (!is_numeric($filters['max_price'])) {
                throw new BadRequestException('El parámetro max_price debe ser numérico.');
            }
            $conditions[] = 'current_price <= :max_price';
            $params[':max_price'] = (float)$filters['max_price'];
        }

        $sql = 'SELECT id, name, current_price, last_update FROM assets';
        if ($conditions) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY name';

        $db = DB::getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        return array_map(static function ($item) {
            return [
                'id' => (int)$item['id'],
                'name' => $item['name'],
                'current_price' => (float)$item['current_price'],
                'last_update' => $item['last_update'],
            ];
        }, $stmt->fetchAll());
    }

    public static function findById(int $id): ?array
    {
        $db = DB::getConnection();
        $stmt = $db->prepare('SELECT id, name, current_price FROM assets WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $asset = $stmt->fetch();
        return $asset ?: null;
    }

    public static function refreshPrices(): array
    {
        $db = DB::getConnection();
        $assets = $db->query('SELECT id, current_price, last_update FROM assets')->fetchAll();
        $updated = [];

        $db->beginTransaction();
        $update = $db->prepare('UPDATE assets SET current_price = :price WHERE id = :id');

        foreach ($assets as $asset) {
            $lastUpdateTimestamp = strtotime($asset['last_update']);
            $newPrice = MarketMath::variarPrecioPorTiempo((float)$asset['current_price'], $lastUpdateTimestamp);
            if ($newPrice <= 0) {
                $newPrice = 0.01;
            }
            $update->execute([':price' => round($newPrice, 4), ':id' => $asset['id']]);
            $updated[] = ['id' => (int)$asset['id'], 'current_price' => round($newPrice, 4)];
        }

        $db->commit();
        return $updated;
    }

    public static function history(int $assetId, int $limit): array
    {
        if ($limit < 1 || $limit > 5) {
            throw new BadRequestException('La cantidad solicitada debe estar entre 1 y 5.');
        }

        $asset = self::findById($assetId);

        if (!$asset) {
            throw new NotFoundException('El activo solicitado no existe.');
        }

        $history = Transaction::historyByAsset($assetId, $limit);

        if (empty($history)) {
            $basePrice = (float)$asset['current_price'];
            $history = [];

            for ($i = 0; $i < $limit; $i++) {
                $variation = ($limit - $i) * 0.005;
                $price = round($basePrice * (1 + $variation), 4);
                $history[] = [
                    'price_per_unit' => $price,
                    'transaction_date' => date('Y-m-d H:i:s', strtotime('-' . ($limit - $i) . ' hours')),
                ];
            }
        }

        return $history;
    }
}