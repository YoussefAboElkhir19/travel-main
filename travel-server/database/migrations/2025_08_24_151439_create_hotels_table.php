<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('booking_number');
            $table->decimal('number_of_guests');
            $table->decimal('number_of_rooms');
            $table->string('room_type');
            $table->date('check_in_date');
            $table->date('check_out_date');
            // $table->enum('status', ['Confimed', 'Pending', 'Cancelled'])->default('Pending');
            $table->softDeletes(); // ← هنا أضفت عمود deleted_at للسوفت ديليت
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
