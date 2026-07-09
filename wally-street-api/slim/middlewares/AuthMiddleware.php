<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use App\Models\User;
use App\Exceptions\UnauthorizedException;


class AuthMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $header = $request->getHeaderLine('Authorization');

        if (!preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            throw new UnauthorizedException('Token de autenticación no proporcionado o formato incorrecto.');
        }

        $token = trim($matches[1]);
        $user = User::findByToken($token);
        if (!$user) {
            throw new UnauthorizedException('Token de autenticación inválido.');
        }

        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        User::setToken((int)$user['id'], $token, $expiresAt);

        $request = $request->withAttribute('user', $user);
        return $handler->handle($request);
    }
}
