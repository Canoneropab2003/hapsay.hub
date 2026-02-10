document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION ---
    const GOOGLE_CLIENT_ID = "430731112851-r0k1j8s3f94629lljiec0377tdojs9e6.apps.googleusercontent.com";
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

    if (forgotLink && forgotPopup) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPopup.classList.remove('hidden');
            forgotPopup.classList.add('active'); 
            setTimeout(() => { if(resetEmailInput) resetEmailInput.focus(); }, 100);
        });
    }

    function closeResetModal() {
        if (forgotPopup) {
            forgotPopup.classList.remove('active');
            setTimeout(() => forgotPopup.classList.add('hidden'), 300);
        }
    }

    if (closeForgotBtn) closeForgotBtn.addEventListener('click', closeResetModal);
    if (forgotPopup) forgotPopup.addEventListener('click', (e) => { if (e.target === forgotPopup) closeResetModal(); });

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

    // --- 4. TOGGLE VIEW & PASSWORD VISIBILITY ---
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

    // Toggle Password Eye Icons
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

    // --- 5. SOCIAL LOGIN HANDLERS ---
    const fbBtn = document.getElementById('fb-login-btn');
    if (fbBtn) {
        fbBtn.addEventListener('click', () => {
            if (typeof FB === 'undefined') { showToast("FB SDK not loaded.", "error"); return; }
            FB.login((r) => { 
                if(r.status==='connected') {
                    FB.api('/me', {fields:'name'}, (p)=> {
                        showToast(`Welcome ${p.name}! Redirecting...`, 'success');
                        // Redirect for Facebook too
                        setTimeout(() => window.location.href = "superadmin.html", 1500);
                    }); 
                }
            }, {scope:'email'});
        });
    }

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
                // Redirect for Google too
                setTimeout(() => window.location.href = "superadmin.html", 1500);
            })
            .catch(err => showToast("Google Login Failed", "error"));
        }
    }

    // --- 6. MAIN LOGIN FORM (REDIRECT LOGIC HERE) ---
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            const btn = document.querySelector('.login-btn');
            const originalText = btn.innerHTML;
            
            // 1. Show Loading Spinner
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Loading...';
            btn.style.opacity = "0.7";
            btn.disabled = true;

            // 2. Simulate API Call (2 Seconds)
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;
                
                // 3. Show Success Toast
                showToast("Login Successful! Redirecting...", "success");

                // 4. REDIRECT TO SUPERADMIN.HTML
                setTimeout(() => {
                    window.location.href = "superadmin.html";
                }, 1500); // 1.5s delay so user sees the success message

            }, 2000);
        });
    }

    // --- 7. REGISTER FORM ---
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

    // --- 8. TOAST UTILITY ---
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