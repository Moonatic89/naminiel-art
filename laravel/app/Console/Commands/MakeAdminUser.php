<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class MakeAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:make-admin-user
        {email? : Email address for the admin user}
        {--name=Admin : Display name for a new user}
        {--password= : Password for a new user. If omitted, you will be prompted.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or promote a Laravel user to admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?: $this->ask('Admin email');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Please provide a valid email address.');

            return self::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $password = $this->option('password') ?: $this->secret('Password for the new admin user');

            if (! $password) {
                $this->error('A password is required when creating a new user.');

                return self::FAILURE;
            }

            $user = User::create([
                'name' => $this->option('name') ?: 'Admin',
                'email' => $email,
                'password' => Hash::make($password),
                'is_admin' => true,
            ]);

            $this->info("Created admin user {$user->email}.");

            return self::SUCCESS;
        }

        $user->forceFill(['is_admin' => true])->save();
        $this->info("Promoted {$user->email} to admin.");

        return self::SUCCESS;
    }
}
