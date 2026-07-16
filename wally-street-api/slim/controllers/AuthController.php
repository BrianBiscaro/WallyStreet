<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Controllers\BaseController;


class AuthController extends BaseController
{
    /**
     * POST /login: Recibe email/password. Genera un token aleatorio con expired a 5 minutos.
     */
    public function login(Request $request, Response $response): Response
    {
        $body = $this->getRequestBody($request);
        $data = User::authenticate(trim($body['email'] ?? ''), $body['password'] ?? '');
        return $this->json($response, $data);
    }


    /**
     * POST /logout: Borra el token y el expired correspondiente de la tabla de usuario.
     */
    public function logout(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('user');
        return $this->json($response, User::clearToken((int)$authUser['id']));
    }
}
