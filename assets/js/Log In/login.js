document.addEventListener('DOMContentLoaded', () => {

    // --- FIXED PART ---
const homeBtn = document.querySelector('.back-to-home');

if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Modern Slim Progress Bar (Top)
        const progress = document.createElement('div');
        Object.assign(progress.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            height: '2px',
            width: '0%',
            background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
            zIndex: '10000',
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
        });
        document.body.appendChild(progress);

        // 2. Micro-interaction: Button Feedback
        homeBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        homeBtn.style.transform = 'scale(0.95) translateX(-10px)';
        homeBtn.style.opacity = '0';
        homeBtn.style.filter = 'blur(4px)';

        // 3. The "Portal Exit" - Elements slide and fade at different speeds
        const mainContent = document.querySelector('main');
        const nebulas = document.querySelectorAll('.nebula');
        const nav = document.querySelector('nav');

        // Trigger the progress bar
        requestAnimationFrame(() => {
            progress.style.width = '100%';
        });

        // Main content "Recedes"
        if (mainContent) {
            mainContent.style.transition = 'all 0.7s cubic-bezier(0.65, 0, 0.35, 1)';
            mainContent.style.transform = 'scale(0.92) translateY(20px)';
            mainContent.style.filter = 'blur(20px)';
            mainContent.style.opacity = '0';
        }

        // Navigation fades out upward
        if (nav) {
            nav.style.transition = 'all 0.5s ease';
            nav.style.transform = 'translateY(-20px)';
            nav.style.opacity = '0';
        }

        // Background Nebulas drift away deeply
        nebulas.forEach((nebula, i) => {
            nebula.style.transition = `all ${0.8 + (i * 0.2)}s cubic-bezier(0.65, 0, 0.35, 1)`;
            nebula.style.transform = `scale(1.5) translate(${i * 50}px, ${i * -50}px)`;
            nebula.style.opacity = '0';
        });

        // 4. Final Redirect
        setTimeout(() => {
            // Smoothly dip to black before the new page loads
            document.body.style.transition = 'background 0.4s ease';
            document.body.style.backgroundColor = '#000';
            
            setTimeout(() => {
                window.location.href = "visitor.html";
            }, 100);
        }, 750);
    });
}
    // -----------------

    // --- 1. CONFIGURATION ---
    // ✅ Updated with your specific Client ID
    const GOOGLE_CLIENT_ID = "430731112851-21fmtare4d688sfj4ipb3ohbddajuk1f.apps.googleusercontent.com";
    
    // ⚠️ REPLACE THIS WITH YOUR REAL FACEBOOK APP ID
    const FB_APP_ID = "YOUR_FACEBOOK_APP_ID_HERE";

    let tokenClient;

    // --- 2. INITIALIZE SDKS ---
    function initGoogle() {
        if (typeof google !== 'undefined' && google.accounts) {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: handleGoogleResponse,
            });
            console.log("Google SDK Ready");
        }
    }

    if (typeof google !== 'undefined' && google.accounts) {
        initGoogle();
    } else {
        const existingOnLoad = window.onload;
        window.onload = function() {
            if (existingOnLoad) existingOnLoad();
            initGoogle();
            if (window.FB) {
                FB.init({
                    appId: FB_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                console.log("Facebook SDK Ready");
            }
        };
    }

    // --- 3. FORGOT PASSWORD ---
    const forgotLink = document.querySelector('.forgot-link');
    const forgotPopup = document.getElementById('forgot-popup');
    const closeForgotBtn = document.getElementById('close-forgot-btn');
    const sendResetBtn = document.getElementById('send-reset-btn');
    const resetEmailInput = document.getElementById('reset-email');

    // Open Modal
    if (forgotLink && forgotPopup) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPopup.classList.remove('hidden');
            forgotPopup.classList.add('active'); 
            setTimeout(() => { if(resetEmailInput) resetEmailInput.focus(); }, 100);
        });
    }

    // Close Modal Helper
    function closeResetModal() {
        if (forgotPopup) {
            forgotPopup.classList.remove('active');
            setTimeout(() => forgotPopup.classList.add('hidden'), 300);
        }
    }

    if (closeForgotBtn) closeForgotBtn.addEventListener('click', closeResetModal);
    // Close when clicking background overlay
    if (forgotPopup) forgotPopup.addEventListener('click', (e) => { if (e.target === forgotPopup) closeResetModal(); });

    // Send Reset Link Action
    if (sendResetBtn) {
        sendResetBtn.addEventListener('click', () => {
            const email = resetEmailInput.value.trim();
            if (!email) {
                showToast("Please enter your email address.", "error");
                resetEmailInput.style.borderColor = "#e74c3c";
                return;
            } 
            resetEmailInput.style.borderColor = "#ddd";
            const originalText = sendResetBtn.innerHTML;
            sendResetBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
            sendResetBtn.disabled = true;

            setTimeout(() => {
                sendResetBtn.innerHTML = originalText;
                sendResetBtn.disabled = false;
                showToast(`Reset link sent to ${email}!`, "success");
                closeResetModal();
                resetEmailInput.value = "";
            }, 1500);
        });
    }

    // --- 4. TOGGLE VIEW (LOGIN <-> REGISTER) ---
    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');

    if (linkToRegister) {
        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.classList.add('hidden');
            registerBox.classList.remove('hidden');
        });
    }

    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        });
    }

    // --- 5. PASSWORD VISIBILITY TOGGLE (EYE ICON) ---
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.parentElement.querySelector('input');
            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = "password";
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // --- 6. SOCIAL LOGIN HANDLERS ---
    
    // Facebook
    const fbBtn = document.getElementById('fb-login-btn');
    if (fbBtn) {
        fbBtn.addEventListener('click', () => {
            if (typeof FB === 'undefined') { showToast("FB SDK not loaded.", "error"); return; }
            FB.login((r) => { 
                if(r.status==='connected') {
                    FB.api('/me', {fields:'name'}, (p)=> {
                        showToast(`Welcome ${p.name}! Redirecting...`, 'success');
                        setTimeout(() => window.location.href = "superadmin.html", 1500);
                    }); 
                }
            }, {scope:'email'});
        });
    }

    // Google
    const googleBtn = document.getElementById('custom-google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            if (tokenClient) tokenClient.requestAccessToken();
        });
    }

    function handleGoogleResponse(tokenResponse) {
        if (tokenResponse && tokenResponse.access_token) {
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` } })
            .then(res => res.json())
            .then(userInfo => {
                showToast(`Welcome back, ${userInfo.name}! Redirecting...`, "success");
                setTimeout(() => window.location.href = "superadmin.html", 1500);
            })
            .catch(err => showToast("Google Login Failed", "error"));
        }
    }

    // --- 7. MAIN LOGIN FORM SUBMISSION ---
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            const btn = document.querySelector('.login-btn');
            const originalText = btn.innerHTML;
            
            // Show Loading
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Loading...';
            btn.style.opacity = "0.7";
            btn.disabled = true;

            // Simulate API Call
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;
                
                showToast("Login Successful! Redirecting...", "success");

                // REDIRECT TO SUPERADMIN
                setTimeout(() => {
                    window.location.href = "superadmin.html";
                }, 1500); 

            }, 2000);
        });
    }

    // --- 8. REGISTER FORM SUBMISSION ---
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('reg-pass').value;
            const confirmPass = document.getElementById('reg-confirm-pass').value;

            if (pass !== confirmPass) {
                showToast("Passwords do not match!", "error");
                return;
            }

            const btn = registerForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                showToast("Account created! Please Login.", "success");
                registerBox.classList.add('hidden');
                loginBox.classList.remove('hidden');
            }, 2000);
        });
    }

    // --- 9. TOAST UTILITY ---
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
    }
});