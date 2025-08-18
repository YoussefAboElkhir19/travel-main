<?php

namespace App\Http\Controllers;

use App\Models\Breakk;
use App\Models\Shift;
use Illuminate\Http\Request;

class BreakkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Breakk $breakk)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Breakk $breakk)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Breakk $breakk)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Breakk $breakk)
    {
        //
    }

    public function startBreak(Request $request)
    {
        $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user_id;  // This is already the user ID (integer)

        $shift = Shift::where('user_id', $userId)  // Use $userId directly
            ->whereNull('end_time')
            ->first();

        $break = Breakk::create([
            'shift_id' => $request->shift_id,
            'start_time' => now(),
        ]);

        // Return the created break or success response
        return response()->json($break, 201);
    }

    public function endBreak(Request $request, $id)
    {
        $break = Breakk::findOrFail($id);
        $break->update([
            'end_time' => now(),
        ]);

        return response()->json($break,  201);
    }
}
