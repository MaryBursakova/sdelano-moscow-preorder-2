
function store(){ return ensureStore(); }
function format(n){ return n.toLocaleString("ru-RU")+" ₽"; }
function product(id){ return MENU.find(p=>p.id===id); }

function changeStock(id,delta){
  const s=store();
  s.products[id].stock=Math.max(0,(s.products[id].stock||0)+delta);
  saveStore(s); render();
}
function setExact(id){
  const s=store();
  const val=prompt("Установить доступное количество:",s.products[id].stock);
  if(val===null) return;
  const n=Math.max(0,parseInt(val||"0",10));
  s.products[id].stock=n; saveStore(s); render();
}
function toggle(id){
  const s=store(); s.products[id].enabled=!s.products[id].enabled; saveStore(s); render();
}
function setStatus(orderId,status){
  const s=store();
  const o=s.orders.find(x=>x.id===orderId);
  if(o){ o.status=status; saveStore(s); render(); }
}
function statusLabel(s){
  return ({NEW:"Новый",PREPARING:"Готовится",READY:"Готов",ISSUED:"Выдан"})[s]||s;
}
function renderProducts(){
  const s=store();
  document.getElementById("adminProducts").innerHTML=MENU.map(p=>{
    const st=s.products[p.id];
    return `<div class="admin-card ${st.enabled?'':'off'}">
      <div class="admin-top">
        <div><div class="admin-name">${p.name}</div><div class="small">${p.category}</div></div>
        <span class="badge">${st.enabled?'В продаже':'Выключен'}</span>
      </div>
      <div class="admin-stock">${st.stock}</div>
      <div class="small" style="margin-top:-8px;margin-bottom:10px">доступно для новых заказов</div>
      <div class="controls">
        <button onclick="changeStock('${p.id}',-5)">−5</button>
        <button onclick="changeStock('${p.id}',-1)">−1</button>
        <button onclick="changeStock('${p.id}',1)">+1</button>
        <button onclick="changeStock('${p.id}',5)">+5</button>
        <button class="main" onclick="setExact('${p.id}')">Установить</button>
        <button class="danger" onclick="toggle('${p.id}')">${st.enabled?'Нет в наличии':'Вернуть'}</button>
      </div>
    </div>`;
  }).join("");
}
function renderOrders(){
  const s=store();
  const orders=[...s.orders].reverse();
  const el=document.getElementById("orders");
  if(!orders.length){ el.innerHTML='<div class="small">Заказов пока нет.</div>'; return; }
  el.innerHTML=orders.map(o=>{
    const items=o.items.map(i=>`${product(i.id).name} × ${i.qty}`).join("<br>");
    return `<div class="order-row">
      <div class="order-row-head"><span>${o.number}</span><span>${format(o.total)}</span></div>
      <div class="small" style="margin-top:6px">${new Date(o.createdAt).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}</div>
      <div style="margin-top:8px">${items}</div>
      <div style="margin-top:8px"><span class="badge">${statusLabel(o.status)}</span></div>
      <div class="status-btns">
        <button onclick="setStatus('${o.id}','NEW')">Новый</button>
        <button onclick="setStatus('${o.id}','PREPARING')">Готовится</button>
        <button onclick="setStatus('${o.id}','READY')">Готов</button>
        <button onclick="setStatus('${o.id}','ISSUED')">Выдан</button>
      </div>
    </div>`;
  }).join("");
}
function resetDemo(){
  if(!confirm("Сбросить все остатки и заказы к начальному состоянию?")) return;
  localStorage.removeItem(STORE_KEY); ensureStore(); render();
}
function render(){ renderProducts(); renderOrders(); }
window.addEventListener("storage",render);
render();
