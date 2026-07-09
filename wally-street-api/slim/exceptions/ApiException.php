<?php
namespace App\Exceptions;
use Exception;

abstract class ApiException extends Exception{
    public function __construct(string $message, int $code){
        parent::__construct($message, $code);
    }
}

?>