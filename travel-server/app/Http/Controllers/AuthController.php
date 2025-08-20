<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;

class AuthController extends Controller
{
   public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    $field = filter_var($credentials['email'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

    if (!Auth::attempt([$field => $credentials['email'], 'password' => $credentials['password']])) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;
    // to Send Email After Login  to ( email  )
    // Mail::to($user->email)->send(new WelcomeMail());
    return response()->json([
        'token' => $token,
        'user' => $user->load('role'),
    ]);
}

// public function me(Request $request)
// {
//     return response()->json(['user' => $request->user()]);
// }
public function me(Request $request) {
    $user = $request->user()->load('role'); // نحمل الرول
    return response()->json($user); // نرجعه مباشرة
}



public function logout(Request $request)
{
    $request->user()->tokens()->delete();
    return response()->json(['message' => 'Logged out']);
}

}
