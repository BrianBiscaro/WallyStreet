<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

abstract class BaseController {

    protected function json(Response $response, $data, int $status = 200): Response {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    protected function getRequestBody(Request $request): array {
        $parsed = $request->getParsedBody();
        if (is_array($parsed) && count($parsed) > 0) {
            return $parsed;
        }

        $body = json_decode((string)$request->getBody(), true);
        return is_array($body) ? $body : [];
    }  
}