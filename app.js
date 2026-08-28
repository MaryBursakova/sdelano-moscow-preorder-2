
const state = {
  category: "Все",
  cart: {}
};

const menuEl = document.getElementById("menu");
const chipsEl = document.getElementById("chips");
const cartbar = document.getElementById("cartbar");
const overlay = document.getElementById("overlay");
const sheetContent = document.getElementById("sheetContent");

function store(){ return ensureStore(); }
function format(n){ return n.toLocaleString("ru-RU") + " ₽"; }

function getProduct(id){ return MENU.find(p => p.id === id); }

function renderChips(){
  const cats = ["Все", ...new Set(MENU.map(x=>x.category))];
  chipsEl.innerHTML = cats.map(c => `<button class="chip ${state.category===c?'active':''}" data-cat="${c}">${c}</button>`).join("");
  chipsEl.querySelectorAll("[data-cat]").forEach(btn=>{
    btn.onclick = ()=>{ state.category=btn.dataset.cat; render(); };
  });
}

function renderMenu(){
  const s = store();
  const list = MENU.filter(p => state.category==="Все" || p.category===state.category);
  menuEl.innerHTML = list.map(p=>{
    const st = s.products[p.id] || {stock:0, enabled:false};
    const left = Math.max(0, st.stock);
    const disabled = !st.enabled || left <= 0;
    const cls = left===0 ? "zero" : left<=3 ? "low" : "";
    return `
      <article class="card">
        <img class="photo" src="assets/products/${p.image}" alt="${p.name}">
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          <div class="card-meta">
            <div>
              <div class="price">${format(p.price)}</div>
              <div class="stock ${cls}">${disabled ? "нет в наличии" : `осталось ${left}`}</div>
            </div>
            <button class="add" data-add="${p.id}" ${disabled?'disabled':''}>+</button>
          </div>
        </div>
      </article>`;
  }).join("");
  menuEl.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.add));
}

function addToCart(id){
  const s = store();
  const available = s.products[id]?.stock || 0;
  const current = state.cart[id] || 0;
  if(current >= available) return;
  state.cart[id] = current + 1;
  renderCartbar();
}

function cartCount(){ return Object.values(state.cart).reduce((a,b)=>a+b,0); }
function cartTotal(){ return Object.entries(state.cart).reduce((sum,[id,q])=>sum+getProduct(id).price*q,0); }

function renderCartbar(){
  const count = cartCount();
  if(!count){
    cartbar.classList.add("empty");
    cartbar.innerHTML = `<span>Корзина пуста</span><span>0 ₽</span>`;
  }else{
    cartbar.classList.remove("empty");
    cartbar.innerHTML = `<span>Корзина · ${count}</span><span>${format(cartTotal())}</span>`;
  }
}

function openCart(){
  if(!cartCount()) return;
  renderSheet();
  overlay.classList.add("open");
}

function changeQty(id,delta){
  const s = store();
  const max = s.products[id]?.stock || 0;
  const next = Math.max(0, Math.min(max,(state.cart[id]||0)+delta));
  if(next===0) delete state.cart[id]; else state.cart[id]=next;
  renderCartbar();
  renderSheet();
}

function renderSheet(){
  const rows = Object.entries(state.cart).map(([id,q])=>{
    const p=getProduct(id);
    return `<div class="cart-item">
      <div><b>${p.name}</b><div class="small">${format(p.price)}</div></div>
      <div class="qty"><button data-q="${id}" data-d="-1">−</button><b>${q}</b><button data-q="${id}" data-d="1">+</button></div>
    </div>`;
  }).join("");
  sheetContent.innerHTML = `
    <div class="sheet-head"><h2>Ваш заказ</h2><button class="close" id="closeSheet">✕</button></div>
    ${rows}
    <div class="total"><span>Итого</span><span>${format(cartTotal())}</span></div>
    <button class="primary" id="makeOrder">Перейти к оплате</button>
    <div class="note">После оформления покажем QR для оплаты.</div>`;
  document.getElementById("closeSheet").onclick=()=>overlay.classList.remove("open");
  sheetContent.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>changeQty(b.dataset.q,Number(b.dataset.d)));
  document.getElementById("makeOrder").onclick=createOrder;
}

function createOrder(){
  const s=store();
  for(const [id,q] of Object.entries(state.cart)){
    const item=s.products[id];
    if(!item || !item.enabled || item.stock<q){
      alert(`Недостаточно остатка: ${getProduct(id).name}`);
      render();
      return;
    }
  }
  for(const [id,q] of Object.entries(state.cart)) s.products[id].stock -= q;
  const num = "A-" + String((s.orders.at(-1)?.seq || 126) + 1);
  const seq = Number(num.split("-")[1]);
  const order = {
    id: crypto.randomUUID(),
    seq,
    number:num,
    createdAt:new Date().toISOString(),
    total:cartTotal(),
    status:"NEW",
    items:Object.entries(state.cart).map(([id,q])=>({id,qty:q}))
  };
  s.orders.push(order);
  saveStore(s);
  state.cart={};
  renderCartbar();
  sheetContent.innerHTML=`
    <div class="sheet-head"><h2>Заказ принят</h2><button class="close" id="closeSheet">✕</button></div>
    <div class="success">
      <div class="small">Ваш номер заказа</div>
      <div class="order-number">${order.number}</div>
      <div style="font-size:22px;font-weight:900">${format(order.total)}</div>
      <div class="payment-box">
        <p class="payment-title">Переходи по QR для оплаты, только внеси сумму по своему заказу</p>
        <img class="payment-qr" src="assets/payment-qr.jpg" alt="QR для оплаты">
        <p class="payment-hint">После оплаты покажите банковский чек бариста при получении.</p>
      </div>
    </div>`;
  document.getElementById("closeSheet").onclick=()=>overlay.classList.remove("open");
  render();
}

function render(){
  renderChips();
  renderMenu();
  renderCartbar();
}
cartbar.onclick=openCart;
overlay.onclick=e=>{ if(e.target===overlay) overlay.classList.remove("open"); };
window.addEventListener("storage",render);
render();
