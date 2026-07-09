<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Exceptions\BadRequestException;
use App\Exceptions\ConflictException;
use App\Models\Portfolio;
use App\Models\Transaction;
use App\Models\User;
use App\Controllers\BaseController;

class UserController extends BaseController
{
    /**
     * ● POST /users: Registro de nuevo inversor.
     * ○ Validaciones
     * ■ email (@) y password (minúscula, mayúscula, número, especial, 8 caracteres).
     * ■ email debe ser único.
     * ■ name: Solo letras. No puede ser vacío.
     * ○ Acción automática: Al crearse, el usuario recibe el bono de 1000 USD en su
     * campo balance.
     */
    public function register(Request $request, Response $response): Response
    {
        $data = User::register($this->getRequestBody($request));
        return $this->json($response, $data, 201);
    }

    /**
     *  GET /users/{user_id}: Ver perfil, saldo actual y valor total del portfolio.
     * ○ Requiere que user_id sea el usuario logueado o que el usuario logueado sea admin.
     */
    public function getUser(Request $request, Response $response, array $args): Response
    {
        $authUser = $request->getAttribute('user');
        $targetId = (int)$args['user_id'];

        $profile = User::getProfile($targetId, $authUser);

        return $this->json($response, $profile);
    }

    /**
     * PUT /users/{user_id}: Editar un usuario existente. Requiere que user_id sea el usuario logueado. Se deben enviar solo los datos a modificar.
     * ○ Solo se puede modificar el name y/o password
     * ○ Requiere que user_id sea el usuario logueado o que el usuario logueado sea admin.
     */
    public function updateUser(Request $request, Response $response, array $args): Response
    {
        $authUser = $request->getAttribute('user');
        $targetId = (int)$args['user_id'];
        $nuevosDatos = $this->getRequestBody($request);

        $data = User::update($targetId, $authUser, $nuevosDatos);
        return $this->json($response, $data, 200);
    }

    /**
     * GET /users: (Solo admin) Listar inversores para monitoreo. Solo nombre y valor total del portfolio.
     */
    public function listUsers(Request $request, Response $response): Response
    {
        return $this->json($response, ['users' => User::listSummary()], 200);
    }


    /**
     * ● GET /portfolio: Lista los activos que posee el usuario logueado (ej: "Bitcoin: 0.5, YPF: 10"). Debe calcular el valor actual de esa tenencia según los precios de mercado.
     * ○ Requisito: El usuario debe estar logueado
     */

    public function getPortfolio(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('user');
        return $this->json($response, Portfolio::summaryByUser((int)$authUser['id']), 200);
    }

    /**
     * ● DELETE /portfolio/{asset_id}: Eliminar un activo del inventario personal.
     * ○ Requisito: El usuario debe estar logueado.
     * ○ Validación Crítica: Solo se puede borrar el registro si la cantidad es exactamente 0.
     * ○ Lógica de error:
     * ○ Si el usuario tiene 1 de Bitcoin o más, el endpoint devuelve 409 Conflict con el mensaje: "No puedes quitar un activo de tu portfolio si aún tienes unidades. Debes venderlas primero."
     * ○ Si el activo no existe en su portfolio, devuelve 404 Not Found.
     * ● Resultado: Código 200 OK. Se borra el asset indicado de la tabla portfolio
     * del usuario.
     */
    public function deletePortfolioAsset(Request $request, Response $response, array $args): Response
    {
        $authUser = $request->getAttribute('user');
        $result = Portfolio::deleteAsset((int)$authUser['id'], (int)$args['asset_id']);
        return $this->json($response, $result, 200);
    }

    /**
     * ● GET /transactions: Devuelve el historial de movimientos del usuario ordenado por fecha descendente.
     * ○ Filtros opcionales: ?type=buy o ?type=sell y/o ?asset_id=x.
     * ○ Requisito: El usuario debe estar logueado.
     */
    public function getTransactions(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('user');
        return $this->json($response, ['transactions' => Transaction::findByUser((int)$authUser['id'], $request->getQueryParams())], 200);
    }
}
