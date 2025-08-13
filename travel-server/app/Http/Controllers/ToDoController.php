<?php

namespace App\Http\Controllers;

use App\Models\ToDo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ToDoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    $todos  = ToDo::orderBy('created_at', 'desc')->get();
     return response()->json([
            'status' => true,
            'data' => $todos
        ]);    }

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
        $validation = Validator::make($request->all(), [
            'task' => 'required|max:255',
            'completed' => 'required|in:0,1'
        ]);
        // check if validation fails
        if ($validation->fails()) {
           response()->json([
            'status' => false,
            'error' => $validation->errors()
        ]);}
        $todo = new ToDo();
        $todo->task = $request->task;
        $todo->completed = 1;
        $todo->user_id = 1;
        $todo->save();
        // if validation passes
        return response()->json([
            'status' => true,
            'message' => 'Task Add Successfully'
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(ToDo $toDo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ToDo $toDo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ToDo $toDo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        //
         // finnd the service by id
        $todo = ToDo::find($id);
        if($todo == null){
            return response()->json([
                'status' => false,
                'message' => 'Error Task Not Found'
            ]);
        }
        // if id of serive is not null
        $todo->delete();
        return response()->json([
            'status' => true,
            'message' => 'Task Deleted Successfully'
        ]);
        
        
    }
}
