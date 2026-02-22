<?php
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../phpmailer/src/Exception.php';
require '../../phpmailer/src/PHPMailer.php';
require '../../phpmailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. DATA HANDLING
    $fname      = $_POST['fname'] ?? 'Attendee';
    $email      = $_POST['email'] ?? '';
    $eventName  = $_POST['eventName'] ?? 'the Event';
    $ticketType = $_POST['ticketType'] ?? 'General';
    $phone      = $_POST['phone'] ?? 'Not provided';
    $org        = $_POST['org'] ?? 'Individual';
    
    // Create a unique Ticket ID for the QR code and display
    $ticketID   = $_POST['ticketID'] ?? "HH-" . strtoupper(substr(md5(time() . $email), 0, 8));

    // 2. GENERATE WORKING QR CODE URL
    // Encodes the unique Ticket ID into a scan-ready QR code
    $qrData     = urlencode($ticketID); 
    $qrCodeUrl  = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$qrData";

    // 3. IMMEDIATE RESPONSE (FastCGI Optimization)
    // The browser sees success immediately while the email sends in the background
    echo json_encode(["status" => "success"]);
    
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        ignore_user_abort(true);
        flush();
    }

    // 4. BACKGROUND PROCESSING
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = 'hapsayhub@gmail.com'; 
        $mail->Password   = 'fdly aseb jhro kvzz'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        $mail->addEmbeddedImage('../../image/circle-logo.png', 'hapsay_logo');

        // Dynamic Logic for Perks and Styling
        if (strcasecmp($ticketType, 'VIP') == 0 || strcasecmp($ticketType, 'VIP Pass') == 0) {
            $paymentStatus = "<span style='color: #f87171; background: #fef2f2; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid #fee2e2;'>PENDING (P50)</span>";
            $statusNote = "Your VIP experience is one step away! Please settle the P50 fee at the venue entrance to claim your premium perks.";
            $accentColor = "#8b5cf6";
            $perks = "• Priority Seating<br>• VIP Networking Lounge Access<br>• Digital Resource Kit";
        } else {
            $paymentStatus = "<span style='color: #34d399; background: #f0fdf4; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid #dcfce7;'>CONFIRMED</span>";
            $statusNote = "Your registration is fully confirmed. Simply show this voucher upon arrival.";
            $accentColor = "#10b981";
            $perks = "• General Admission Access<br>• Main Hall Seating<br>• Digital Certificate of Participation";
        }

        $mail->setFrom('hapsayhub@gmail.com', 'HapsayHub');
        $mail->addAddress($email, $fname); 

        $mail->isHTML(true);
        $mail->Subject = "Your E-Pass & QR Code for $eventName";
        
        $mail->Body = <<<HTML
            <div style='background-color: #f1f5f9; padding: 40px 10px; font-family: "Inter", -apple-system, sans-serif;'>
                <div style='max-width: 550px; margin: auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08);'>
                    
                    <div style='background: #0f172a; padding: 40px 20px; text-align: center;'>
                        <div style='display: inline-block; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 50%;'>
                            <img src='cid:hapsay_logo' alt='HapsayHub' style='width: 70px; height: 70px; border: 2px solid #ffffff; border-radius: 50%; display: block;'>
                        </div>
                        <h1 style='color: white; margin: 15px 0 0 0; font-size: 24px; font-weight: 800;'>HapsayHub</h1>
                        <p style='color: #94a3b8; font-size: 12px; margin-top: 5px;'>Empowering Events, Simplified.</p>
                    </div>

                    <div style='padding: 30px 40px;'>
                        <p style='color: #64748b; font-size: 14px; margin: 0;'>Official Registration Receipt</p>
                        <h2 style='color: #1e293b; font-size: 26px; margin: 5px 0 25px 0; font-weight: 800;'>Welcome, $fname!</h2>
                        
                        <p style='color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 25px;'>Great news! We have successfully received your registration for <strong>$eventName</strong>. Your digital pass is ready for use.</p>
                        
                        <div style='background: #ffffff; border: 2px solid #e2e8f0; border-radius: 24px; overflow: hidden; text-align: center;'>
                            <div style='padding: 20px; background: #f8fafc; border-bottom: 2px dashed #e2e8f0;'>
                                <div style='display: inline-block; background: $accentColor; color: white; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;'>Official Ticket</div>
                                <h3 style='margin: 0; color: #0f172a; font-size: 18px; font-weight: 800;'>$eventName</h3>
                            </div>
                            
                            <div style='padding: 25px;'>
                                <div style='margin-bottom: 20px;'>
                                    <img src="$qrCodeUrl" alt="Attendance QR Code" width="160" height="160" style="display: block; margin: 0 auto; border: 1px solid #eee; padding: 5px; border-radius: 10px;">
                                    <p style='margin-top: 10px; font-family: monospace; font-size: 14px; color: #64748b; font-weight: bold;'>$ticketID</p>
                                </div>

                                <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom: 15px; text-align: left;'>
                                    <tr>
                                        <td width='50%' valign='top' style='padding-bottom: 15px;'>
                                            <p style='margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;'>Ticket ID</p>
                                            <p style='margin: 4px 0 0 0; color: #1e293b; font-weight: 700; font-size: 14px;'>$ticketID</p>
                                        </td>
                                        <td width='50%' valign='top' align='right' style='padding-bottom: 15px;'>
                                            <p style='margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;'>Pass Type</p>
                                            <p style='margin: 4px 0 0 0; color: #1e293b; font-weight: 700; font-size: 14px;'>$ticketType</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width='50%' valign='top'>
                                            <p style='margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;'>Organization</p>
                                            <p style='margin: 4px 0 0 0; color: #1e293b; font-weight: 700; font-size: 14px;'>$org</p>
                                        </td>
                                        <td width='50%' valign='top' align='right'>
                                            <p style='margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;'>Status</p>
                                            <p style='margin: 4px 0 0 0;'>$paymentStatus</p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style='border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 5px; text-align: left;'>
                                     <p style='margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;'>Included Perks</p>
                                     <p style='margin: 8px 0 0 0; color: #475569; font-size: 13px; line-height: 1.5;'>$perks</p>
                                </div>
                            </div>
                        </div>

                        <div style='margin-top: 30px;'>
                            <h4 style='color: #0f172a; font-size: 16px; font-weight: 800; margin-bottom: 15px;'>What's Next?</h4>
                            <div style='background: #f8fafc; border-radius: 16px; padding: 20px;'>
                                <table width='100%' cellpadding='0' cellspacing='0'>
                                    <tr>
                                        <td width='30' valign='top' style='color: $accentColor; font-weight: bold;'>1.</td>
                                        <td style='padding-bottom: 10px; font-size: 14px; color: #475569;'>Save this email or take a screenshot of your QR code.</td>
                                    </tr>
                                    <tr>
                                        <td width='30' valign='top' style='color: $accentColor; font-weight: bold;'>2.</td>
                                        <td style='padding-bottom: 10px; font-size: 14px; color: #475569;'>Arrive at least 15 minutes before the start time for a smooth check-in.</td>
                                    </tr>
                                    <tr>
                                        <td width='30' valign='top' style='color: $accentColor; font-weight: bold;'>3.</td>
                                        <td style='font-size: 14px; color: #475569;'>$statusNote</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div style='margin-top: 35px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;'>
                            <p style='color: #64748b; font-size: 12px;'>Need help? Reply to this email or contact us at <br> <a href='mailto:hapsayhub@gmail.com' style='color: $accentColor; text-decoration: none; font-weight: 700;'>support@hapsayhub.com</a></p>
                        </div>
                    </div>

                    <div style='padding: 30px; background: #f8fafc; text-align: center;'>
                        <p style='margin: 0; color: #475569; font-size: 12px; font-weight: 700;'>HapsayHub Automated System</p>
                        <p style='margin: 4px 0 0 0; color: #94a3b8; font-size: 11px;'>Created with ❤️ by the CoCrab.dev Team</p>
                    </div>
                </div>
            </div>
HTML;

        $mail->send();
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
    }
}
?>