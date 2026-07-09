<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Trade;
use App\Controllers\BaseController;

class TradeController extends BaseController
{
    /**
     * POST /trade/buy: Comprar un activo.
     * ○ Requisito: El usuario debe estar logueado.
     * ○ Cuerpo: asset_id, quantity.
     * ○ Validaciones:
     * 1. El usuario debe tener balance >= (current_price * quantity).
     * 2. El asset_id debe existir.
     * ○ Resultado: Resta saldo al usuario, suma unidades en la tabla portfolio y
     * registra en transactions.
     */
    public function buy(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('user');
        $body = $this->getRequestBody($request);
        $data = Trade::buy((int)$authUser['id'], (int)($body['asset_id'] ?? 0), (float)($body['quantity'] ?? 0));

        return $this->json($response, $data);
    }

    /**
     * POST /trade/sell: Vender un activo.
     * ○ Requisito: El usuario debe estar logueado.
     * ○ Cuerpo: asset_id, quantity.
     * ○ Validaciones:
     * 1. El usuario debe poseer en su portfolio una cantidad >= quantity de ese activo.
     * ○ Resultado: Suma saldo al usuario (current_price * quantity), resta unidades del portfolio y registra en transactions.

     */
    public function sell(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('user');
        $body = $this->getRequestBody($request);
        $data = Trade::sell((int)$authUser['id'], (int)($body['asset_id'] ?? 0), (float)($body['quantity'] ?? 0));

        return $this->json($response, $data, 200);
    }
}
