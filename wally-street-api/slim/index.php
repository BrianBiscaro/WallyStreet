<?php

require __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\RequestInterface as Request;
use Slim\Factory\AppFactory;

use App\Middlewares\AuthMiddleware;
use App\Middlewares\AdminMiddleware;
use App\Middlewares\CorsMiddleware;

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\AssetController;
use App\Controllers\TradeController;

use App\Handlers\ApiErrorHandler;


loadEnvFile(__DIR__ . '/.env');

$app = AppFactory::create();


$app->addRoutingMiddleware();

$errorMiddleware = $app->addErrorMiddleware(
    displayErrorDetails: true,
    logErrors: true,
    logErrorDetails: true
);


$customErrorHandler = new ApiErrorHandler($app);
$errorMiddleware->setDefaultErrorHandler($customErrorHandler);


$app->add(new CorsMiddleware());


$app->options('/{routes:.+}', function (Request $request, Response $response) {
    return $response;
});


$authMiddleware = new AuthMiddleware();
$adminMiddleware = new AdminMiddleware();

$userController = new UserController();
$authController = new AuthController();
$assetController = new AssetController();
$tradeController = new TradeController();


/**
 * Rutas de autenticación
 */
$app->post('/login', [$authController, 'login']);
$app->post('/logout', [$authController, 'logout'])->add($authMiddleware);


/**
 * Rutas de usuarios
 */
$app->post('/users', [$userController, 'register']);
$app->get('/users/{user_id}', [$userController, 'getUser'])->add($authMiddleware);
$app->put('/users/{user_id}', [$userController, 'updateUser'])->add($authMiddleware);
$app->get('/users', [$userController, 'listUsers'])->add($adminMiddleware)->add($authMiddleware);


/**
 * Rutas de activos 
 */
$app->get('/assets', [$assetController, 'getAssets']);
$app->put('/assets', [$assetController, 'refreshPrices'])->add($adminMiddleware)->add($authMiddleware);
$app->get('/assets/{asset_id}/history/{quantity}', [$assetController, 'getHistory']);


/**
 * Rutas de portafolio
 */
$app->get('/portfolio', [$userController, 'getPortfolio'])->add($authMiddleware);
$app->delete('/portfolio/{asset_id}', [$userController, 'deletePortfolioAsset'])->add($authMiddleware);
$app->get('/transactions', [$userController, 'getTransactions'])->add($authMiddleware);


/**
 * Rutas de operaciones (trading) 
 */
$app->post('/trade/buy', [$tradeController, 'buy'])->add($authMiddleware);
$app->post('/trade/sell', [$tradeController, 'sell'])->add($authMiddleware);

$app->run();


function loadEnvFile(string $path): void
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");

        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}
