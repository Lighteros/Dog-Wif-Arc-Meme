(() => {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  const spot = document.querySelector(".spot");
  const canvas = document.getElementById("orbit-field");
  const ctx = canvas.getContext("2d", { alpha: true });
  const addArc = document.getElementById("add-arc");
  const caChip = document.querySelector(".ca-chip");
  const caStatus = document.getElementById("ca-status");

  nav.classList.add("ready");

  const lifts = document.querySelectorAll(".lift");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    lifts.forEach((node) => io.observe(node));
  } else {
    lifts.forEach((node) => node.classList.add("in"));
  }

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.addEventListener("click", (event) => {
    if (event.target.tagName === "A") closeNav();
  });

  window.addEventListener("scroll", () => {
    nav.classList.toggle("compact", window.scrollY > 24);
  }, { passive: true });

  window.addEventListener("pointermove", (event) => {
    spot.style.left = `${event.clientX}px`;
    spot.style.top = `${event.clientY}px`;
  });

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      window.prompt("Copy contract address", value);
      return false;
    }
  };

  caChip.addEventListener("click", async () => {
    const value = caChip.getAttribute("data-copy") || "TBA";
    await copyValue(value);
    caStatus.textContent = "Copied";
    window.setTimeout(() => {
      caStatus.textContent = "Copy";
    }, 1600);
  });

  addArc.addEventListener("click", async () => {
    if (!window.ethereum) {
      window.open("https://app.uniswap.org/swap?chain=arc", "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x13b2",
          chainName: "Arc",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
          rpcUrls: ["https://rpc.mainnet.arc.io"],
          blockExplorerUrls: ["https://explorer.arc.io"]
        }]
      });
    } catch (error) {
      console.warn(error);
    }
  });

  const stars = [];
  const arcs = [];
  let width = 0;
  let height = 0;
  let tick = 0;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars.length = 0;
    const count = Math.min(140, Math.floor((width * height) / 18000));
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.3,
        s: Math.random() * 0.4 + 0.1,
        a: Math.random() * 0.6 + 0.15
      });
    }
    arcs.length = 0;
    for (let i = 0; i < 4; i += 1) {
      arcs.push({
        x: width * (0.2 + i * 0.2),
        y: height * (0.25 + (i % 2) * 0.18),
        w: 180 + i * 70,
        h: 70 + i * 18,
        o: i * 0.8
      });
    }
  };

  const draw = () => {
    tick += 1;
    ctx.clearRect(0, 0, width, height);
    stars.forEach((star) => {
      star.y -= star.s;
      if (star.y < -4) {
        star.y = height + 4;
        star.x = Math.random() * width;
      }
      const pulse = star.a + Math.sin((tick + star.x) * 0.02) * 0.12;
      ctx.beginPath();
      ctx.fillStyle = `rgba(186, 224, 255, ${pulse})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    arcs.forEach((arc, index) => {
      const wobble = Math.sin(tick * 0.008 + arc.o) * 18;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(78, 182, 255, ${0.08 + index * 0.03})`;
      ctx.lineWidth = 2;
      ctx.ellipse(arc.x, arc.y + wobble, arc.w, arc.h, Math.sin(tick * 0.002 + index) * 0.2, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    });

    window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
})();
