<?php

namespace App\Models;

use Exception;
use App\Exceptions\BadRequestException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ConflictException;
use App\Models\Asset;
use App\Models\User;
use App\Models\Portfolio;
use App\Models\Transaction;

class Trade
{
    public static function buy(int $userId, int $assetId, float $quantity): array
    {
        if ($assetId <= 0 || $quantity <= 0) {
            throw new BadRequestException('asset_id y quantity deben ser valores válidos.');
        }

        $asset = Asset::findById($assetId);
        if (!$asset) {
            throw new NotFoundException('Activo no encontrado.');
        }

        $user = User::findById($userId);
        if (!$user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        $totalCost = round((float)$asset['current_price'] * $quantity, 2);
        if ((float)$user['balance'] < $totalCost) {
            throw new ConflictException('No tienes suficiente balance para realizar esta compra.');
        }

        $db = DB::getConnection();
        $db->beginTransaction();

        try {
            $stmt = $db->prepare('UPDATE users SET balance = balance - :total WHERE id = :id');
            $stmt->execute([':total' => $totalCost, ':id' => $userId]);

            Portfolio::addQuantity($userId, $assetId, $quantity);
            Transaction::record($userId, $assetId, 'buy', $quantity, (float)$asset['current_price'], $totalCost);

            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

        return [
            'message' => 'Compra registrada correctamente.',
            'asset' => $asset['name'],
            'quantity' => $quantity,
            'total_cost' => $totalCost
        ];
    }

    public static function sell(int $userId, int $assetId, float $quantity): array
    {
        if ($assetId <= 0 || $quantity <= 0) {
            throw new BadRequestException('asset_id y quantity deben ser valores válidos.');
        }

        $asset = Asset::findById($assetId);
        if (!$asset) {
            throw new NotFoundException('Activo no encontrado.');
        }

        $holding = Portfolio::getHolding($userId, $assetId);
        if (!$holding || (float)$holding['quantity'] < $quantity) {
            throw new ConflictException('No tienes suficientes unidades del activo para vender.');
        }

        $totalReturn = round((float)$asset['current_price'] * $quantity, 2);
        $db = DB::getConnection();
        $db->beginTransaction();

        try {
            Portfolio::reduceQuantity($userId, $assetId, $quantity);
            $stmt = $db->prepare('UPDATE users SET balance = balance + :total WHERE id = :id');
            $stmt->execute([':total' => $totalReturn, ':id' => $userId]);

            Transaction::record($userId, $assetId, 'sell', $quantity, (float)$asset['current_price'], $totalReturn);
            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

        return [
            'message' => 'Venta registrada correctamente.',
            'asset' => $asset['name'],
            'quantity' => $quantity,
            'total_return' => $totalReturn
        ];
    }
}
