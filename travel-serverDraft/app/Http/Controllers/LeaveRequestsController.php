<?php

namespace App\Http\Controllers;

use App\Models\leave_requests;
use App\Http\Requests\Storeleave_requestsRequest;
use App\Http\Requests\Updateleave_requestsRequest;

class LeaveRequestsController extends Controller
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
    public function store(Storeleave_requestsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(leave_requests $leave_requests)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(leave_requests $leave_requests)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Updateleave_requestsRequest $request, leave_requests $leave_requests)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(leave_requests $leave_requests)
    {
        //
    }
}
