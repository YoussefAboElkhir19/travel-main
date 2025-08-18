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
        Schema::create('notifications', function (Blueprint $table) {
         $table->id();
        $table->string('title')->nullable();
        $table->text('message');
        $table->unsignedBigInteger('role_id')->nullable(); // الربط بالـ role
        $table->string('sendTo');
        $table->string('deliveryMethod');
        $table->timestamps();


        $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
