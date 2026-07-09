<?php
namespace App\Exceptions;
use App\Exceptions\ApiException;

class BadRequestException extends ApiException {

    public function __construct(string $message, int $code = 400){
        parent::__construct($message, $code);
    }
}
?>