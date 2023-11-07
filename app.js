function createState(listener) {
  // waiting, running
  let state = "waiting";
  let startAt = null;
  let history = [];

  return {
    get state() {
      return state;
    },
    get startAt() {
      return startAt;
    },
    get history() {
      return history;
    },
    get isCountingDown() {
      return state === "running" && startAt !== null && Date.now() < startAt;
    },

    clearHistory() {
      history = [];
    },

    onKey() {
      if (state === "waiting") {
        // start counting down
        startAt = Date.now() + 5000;
        state = "running";
      } else if (this.isCountingDown) {
        // cancel
        state = "waiting";
        startAt = null;
      } else if (!this.isCountingDown) {
        // end
        state = "waiting";
        history.push({
          startAt,
          endAt: Date.now(),
        });
        startAt = null;
      }
      listener();
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const timerEl = document.getElementById("timer");
  const historyEl = document.getElementById("history");

  let animationFrame;

  const startTimerAnimation = (renderFn) => {
    renderFn();
    animationFrame = requestAnimationFrame(() => startTimerAnimation(renderFn));
  };

  const stopTimerAnimation = () => cancelAnimationFrame(animationFrame);

  const render = () => {
    // render history
    historyEl.innerHTML = "";
    const listEl = document.createElement("ul");
    const avg = state.history.length
      ? state.history.reduce((acc, item) => {
          return acc + (item.endAt - item.startAt);
        }, 0) / state.history.length
      : 0;
    const avgEl = document.createElement("li");
    avgEl.className = "history-item";
    avgEl.textContent = `avg: ${(avg / 1000).toFixed(2)}`;
    listEl.appendChild(avgEl);
    state.history.forEach((item) => {
      const el = document.createElement("li");
      el.className = "history-item";
      el.textContent = ((item.endAt - item.startAt) / 1000).toFixed(2);
      listEl.appendChild(el);
    });
    historyEl.appendChild(listEl);

    // render timer
    switch (state.state) {
      case "waiting": {
        timerEl.textContent = "Press any key to start";
        timerEl.className = "waiting";
        stopTimerAnimation();
        break;
      }

      case "running": {
        startTimerAnimation(() => {
          const time = (Date.now() - state.startAt) / 1000;
          timerEl.textContent = Math.abs(time).toFixed(2);
          timerEl.className = "running";
          if (state.isCountingDown) {
            timerEl.classList.add("counting-down");
          }
        });
        break;
      }

      default: {
        throw new Error("invalid state");
      }
    }
  };

  const state = createState(() => {
    render();
  });
  render();

  document.addEventListener("keydown", (e) => {
    state.onKey();
  });
});
