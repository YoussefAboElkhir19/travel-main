<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $shifts = Shift::with('user')->get();
        return response()->json([
            'status' => true,
            'data' => $shifts->toArray(),
            'message' => 'Shift fetched successfully'

        ]);
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
    // Validation
    $validation = Validator::make($request->all(), [
        'user_id' => 'required|integer', 
        'start_time' => 'required|date',
        'end_time' => 'required|date|after:start_time',
        'total_break_seconds' => 'nullable|integer',
        'notes' => 'nullable|string'
    ]);

    if ($validation->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validation->errors()
        ]);
    }

    // Create Shift
    $shift = new Shift();
    $shift->user_id = $request->user_id ?? 1; // لو مش موجودة، نستخدم 1 ك default
    $shift->start_time = $request->start_time;
    $shift->end_time = $request->end_time;
    $shift->total_break_seconds = $request->total_break_seconds;
    $shift->notes = $request->notes;
    $shift->save();

    // Return response
    return response()->json([
        'status' => true,
        'data' => $shift->toArray(), 
        'message' => 'Shift added successfully'
    ]);
}

    /**
     * Display the specified resource.
     */
    public function show(Shift $shift)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shift $shift)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
        //
         $shift = Shift::find($id);
        if (!$shift) {
            return response()->json([
                'status' => false,
                'message' => 'Shift not found'
            ], 404);
        }

        $validation = Validator::make($request->all(), [
        'user_id' => 'sometimes|required|integer|exists:roles,id', 
        'start_time' => '|sometimesrequired|date',
        'end_time' => 'sometimes|required|date|after:start_time',
        'total_break_seconds' => 'nullable|integer',
        'notes' => 'nullable|string'
        ]);

        if ($validation->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validation->errors()
            ], 422);
        }
            $shift->update($data);
            return response()->json($shift);
    }

    public function destroy($id)
    {
        $shift = Shift::findOrFail($id);
        if(!$shift){
            return response()->json([
                'status' => false,
                'message' => 'Shif Not Found'
            ], 404);
        }
        $shift->delete();
        return response()->json([
                'status' => true,
                'message' => 'Deleted Success'
            ], 200);
    }
}
