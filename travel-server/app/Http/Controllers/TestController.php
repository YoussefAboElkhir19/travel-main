<?php
// app/Http/Controllers/TestController.php
namespace App\Http\Controllers;

use App\Events\TestEvent;

class TestController extends Controller
{
    public function fire()
    {
        broadcast(new TestEvent("Hello from Laravel!"));
        return "Event Fired!";
    }
}
