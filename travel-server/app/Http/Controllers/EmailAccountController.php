<?php

namespace App\Http\Controllers;

use App\Models\EmailAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailAccountController extends Controller
{
    // Get all email accounts for authenticated user
    public function index(): JsonResponse
    {
        try {
            $emailAccounts = EmailAccount::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $emailAccounts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch email accounts'
            ], 500);
        }
    }

    // Add a new email account
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email_address' => 'required|email',
            'provider' => 'required|string|max:255',
            'smtp_server' => 'required|string|max:255',
            'smtp_port' => 'required|integer|min:1|max:65535',
            'password_encrypted' => 'required|string|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Test SMTP connection
            $testResult = $this->testSmtpConnection(
                $request->smtp_server,
                $request->smtp_port,
                $request->email_address,
                $request->password_encrypted
            );

            if (!$testResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'SMTP connection failed: ' . $testResult['error']
                ], 400);
            }
            $user = auth()->user();

            $emailAccount = EmailAccount::create([
                'user_id' => $user->id,
                'email_address' => $request->email_address,
                'provider' => $request->provider,
                'smtp_server' => $request->smtp_server,
                'smtp_port' => $request->smtp_port,
                'password_encrypted' => $request->password_encrypted, // You can encrypt in model
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email account added successfully',
                'data' => $emailAccount
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add email account'
            ], 500);
        }
    }

    // Delete email account
    public function destroy(EmailAccount $emailAccount): JsonResponse
    {
        try {
            if ($emailAccount->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $emailAccount->delete();

            return response()->json([
                'success' => true,
                'message' => 'Email account deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete email account'
            ], 500);
        }
    }

    // Send email via selected account
    public function sendEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:email_accounts,id',
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $emailAccount = EmailAccount::where('id', $request->account_id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$emailAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email account not found'
                ], 404);
            }

            $result = $this->sendEmailViaSMTP(
                $emailAccount,
                $request->to,
                $request->subject,
                $request->body
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email sent successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send email: ' . $result['error']
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email'
            ], 500);
        }
    }

    // Helper: test SMTP connection
    private function testSmtpConnection($server, $port, $username, $password): array
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = $server;
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password;
            $mail->SMTPSecure = $port == 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $port;
            $mail->smtpConnect();
            $mail->smtpClose();
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // Helper: send email via SMTP
private function sendEmailViaSMTP(EmailAccount $emailAccount, $to, $subject, $body): array
{
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $emailAccount->smtp_server;
        $mail->SMTPAuth = true;
        $mail->Username = $emailAccount->email_address;
        $mail->Password = $emailAccount->password_encrypted; // ✅ بدلها هنا
        $mail->SMTPSecure = $emailAccount->smtp_port == 465 
            ? PHPMailer::ENCRYPTION_SMTPS 
            : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $emailAccount->smtp_port;

        $mail->setFrom($emailAccount->email_address);
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = nl2br($body);

        $mail->send();
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

}
