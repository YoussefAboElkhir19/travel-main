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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_type');
            $table->dateTime('appointment_date');
            $table->string('location');
            $table->enum('status', ['Scheduled', 'Completed', 'Cancelled'])->default('Scheduled');
            $table->text('notes')->nullable();
            $table->softDeletes(); // ← هنا أضفت عمود deleted_at للسوفت ديليت
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
