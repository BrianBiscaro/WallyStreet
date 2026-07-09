<?php

namespace App\Models;

use App\Exceptions\BadRequestException;
use App\Exceptions\ConflictException;
use App\Exceptions\UnauthorizedException;
use App\Exceptions\NotFoundException;
use App\Models\DB;

class User
{
    public static function validateName(string $name): bool
    {

        return $name !== '' && preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/u', $name);
    }

    public static function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validatePassword(string $password): bool
    {
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/', $password);
    }


    public static function register(array $data): array
    {
        $name = trim($data['name'] ?? '');
        if ($name == '') {
            throw new BadRequestException('Falta el campo nombre');
        }
        $email = trim($data['email'] ?? '');
        if ($email == '') {
            throw new BadRequestException('Falta el campo email');
        }
        $password = $data['password'] ?? '';
        if ($password == '') {
            throw new BadRequestException('Falta el campo contraseña');
        }


        if (!self::validateName($name)) {
            throw new BadRequestException('El nombre debe contener solo letras y no puede estar vacío.');
        }

        if (!self::validateEmail($email)) {
            throw new BadRequestException('El email no tiene un formato válido.');
        }

        if (!self::validatePassword($password)) {
            throw new BadRequestException('La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.');
        }

        $db = DB::getConnection();
        $stmt = $db->prepare('SELECT id FROM users WHERE email = :email');
        $stmt->execute([':email' => $email]);

        if ($stmt->fetch()) {
            throw new ConflictException('Ya existe un usuario con ese email.');
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $insert = $db->prepare('INSERT INTO users (name, email, password, balance) VALUES (:name, :email, :password, 1000.00)');

        $insert->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashed
        ]);


        $userId = $db->lastInsertId();
        if (!$userId) {
            throw new BadRequestException('No se pudo obtener el ID del usuario creado.');
        }

        return ['user_id' => (int)$userId, 'message' => 'Usuario creado correctamente'];
    }
    public static function authenticate(string $email, string $password): array
    {
        if ($email === '' || $password === '') {
            throw new BadRequestException('Email y password son requeridos para autenticarse.');
        }

        $db = DB::getConnection();
        $stmt = $db->prepare('SELECT id, password, is_admin, name, balance FROM users WHERE email = :email');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            throw new UnauthorizedException('Email o contraseña incorrectos.');
        }

        $userData = ['id' => $user['id'], 'is_admin' => $user['is_admin'], 'name' => $user['name'], 'balance' => $user['balance']];

        $token = bin2hex(random_bytes(24));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        self::setToken((int)$user['id'], $token, $expiresAt);

        return ['token' => $token, 'expires_at' => $expiresAt, 'user' => $userData];
    }

    public static function setToken(int $id, string $token, string $expiresAt): void
    {
        $db = DB::getConnection();
        $stmt = $db->prepare('UPDATE users SET token = :token, token_expired_at = :expired WHERE id = :id');
        $stmt->execute([':token' => $token, ':expired' => $expiresAt, ':id' => $id]);
    }

    public static function clearToken(int $id): void
    {
        $db = DB::getConnection();
        $stmt = $db->prepare('UPDATE users SET token = NULL, token_expired_at = NULL WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }

    public static function findByToken(string $token): ?array
    {
        if ($token === '') {
            return null;
        }

        $db = DB::getConnection();
        $stmt = $db->prepare('SELECT * FROM users WHERE token = :token AND token_expired_at > NOW()');
        $stmt->execute([':token' => $token]);

        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function findById(int $id): ?array
    {
        $db = DB::getConnection();
        $stmt = $db->prepare('SELECT id, name, email, balance, is_admin FROM users WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function getProfile(int $targetId, array $authUser): array
    {
        if ((int)$authUser['id'] !== $targetId && !self::isAdmin($authUser)) {
            throw new UnauthorizedException('No tienes permiso para ver este perfil.');
            // throw new ForbiddenException('No tienes permiso para ver este perfil.');
        }

        $db = DB::getConnection();
        $stmt = $db->prepare('SELECT id, name, email, balance FROM users WHERE id = :id');
        $stmt->execute([':id' => $targetId]);
        $profile = $stmt->fetch();

        if (!$profile) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        $portfolio = Portfolio::summaryByUser($targetId);
        return [
            'id' => (int)$profile['id'],
            'name' => $profile['name'],
            'email' => $profile['email'],
            'balance' => (float)$profile['balance'],
            'is_admin' => (bool)$profile['is_admin'],
            'portfolio_total' => $portfolio['total_value'],
            'holdings' => $portfolio['holdings'],
        ];
    }

    public static function update(int $targetId, array $authUser, array $data): array
    {

        if ((int) $authUser['id'] !== $targetId && !User::isAdmin($authUser)) {
            // throw new ForbiddenException('No tienes permiso para actualizar este perfil.');
            throw new UnauthorizedException('No tienes permiso para actualizar este perfil.');
        }

        $fields = [];
        $params = [':id' => $targetId];

        if (isset($data['name'])) {
            $name = trim($data['name']);
            if (!self::validateName($name)) {
                throw new BadRequestException('El nombre debe contener solo letras y no puede estar vacío.');
            }
            $fields[] = 'name = :name';
            $params[':name'] = $name;
        }

        if (isset($data['password'])) {
            $password = $data['password'];
            if (!self::validatePassword($password)) {
                throw new BadRequestException('La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.');
            }
            $fields[] = 'password = :password';
            $params[':password'] = password_hash($password, PASSWORD_DEFAULT);
        }

        if (empty($fields)) {
            throw new BadRequestException('Debes enviar name y/o password para actualizar.');
        }

        $db = DB::getConnection();
        $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id');
        $stmt->execute($params);

        return ['message' => 'Usuario actualizado correctamente.'];
    }

    public static function listSummary(): array
    {
        $db = DB::getConnection();
        $stmt = $db->query(
            'SELECT u.id, u.name, COALESCE(SUM(p.quantity * a.current_price), 0) 
             AS portfolio_total 
             FROM users u LEFT JOIN portfolio p 
             ON p.user_id = u.id LEFT JOIN assets a 
             ON a.id = p.asset_id 
             GROUP BY u.id 
             ORDER BY u.name'
        );

        return array_map(static function ($item) {
            return [
                'id' => (int)$item['id'],
                'name' => $item['name'],
                'portfolio_total' => (float)$item['portfolio_total']
            ];
        }, $stmt->fetchAll());
    }

    public static function isAdmin(array $user): bool
    {
        return !empty($user['is_admin']);
    }
}
