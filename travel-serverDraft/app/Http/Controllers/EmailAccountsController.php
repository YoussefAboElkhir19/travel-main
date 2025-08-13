<?php

namespace App\Http\Controllers;

use App\Models\email_accounts;
use App\Http\Requests\Storeemail_accountsRequest;
use App\Http\Requests\Updateemail_accountsRequest;

class EmailAccountsController extends Controller
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
    public function store(Storeemail_accountsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(email_accounts $email_accounts)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(email_accounts $email_accounts)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Updateemail_accountsRequest $request, email_accounts $email_accounts)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(email_accounts $email_accounts)
    {
        //
    }
}
