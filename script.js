(function(){
    "use strict";
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    /* ---- sticky nav ---- */
    var nav = document.getElementById("nav");
    function onScroll(){ nav.classList.toggle("scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
  
    /* ---- active nav link ---- */
    var links = document.querySelectorAll(".nav-links a");
    var sections = ["home","about","solutions","academy","insights","contact"].map(function(id){return document.getElementById(id);});
    window.addEventListener("scroll", function(){
      var pos = window.scrollY + 140, current = "home";
      sections.forEach(function(s){ if(s && s.offsetTop <= pos) current = s.id; });
      links.forEach(function(a){ a.classList.toggle("active", a.getAttribute("href") === "#"+current); });
    }, {passive:true});
  
    /* ---- mobile menu ---- */
    var burger = document.getElementById("hamburger");
    var menu = document.getElementById("mobileMenu");
    burger.addEventListener("click", function(){
      var open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        menu.classList.remove("open"); burger.classList.remove("open");
        burger.setAttribute("aria-expanded","false"); document.body.style.overflow = "";
      });
    });
  
    /* ---- reveal on scroll ---- */
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  
    /* ---- hero network canvas ---- */
    var canvas = document.getElementById("network-canvas");
    var ctx = canvas.getContext("2d");
    var nodes = [], W = 0, H = 0, mouse = {x:-9999,y:-9999};
    function resize(){
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width * devicePixelRatio;
      H = canvas.height = r.height * devicePixelRatio;
      canvas.style.width = r.width+"px"; canvas.style.height = r.height+"px";
    }
    function initNodes(){
      nodes = [];
      var count = Math.min(70, Math.floor(W/28/devicePixelRatio));
      for(var i=0;i<count;i++){
        nodes.push({
          x: Math.random()*W, y: Math.random()*H,
          vx:(Math.random()-.5)*.22*devicePixelRatio, vy:(Math.random()-.5)*.22*devicePixelRatio,
          r:(Math.random()*1.6+1)*devicePixelRatio,
          o: Math.random()<.12
        });
      }
    }
    function tick(){
      ctx.clearRect(0,0,W,H);
      var linkDist = 130*devicePixelRatio;
      for(var i=0;i<nodes.length;i++){
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
        for(var j=i+1;j<nodes.length;j++){
          var m = nodes[j], dx=n.x-m.x, dy=n.y-m.y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<linkDist){
            ctx.strokeStyle = "rgba(0,239,255,"+(0.14*(1-d/linkDist)).toFixed(3)+")";
            ctx.lineWidth = devicePixelRatio*.7;
            ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(m.x,m.y); ctx.stroke();
          }
        }
        var mdx=n.x-mouse.x, mdy=n.y-mouse.y, md=Math.sqrt(mdx*mdx+mdy*mdy);
        if(md<160*devicePixelRatio){
          ctx.strokeStyle = "rgba(0,239,255,"+(0.25*(1-md/(160*devicePixelRatio))).toFixed(3)+")";
          ctx.lineWidth = devicePixelRatio*.8;
          ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle = n.o ? "rgba(255,109,0,.85)" : "rgba(0,239,255,.75)";
        ctx.fill();
      }
      if(!reduceMotion) requestAnimationFrame(tick);
    }
    resize(); initNodes();
    if(reduceMotion){ tick(); } else { requestAnimationFrame(tick); }
    window.addEventListener("resize", function(){ resize(); initNodes(); if(reduceMotion) tick(); });
    canvas.parentElement.addEventListener("mousemove", function(e){
      var r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left)*devicePixelRatio;
      mouse.y = (e.clientY - r.top)*devicePixelRatio;
    });
    canvas.parentElement.addEventListener("mouseleave", function(){ mouse.x = mouse.y = -9999; });
  
    /* ---- solution card glow follows cursor ---- */
    document.querySelectorAll(".sol-card").forEach(function(card){
      card.addEventListener("mousemove", function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX-r.left)/r.width*100)+"%");
        card.style.setProperty("--my", ((e.clientY-r.top)/r.height*100)+"%");
      });
    });
  
    /* ---- contact form ---- */
  var form = document.getElementById("contactForm");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    
    // Ubah teks tombol saat sedang loading
    var btn = form.querySelector('button[type="submit"]');
    var originalBtnContent = btn.innerHTML;
    btn.innerHTML = 'Mengirim Pesan...';
    
    // Ambil semua data dari formulir
    var formData = new FormData(form);
    
    // Kirim data ke server Web3Forms
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if(data.success) {
        // Jika sukses, sembunyikan formulir dan tampilkan pesan sukses
        form.style.display = "none";
        document.getElementById("formSuccess").classList.add("show");
      } else {
        // Jika gagal dari server
        alert('Maaf, terjadi kesalahan dari server. Silakan coba lagi.');
        btn.innerHTML = originalBtnContent;
      }
    })
    .catch(function(error) {
      // Jika internet putus atau error jaringan
      alert('Terjadi kesalahan jaringan. Periksa koneksi internet Anda.');
      btn.innerHTML = originalBtnContent;
    });
  });
  })();