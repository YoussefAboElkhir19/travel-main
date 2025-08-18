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
        Schema::create('read_notifications', function (Blueprint $table) {
           $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('notification_id')->constrained()->onDelete('cascade');
            $table->timestamp('read_at')->useCurrent(); // وقت القراءة
            $table->timestamps();
            
            // فهرس مركب لتحسين الأداء
            $table->unique(['user_id', 'notification_id']);
            $table->index(['user_id', 'read_at']); // للبحث حسب المستخدم ووقت القراءة
            $table->index(['notification_id', 'read_at']); // للبحث حسب الإشعار ووقت القراء
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('read_notifications');
    }
};
