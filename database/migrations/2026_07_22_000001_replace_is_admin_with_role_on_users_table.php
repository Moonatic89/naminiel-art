<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->after('password')->index();
            }
        });

        if (Schema::hasColumn('users', 'is_admin')) {
            DB::table('users')
                ->where('is_admin', true)
                ->update(['role' => 'admin']);

            $this->dropIndexIfExists('users_is_admin_index');

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_admin');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'is_admin')) {
                $table->boolean('is_admin')->default(false)->after('password')->index();
            }
        });

        if (Schema::hasColumn('users', 'role')) {
            DB::table('users')
                ->where('role', 'admin')
                ->update(['is_admin' => true]);

            $this->dropIndexIfExists('users_role_index');

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }

    private function dropIndexIfExists(string $index): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("drop index if exists {$index}");

            return;
        }

        try {
            Schema::table('users', function (Blueprint $table) use ($index) {
                $table->dropIndex($index);
            });
        } catch (\Throwable) {
            //
        }
    }
};
