<script lang="ts">
  let copied = false;
  const seats = ['NORD', 'EST', 'SUD', 'OVEST'];
</script>
<svelte:head>
  <meta name="description" content="Belot: Bridge-Belot online, in quattro giocatori." />
</svelte:head>
<main>
  <header><div class="mark">B<span>♠</span></div><div><strong>BELOT</strong><small>BRIDGE · ONLINE</small></div><span class="status">● MVP IN SVILUPPO</span></header>
  <section class="hero">
    <p class="eyebrow">IL TAVOLO È TUO</p>
    <h1>Quattro giocatori.<br/><em>Una sola</em> partita.</h1>
    <p class="intro">Bridge-Belot, senza download. Stiamo preparando il tavolo: regole verificabili, partite online e avversari automatici.</p>
    <button onclick={() => copied = true}>{copied ? 'PRESTO ONLINE' : 'GIOCA — PROSSIMAMENTE'}</button>
    <small class="note">La lobby multiplayer non è ancora attiva.</small>
  </section>
  <section class="table" aria-label="Anteprima tavolo Belot">
    <div class="seat north">{seats[0]} <b>♣</b></div><div class="seat east">{seats[1]} <b>♦</b></div>
    <div class="seat south">{seats[2]} <b>♥</b></div><div class="seat west">{seats[3]} <b>♠</b></div>
    <div class="center"><div class="card red">A<br/><span>♥</span></div><div class="card">J<br/><span>♠</span></div><div class="card red">10<br/><span>♦</span></div></div>
    <div class="table-label">TAVOLO DEMO · 4 POSTI</div>
  </section>
  <footer><span>© 2026 BELOT</span><span>OPEN SOURCE · MIT</span><span>FASE 0 — FOUNDATION</span></footer>
</main>
<style>
  :global(*){box-sizing:border-box} :global(body){margin:0;background:#0b1713;color:#f2f0e8;font-family:Inter,ui-sans-serif,system-ui,sans-serif} main{max-width:1100px;margin:auto;padding:28px clamp(20px,5vw,64px)} header{display:flex;align-items:center;gap:12px;border-bottom:1px solid #ffffff20;padding-bottom:22px}.mark{width:42px;height:42px;border:1px solid #d7b66d;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:23px;color:#d7b66d}.mark span{font-size:13px}header strong{display:block;letter-spacing:.18em;font-size:14px}header small{display:block;color:#a6b1a8;font-size:9px;letter-spacing:.2em;margin-top:3px}.status{margin-left:auto;color:#d7b66d;font-size:10px;letter-spacing:.12em}.hero{max-width:600px;padding:74px 0 44px}.eyebrow{color:#d7b66d;letter-spacing:.25em;font-size:10px;font-weight:800}h1{font-size:clamp(48px,8vw,86px);line-height:.98;letter-spacing:-.065em;margin:18px 0 22px}h1 em{font-family:Georgia,serif;color:#d7b66d;font-weight:400}.intro{max-width:450px;color:#aab7ae;line-height:1.7;font-size:15px}button{margin-top:24px;background:#d7b66d;color:#142019;border:0;border-radius:4px;padding:15px 22px;font-weight:900;letter-spacing:.1em;font-size:11px}.note{display:block;color:#829087;margin-top:12px;font-size:11px}.table{height:300px;max-width:690px;margin:12px auto 40px;position:relative;border:10px solid #25382e;border-radius:180px;background:radial-gradient(ellipse,#1e6445,#12432f 70%,#0d3426);box-shadow:inset 0 0 0 1px #78a18455,0 18px 55px #0008}.seat{position:absolute;color:#d7dfd7;font-size:9px;letter-spacing:.15em}.seat b{font-size:15px;margin-left:5px}.north{top:16px;left:50%;transform:translateX(-50%)}.south{bottom:16px;left:50%;transform:translateX(-50%)}.east{right:22px;top:50%;transform:translateY(-50%)}.west{left:22px;top:50%;transform:translateY(-50%)}.center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;gap:7px}.card{width:48px;height:68px;background:#f6f2e7;color:#17231c;border-radius:5px;padding:6px;font-weight:900;box-shadow:0 5px 12px #0006;transform:rotate(5deg)}.card:nth-child(2){transform:translateY(-7px) rotate(-3deg)}.card span{display:block;text-align:center;font-size:23px}.red{color:#b53b37}.table-label{position:absolute;bottom:47px;left:50%;transform:translateX(-50%);font-size:8px;color:#a9c6b4;letter-spacing:.2em;white-space:nowrap}footer{border-top:1px solid #ffffff20;padding-top:18px;display:flex;justify-content:space-between;gap:12px;color:#718077;font-size:9px;letter-spacing:.13em}@media(max-width:560px){.hero{padding-top:56px}.table{height:245px;border-width:7px}.east{right:8px}.west{left:8px}footer{flex-wrap:wrap}.status{font-size:8px}}
</style>
