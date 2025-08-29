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
        Schema::create('cruises', function (Blueprint $table) {
            $table->id();
            $table->string('cruise_name');
            $table->string('ship_name');
            $table->string('cabin_type');
            $table->dateTime('departure_date');
            $table->dateTime('arrival_date');
            $table->string('departure_port'); // Departure port
            $table->string('arrival_port'); // Arrival port
            $table->string('cruise_line');
            $table->enum('status', ['Confimed', 'Pending', 'Cancelled'])->default('Pending');
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
        Schema::dropIfExists('cruises');
    }
};
