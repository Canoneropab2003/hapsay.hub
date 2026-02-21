document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Target "Home" (The first .nav-link-item)
    const homeBtn = document.querySelectorAll('.nav-link-item')[0];
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    // 2. Target "About Us" (The second .nav-link-item)
    const aboutBtn = document.querySelectorAll('.nav-link-item')[1];
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            window.location.href = "aboutus.html";
        });
    }

    // 3. Target "Join Us" (Using its unique class)
    const joinBtn = document.querySelector('.btn-join');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            window.location.href = "pricing.html";
        });
    }

    // 4. Target "Sign up" (Using its unique class)
    const signupBtn = document.querySelector('.btn-signup');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = "login.html";
        });
    }
});