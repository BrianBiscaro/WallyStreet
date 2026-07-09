<?php
namespace App\Exceptions;
use App\Exceptions\ApiException;

class UnauthorizedException extends ApiException {
    public function __construct(string $message, int $code = 401){
        parent::__construct($message, $code);
    }
}

?>