<?php
namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use App\Exceptions\UnauthorizedException;

class AdminMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $user = $request->getAttribute('user');
        $isAdmin = false;

        if (is_array($user)) {
            $isAdmin = !empty($user['is_admin']) || (isset($user['role']) && $user['role'] === 'admin');
        }

        if (!$isAdmin) {
            throw new UnauthorizedException('Acceso denegado. Se requieren privilegios de administrador');
        }

        return $handler->handle($request);
    }
}