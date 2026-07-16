<?php
namespace App\Exceptions;
use App\Exceptions\ApiException;

class ConflictException extends ApiException {
    public function __construct(string $message, int $code = 409){
        parent::__construct($message, $code);
    }
}