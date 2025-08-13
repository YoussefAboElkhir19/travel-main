<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use App\Http\Requests\StoretodosRequest;
use App\Http\Requests\UpdatetodosRequest;

class TodosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return " To dOS INDEX";
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
    public function store(StoretodosRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(todos $todos)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(todos $todos)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatetodosRequest $request, todos $todos)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(todos $todos)
    {
        //
    }
}
