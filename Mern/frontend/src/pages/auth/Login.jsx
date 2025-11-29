// src/pages/auth/Login.jsx
import React, { useEffect, useRef } from "react";
import "./Login.css";

export default function Login() {
  // Prefer environment var; fall back to literal only if you intentionally want to embed it.
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  const googleElRef = useRef(null);

  // Callback when Google returns credential (replace with your real handler)
  function handleCredentialResponse(response) {
    console.debug("[GSI] credential response:", response && !!response.credential);
    if (!response?.credential) {
      console.warn("[GSI] No credential returned.");
      return;
    }
    // Example: send to backend
    // fetch("/api/auth/google", { method: "POST", headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id_token: response.credential })})
    console.log("Google credential (JWT):", response.credential);
  }

  useEffect(() => {
    console.debug("[GSI] useEffect start, CLIENT_ID:", GOOGLE_CLIENT_ID || "(missing)");
    if (!GOOGLE_CLIENT_ID) {
      console.warn("[GSI] Missing Google client id.");
      return;
    }

    let cancelled = false;
    let tries = 0;
    const maxTries = 60;
    const delay = 200;

    async function waitForSDK() {
      while (!cancelled && (!window.google || !window.google.accounts || !window.google.accounts.id) && tries < maxTries) {
        tries++;
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, delay));
      }
      return !cancelled && !!(window.google && window.google.accounts && window.google.accounts.id);
    }

    async function initGSI() {
      const ok = await waitForSDK();
      if (!ok) {
        console.warn("[GSI] SDK not available after polling. Possibly blocked by extension or network.");
        return;
      }

      try {
        console.debug("[GSI] initializing...");
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          ux_mode: "popup",
          auto_select: false,
        });
        console.debug("[GSI] initialized.");
      } catch (e) {
        console.error("[GSI] initialize error:", e);
        return;
      }

      // Render into the container (container exists in JSX below)
      const target = googleElRef.current || document.getElementById("google-button");
      if (!target) {
        console.warn("[GSI] render target not found.");
        return;
      }

      // ensure element is present in DOM paint so SDK can attach handlers
      requestAnimationFrame(() => {
        try {
          target.innerHTML = "";
          if (window.google?.accounts?.id?.renderButton) {
            window.google.accounts.id.renderButton(target, {
              type: "icon",    // icon-only to be circular
              theme: "outline",
              size: "large",
              shape: "circle",
            });
            console.debug("[GSI] renderButton invoked.");
          } else {
            console.warn("[GSI] renderButton not available.");
          }
        } catch (err) {
          console.error("[GSI] renderButton threw:", err);
        }
      });
    }

    initGSI();
    return () => { cancelled = true; };
  }, [GOOGLE_CLIENT_ID]);

  // Visible round icon click -> prompt(); fallback to clicking official button
  function onGoogleClick() {
    console.debug("[GSI] onGoogleClick, google present?", !!window.google, "accounts.id?", !!window.google?.accounts?.id);
    // Preferred: call prompt() from user gesture
    if (window.google?.accounts?.id?.prompt) {
      try {
        window.google.accounts.id.prompt((notification) => {
          console.debug("[GSI] prompt notification:", notification);
          // If prompt isn't displayed for a reason, fallback below will run
        });
        return;
      } catch (err) {
        console.warn("[GSI] prompt threw:", err);
      }
    }

    // Fallback: attempt to click the official button the SDK rendered
    try {
      const target = googleElRef.current || document.getElementById("google-button");
      if (target) {
        const btn = target.querySelector("button");
        if (btn) { btn.click(); return; }
        console.debug("[GSI] fallback: no button found inside target; innerHTML:", target.innerHTML?.slice?.(0,160));
      }
    } catch (e) {
      console.warn("[GSI] fallback click error:", e);
    }

    // If everything fails
    alert("Google sign-in not available. Check console for GSI logs and disable adblockers/extensions.");
  }

  return (
    <div
      className="app-bg"
      style={{ backgroundImage: `url('/cover.png')` }}
    >
      <div className="login-container">
        <div className="hero-left">
          <h1 className="site-title">DigiLiB</h1>
          <p className="site-sub">welcome to the digital library @ calcutta university</p>
        </div>

        <div className="auth-card">
          <h2>Sign in</h2>

          <label className="lbl">Email</label>
          <input className="txt" type="email" placeholder="you@domain.com" />

          <label className="lbl">Password</label>
          <input className="txt" type="password" placeholder="••••••••" />

          <div className="error" style={{ display: "none" }}>Invalid credentials</div>

          <button className="btn-signin">Sign In</button>

          <div className="auth-footer">
            <button className="btn-ghost">Create account</button>

            {/* Container where SDK renders official button; keep present (not display:none) */}
            <div id="google-button" ref={googleElRef} className="google-wrapper" aria-hidden="true" style={{ width: 1, height: 1, opacity: 0, position: "absolute", pointerEvents: "none", overflow: "hidden" }} />

            {/* visible round icon */}
            <button type="button" onClick={onGoogleClick} className="google-circle" title="Sign in with Google" aria-label="Sign in with Google">
              <svg viewBox="0 0 533.5 544.3" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path fill="#4285F4" d="M533.5 278.4c0-17.9-1.6-35.1-4.6-51.7H272v98h146.9c-6.4 34.7-25.4 64.1-54.2 83.8v69.9h87.5c51.2-47.2 80.3-116.7 80.3-199.9z"/>
                <path fill="#34A853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.3l-87.5-69.9c-24.4 16.4-55.6 26-93.3 26-71.6 0-132.3-48.3-154-113.1H27.8v71.3C72 470 165 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M118 322.9c-10.9-32.7-10.9-67.9 0-100.6V151h-90.2C9.8 206.2 0 239.6 0 273s9.8 66.8 27.8 122l90.2-72.1z"/>
                <path fill="#EA4335" d="M272 106.1c39.9 0 75.8 13.7 104 40.7l78-78C407.6 24.9 344.8 0 272 0 165 0 72 74.3 27.8 173l90.2 72.1C139.7 154.4 200.4 106.1 272 106.1z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
