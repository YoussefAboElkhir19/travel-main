<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
class AuthenticationController extends Controller
{
    //
    public function authenticate(Request $request){

        // Apply Validatation
        $validator = Validator::make(
            $request->all(),
            ['email'=>'required|email', 'password'=>'required']
            
        );
      // Errors 
        if($validator->fails()){
            return response()->json([
                'status'=>false,
                'errors'=>$validator->errors()
            ]);
        }else{
            // Requested Credentials Email And password
            $credibtials = [
                'email' =>$request->email,
                'password'=>$request->password
            ];
            // Check if the user is authenticated
            if(Auth::attempt($credibtials)){
                $user = User::find(Auth::user()->id);
                $tokend = $user->createToken('auth_token')->plainTextToken;
                return response()->json([
                    'status'=>true,
                    'token' => $tokend,
                    'id' => Auth::user()->id
                ]);
                // User Is not authenticated
            }else{
                return response()->json([
                    'status'=>false,
                    'message'=>'Invalid Credentials'
                ]);
            }
        }
    }
    // Function Logout 
    public function logout(){
        $user = User::find(Auth::user()->id);
        $user->tokens()->delete();
        return response()->json(
            [
                'status'=>true,
                'message'=>'User Logged Out'
            ]);

    }
}
