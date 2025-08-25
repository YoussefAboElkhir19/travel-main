<?php

namespace App\Http\Controllers;

use App\Models\Leave_request;
use App\Models\User;
use Illuminate\Http\Request;
class LeaveRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Accept Role Permmision 
    //     if (auth()->user()->role !== 'admin') {
    //     return response()->json(['message' => 'Unauthorized'], 403);
    // }
        $leaveRequests = Leave_request::with('user')->get();
        // if ($leaveRequests->isEmpty()) {
        //     return response()->json(['message' => 'No leave requests found'], 404);
        // }

        return response()->json($leaveRequests->toArray(), 200);

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
        $validatedData = $request->validate([
            // 'user_id' => 'exists:users,id',
            'leave_type' => 'required|string|max:255',
            'leave_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'status' => 'required|string|max:50',
        ]);
        try {
            // check user is login 
            $user = auth()->user();

            $leaveRequest = Leave_request::create([
                'user_id' => $user->id,
                'leave_type' => $validatedData['leave_type'],
                'leave_date' => $validatedData['leave_date'],
                'notes' => $validatedData['notes'],
                'status' => $validatedData['status'],
            ]);
        }catch (\Exception $e) {
            return response()->json(['message' => 'Validation failed: ' . $e->getMessage()], 422);
        }
        if (!$leaveRequest) {
            return response()->json(['message' => 'Failed to create leave request'], 500);
        }else {
            return response()->json($leaveRequest, 201);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Leave_request $leave_request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Leave_request $leave_request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {

        $leave_request = Leave_request::findOrFail($id);
        // return $request;
        $request = $request->validate([
            'status' => 'required|string|max:50',
            // 'reviewed_by' => 'exists:users,id',
        ]);
        // $user = auth()->user();
        // if (!$user) {
        //     return response()->json(['message' => 'Unauthorized'], 401);
        // }
        $leave_request->update([
            'status' => $request['status'],
            // 'reviewed_by' => $user->id,
            'reviewed_by' => 1,
            'updated_at' => now(),

        ]);

        if (!$leave_request) {
            return response()->json(['message' => 'Failed to update leave request'], 500);
        }

        return response()->json([
            'message' => 'Leave request updated successfully',
            'data' => $leave_request->first(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Leave_request $leave_request)
    {

        $leave_request->delete();

        return response()->json([
            'message' => 'Leave request deleted successfully'
        ]);
    }
    public function get_leaves(Request $request)
    {
        $request=$request->validate([
            'user_id' => 'exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date'
        ]);


        $leaves = Leave_Request::where('user_id', $request['user_id'])
            ->where('status', 'approved')
            ->whereBetween('leave_date', [$request['start_date'], $request['end_date']])
            ->get(['leave_date', 'status']);

        return response()->json($leaves);
    }

    public function countApproved(Request $request)
    {
        $userId = $request->query('user_id');
        $start = $request->query('start');
        $end = $request->query('end');

        $count = Leave_Request::where('user_id', $userId)
            ->where('status', 'approved')
            ->whereBetween('leave_date', [$start, $end])
            ->count();

        return response()->json([
            'count' => $count,
            'status' => true
        ]);
    }
}
