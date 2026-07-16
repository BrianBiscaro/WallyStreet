<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Models\Asset;
use App\Models\Trade;
use App\Controllers\BaseController;

class AssetController extends BaseController
{
    /**
     * GET /assets: Lista activos (Oro, Plata, YPF, etc.) con su precio actual de acuerdo a los parámetros de búsqueda. Si no hay parámetros debe devolver todos los registros. No requiere login.
     * ○ Filtros opcionales:
     * ■ ?type={name}
     * ■ min_price: Precio mínimo (ej: ?min_price=50)
     * ■ max_price: Precio máximo (ej: ?max_price=500)
     */
    public function getAssets(Request $request, Response $response): Response
    {

        return $this->json($response, ['assets' => Asset::list($request->getQueryParams())]);
    }


    /**
     * PUT /assets: (Solo Admin) Dispara la actualización aleatoria de los precios de todos los activos.
     */

    public function refreshPrices(Request $request, Response $response): Response
    {
        return $this->json($response, ['updated_assets' => Asset::refreshPrices()]);
    }

    /**
     * GET /assets/{asset_id}/history/{quantity}: Muestra los últimos cambios de precio de un activo específico (máximo 5 últimos movimientos).
     * ○ No requiere login
     * ○ Usar la tabla transactions sin revelar el usuario que hizo la transacción
     */
    public function getHistory(Request $request, Response $response, array $args): Response
    {
        return $this->json($response, ['history' => Asset::history((int)$args['asset_id'], (int)$args['quantity'])]);
    }
}
