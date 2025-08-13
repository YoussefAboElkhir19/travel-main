<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

class ToDo extends Model
{
    use SoftDeletes;
    //
        protected $table = 'todos';

}
