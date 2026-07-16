<?php 
namespace App\Exceptions;
use App\Exceptions\ApiException;

class NotFoundException extends ApiException {
    public function __construct(string $message, int $code = 404){
        parent::__construct($message, $code);
    }
}