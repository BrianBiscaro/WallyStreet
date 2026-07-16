<?php

namespace App\Handlers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Throwable;
use App\Exceptions\ApiException;
use PDOException;
use Slim\Exception\HttpNotFoundException;

class ApiErrorHandler
{
    private App $app;

    public function __construct(App $app)
    {
        $this->app = $app;
    }

    public function __invoke(
        Request $request,
        Throwable $exception,
        bool $displayErrorDetails,
        bool $logErrors,
        bool $logErrorDetails
    ): Response {

        $statusCode = 500;
        $message = 'Ha ocurrido un error interno en el servidor';


        if ($exception instanceof ApiException) {
            $statusCode = $exception->getCode();
            $message = $exception->getMessage();
        } else if ($exception instanceof PDOException) {
            $statusCode = 500;
            $message = 'Ha ocurrido un error al procesar los datos en el servidor.';

            if ($displayErrorDetails) {
                $payload['db_error'] = $exception->getMessage();
            }
        } else if ($exception instanceof HttpNotFoundException) {
            $statusCode = 404;
            $message = 'La ruta solicitada no existe.';
        }

        $payload = ['message' => $message];

        if ($displayErrorDetails) {
            $payload['exception'] = get_class($exception);
            $payload['file'] = $exception->getFile();
            $payload['line'] = $exception->getLine();
            $payload['trace'] = $exception->getTraceAsString();
        }

        $response = $this->app->getResponseFactory()->createResponse($statusCode);
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
