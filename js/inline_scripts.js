
    (function() {
        var totalSeconds = 4 * 60 + 59; // 4m 59s
        var timerEl = document.getElementById('restock-timer');
        function updateTimer() {
            var m = Math.floor(totalSeconds / 60);
            var s = totalSeconds % 60;
            if (timerEl) timerEl.textContent = m + 'm ' + (s < 10 ? '0' : '') + s + 's';
            if (totalSeconds > 0) {
                totalSeconds--;
            } else {
                totalSeconds = 4 * 60 + 59; // reset
            }
        }
        updateTimer();
        setInterval(updateTimer, 1000);
    })();
    