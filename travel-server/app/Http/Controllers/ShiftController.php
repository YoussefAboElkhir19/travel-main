<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\User;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
 public function index(Request $request)
{
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date'
    ]);

    $user = Auth::user();

    return Shift::with('user') // يجيب بيانات اليوزر مع الشيفت
        ->where('user_id', $user->id)
        ->whereBetween('start_time', [$request->start_date, $request->end_date])
        ->get();
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


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shift $shift)
    {
        //
    }



    public function countToday()
    {
        $count = Shift::where('user_id', Auth::id())
            ->whereDate('start_time', Carbon::today())
            ->count();

        return response()->json(['status' => true, 'count' => $count]);
    }

    public function endShift(Request $request, $shiftId)
    {
        \Log::info('🔚 END SHIFT CALLED', [
            'shift_id' => $shiftId,
            'request_method' => $request->method(),
            'request_url' => $request->fullUrl(),
            'request_data' => $request->all(),
            'auth_id' => Auth::id()
        ]);

        $shift = Shift::where('id', $shiftId)
            ->where('user_id', Auth::id()) // Make sure user owns this shift
            ->whereNull('end_time')
            ->first();

        if (!$shift) {
            \Log::warning('❌ Shift not found or already ended', ['shift_id' => $shiftId]);
            return response()->json(['message' => 'Shift not found or already ended'], 404);
        }

        // End any active breaks first
        $activeBreaks = $shift->breaks()->whereNull('end_time')->get();
        foreach ($activeBreaks as $break) {
            $break->update(['end_time' => now()]);
        }

        // Calculate total break time
        $totalBreakSeconds = $shift->breaks()
            ->whereNotNull('end_time')
            ->get()
            ->sum(function ($break) {
                return Carbon::parse($break->start_time)->diffInSeconds(Carbon::parse($break->end_time));
            });

        // End the shift
        $shift->update([
            'end_time' => now(),
            'total_break_seconds' => $totalBreakSeconds
        ]);

        \Log::info('✅ Shift ended successfully', [
            'shift_id' => $shiftId,
            'total_break_seconds' => $totalBreakSeconds
        ]);

        return response()->json(['shift' => $shift, 'status' => true], 200);
    }

    public function startShift(Request $request)
    {
        \Log::info('🚨 START SHIFT CALLED', [
            'request_method' => $request->method(),
            'request_url' => $request->fullUrl(),
            'request_data' => $request->all(),
            'auth_id' => Auth::id(),
            'user_id_param' => $request->user_id ?? 'not_provided'
        ]);

        $userId = $request->user_id ?? Auth::id();
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Get company settings for shifts per day limit
        $shiftsPerDayLimit = $user->company->settings->shiftSettings->shiftsPerDay ?? 1;

        // Check if user already has reached the daily limit
        $todayShiftCount = Shift::where('user_id', $userId)
            ->whereDate('start_time', Carbon::today())
            ->count();

        \Log::info('📊 Today shift count check', [
            'user_id' => $userId,
            'today_shifts_count' => $todayShiftCount,
            'daily_limit' => $shiftsPerDayLimit,
            'date' => Carbon::today()->toDateString()
        ]);

        if ($todayShiftCount >= $shiftsPerDayLimit) {
            \Log::info('⚠️ User has already reached daily shift limit', [
                'user_id' => $userId,
                'today_shifts' => $todayShiftCount,
                'limit' => $shiftsPerDayLimit
            ]);

            return response()->json([
                'status' => false,
                'message' => "You have already started {$todayShiftCount} shift(s) today. Daily limit is {$shiftsPerDayLimit}.",
                'today_shifts_count' => $todayShiftCount,
                'daily_limit' => $shiftsPerDayLimit
            ], 422);
        }

        // Check if user has an active shift (not ended yet)
        $activeShift = Shift::where('user_id', $userId)
            ->whereNull('end_time')
            ->first();

        if ($activeShift) {
            \Log::info('⚠️ User has an active shift', ['shift_id' => $activeShift->id]);

            return response()->json([
                'status' => false,
                'message' => 'You already have an active shift that needs to be ended first.',
                'active_shift' => $activeShift
            ], 422);
        }

        // Create new shift
        $shift = Shift::create([
            'user_id' => $userId,
            'start_time' => now(),
            'total_break_seconds' => 0,
        ]);

        \Log::info('✅ New shift created', [
            'shift_id' => $shift->id,
            'user_id' => $userId,
            'start_time' => $shift->start_time
        ]);

        return response()->json([
            'shift' => $shift,
            'status' => true,
            'message' => 'Shift started successfully'
        ], 201);
    }

    public function active(Request $request)
    {
        $userId = $request->query('user_id') ?? Auth::id();

        \Log::info('🔍 ACTIVE SHIFT QUERY', [
            'user_id_param' => $request->query('user_id'),
            'auth_id' => Auth::id(),
            'final_user_id' => $userId,
            'request_url' => $request->fullUrl()
        ]);

        $shift = Shift::with('breaks')
            ->where('user_id', $userId)
            ->whereNull('end_time')
            ->orderByDesc('start_time')
            ->first();

        \Log::info('🔍 Active shift result', [
            'found_shift' => $shift ? $shift->id : 'none',
            'shift_data' => $shift
        ]);

        return response()->json($shift, 200);
    }
    public function dayShifts($user_id, Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date',
        ]);

        $shifts = Shift::with('breaks')
            ->where('user_id', $user_id)
            ->whereBetween('start_time', [$request->start, $request->end])
            ->get();

        if ($shifts->isEmpty()) {
            return response()->json(['message' => "No shifts found for the specified date range $request->start to $request->end"], 404);
        }
        return response()->json($shifts, 200);
    }

    public function monthStats($month)
    {
        $start = Carbon::parse($month)->startOfMonth();
        $end = Carbon::parse($month)->endOfMonth();

        $shifts = Shift::where('user_id', Auth::id())
            ->whereBetween('start_time', [$start, $end])
            ->whereNotNull('end_time')
            ->get();

        $totalSeconds = 0;
        foreach ($shifts as $shift) {
            $duration = Carbon::parse($shift->end_time)->diffInSeconds(Carbon::parse($shift->start_time));
            $totalSeconds += ($duration - ($shift->total_break_seconds ?? 0));
        }

        return response()->json([
            'total_hours' => $totalSeconds / 3600,
            'shifts' => $shifts,
            'status' => true
        ]);
    }

    public function getShiftsReport(Request $request)
    {
        try {
            Log::info('Shifts report request received', $request->all());

            // Validate request parameters
            $validated = $request->validate([
                'start_date' => 'required|date|date_format:Y-m-d',
                'end_date' => 'required|date|date_format:Y-m-d|after_or_equal:start_date',
                'order_by' => 'sometimes|string|in:start_time,end_time,created_at,user_id',
                'order_direction' => 'sometimes|string|in:asc,desc',
                'user_id' => 'sometimes|integer|exists:users,id'
            ]);

            Log::info('Validation passed', $validated);

            // Set default values
            $orderBy = $validated['order_by'] ?? 'start_time';
            $orderDirection = $validated['order_direction'] ?? 'desc';

            // Build the query with soft deletes consideration
            $query = Shift::query();

            // Check if User model exists and has the expected fields
            try {
                $query->with([
                    'user' => function ($q) {
                        // Only select fields that exist in your users table
                        $q->select('id', 'name', 'email')
                            ->addSelect('user_name') // Only if this field exists
                            ->addSelect('avatar_url'); // Only if this field exists
                    }
                ]);
            } catch (\Exception $e) {
                // Fallback: load user without specific field selection
                $query->with('user');
                Log::warning('User relationship loaded without field selection: ' . $e->getMessage());
            }

            $query->whereBetween('start_time', [
                Carbon::parse($validated['start_date'])->startOfDay(),
                Carbon::parse($validated['end_date'])->endOfDay()
            ]);

            // Apply user filter if specified
            if (isset($validated['user_id'])) {
                $query->where('user_id', $validated['user_id']);
            }

            // Apply sorting
            $query->orderBy($orderBy, $orderDirection);

            Log::info('Query built, executing...');

            // Get the results
            $shifts = $query->get();

            Log::info('Shifts retrieved', ['count' => $shifts->count()]);

            // Transform the data to match frontend expectations
            $transformedShifts = $shifts->map(function ($shift) {
                try {
                    // Calculate total hours safely
                    $totalHours = 0;
                    if ($shift->start_time && $shift->end_time) {
                        $start = Carbon::parse($shift->start_time);
                        $end = Carbon::parse($shift->end_time);
                        $totalSeconds = $end->diffInSeconds($start);
                        $workSeconds = $totalSeconds - ($shift->total_break_seconds ?? 0);
                        $totalHours = round($workSeconds / 3600, 2);
                    }

                    // Calculate break minutes
                    $breakMinutes = round(($shift->total_break_seconds ?? 0) / 60, 0);

                    // Determine status
                    $status = $shift->end_time ? 'completed' : 'active';

                    // Get user data safely
                    $user = $shift->user;
                    $user_name = 'Unknown';
                    $userEmail = null;
                    $avatarUrl = null;

                    if ($user) {
                        $user_name = $user->user_name ?? $user->name ?? 'Unknown';
                        $userEmail = $user->email ?? null;
                        $avatarUrl = $user->avatar_url ?? null;
                    }

                    return [
                        'id' => $shift->id,
                        'start_time' => $shift->start_time ? $shift->start_time->toISOString() : null,
                        'end_time' => $shift->end_time ? $shift->end_time->toISOString() : null,
                        'user_id' => $shift->user_id,
                        'status' => $status,
                        'break_duration' => $breakMinutes,
                        'total_break_seconds' => $shift->total_break_seconds ?? 0,
                        'total_hours' => $totalHours,
                        'notes' => $shift->notes,
                        'created_at' => $shift->created_at ? $shift->created_at->toISOString() : null,
                        'updated_at' => $shift->updated_at ? $shift->updated_at->toISOString() : null,

                        // User information
                        'user_name' => $user_name,
                        'user_email' => $userEmail,
                        'avatar_url' => $avatarUrl,
                    ];
                } catch (\Exception $e) {
                    Log::error('Error transforming shift: ' . $e->getMessage(), [
                        'shift_id' => $shift->id ?? 'unknown'
                    ]);

                    // Return minimal safe data
                    return [
                        'id' => $shift->id ?? null,
                        'start_time' => null,
                        'end_time' => null,
                        'user_id' => $shift->user_id ?? null,
                        'status' => 'unknown',
                        'break_duration' => 0,
                        'total_break_seconds' => 0,
                        'total_hours' => 0,
                        'notes' => null,
                        'created_at' => null,
                        'updated_at' => null,
                        'user_name' => 'Error',
                        'user_email' => null,
                        'avatar_url' => null,
                    ];
                }
            });

            Log::info('Shifts transformed successfully');

            return response()->json($transformedShifts, 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', $e->errors());
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Please check your input parameters',
                'details' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Shifts report error: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Unable to fetch shifts report',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

}
