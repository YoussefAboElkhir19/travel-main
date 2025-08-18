<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBreaksTable extends Migration
{
    public function up()
    {
        Schema::create('breaks', function (Blueprint $table) {
            $table->id();
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreignId('shift_id')->constrained()->onDelete('cascade');
            $table->softDeletes(); // ← هنا أضفت عمود deleted_at للسوفت ديليت
        });
    }

    public function down()
    {
        Schema::dropIfExists('breaks');
    }
}
