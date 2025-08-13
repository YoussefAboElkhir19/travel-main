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
        Schema::table('roles', function (Blueprint $table) {
            //
            $table->string('name')->unique();               // اسم الرول
            $table->string('description')->nullable();      // وصف الرول
            $table->string('default_route')->default('/attendance'); // الطريق الافتراضي
            $table->boolean('can_add_items')->default(false);       // هل يمكنهم إضافة عناصر
            $table->json('permissions')->nullable();        // تخزين الصلاحيات كـ JSON
            $table->boolean('is_system')->default(false);  


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            //
                    Schema::dropIfExists('roles');

        });
    }
};
