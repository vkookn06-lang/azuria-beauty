
const DEFAULT_KEY='azuria_store_data_v1', CART_KEY='azuria_cart_v1', ORDERS_KEY='azuria_orders_v1';
let state={products:[],settings:{}}, cart=[], activeBrand='';

async function init(){
  const cached=localStorage.getItem(DEFAULT_KEY);
  if(cached){ state=JSON.parse(cached); }
  else{
    const res=await fetch('data.json'); state=await res.json();
    localStorage.setItem(DEFAULT_KEY,JSON.stringify(state));
  }
  cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]');
  renderSettings(); renderBrands(); renderProducts(); renderCart();
  bind();
}
function initials(s){return s.split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase()}
function renderSettings(){
  document.getElementById('announcement').textContent=state.settings.announcement;
  document.getElementById('heroTitle').textContent=state.settings.heroTitle;
  document.getElementById('heroText').textContent=state.settings.heroText;
}
function brands(){return [...new Set(state.products.map(p=>p.brand))]}
function renderBrands(){
  const box=document.getElementById('brandGrid');
  box.innerHTML=brands().map(b=>`<button class="brand-card" data-brand="${b}" type="button"><span class="brand-mark">${initials(b)}</span><strong>${b}</strong><small>EXPLORE →</small></button>`).join('');
  document.getElementById('brandFilter').innerHTML='<option value="">كل البراندات</option>'+brands().map(b=>`<option>${b}</option>`).join('');
  box.querySelectorAll('.brand-card').forEach(btn=>btn.onclick=()=>{activeBrand=btn.dataset.brand;document.getElementById('brandFilter').value=activeBrand;renderProducts();document.getElementById('shop').scrollIntoView({behavior:'smooth'})});
}
function filtered(){
  const q=document.getElementById('search').value.trim().toLowerCase();
  const brand=document.getElementById('brandFilter').value;
  const cat=document.getElementById('categoryFilter').value;
  return state.products.filter(p=>(!q||(p.name+' '+p.brand).toLowerCase().includes(q))&&(!brand||p.brand===brand)&&(!cat||p.category===cat));
}
function renderProducts(){
  const list=filtered(), box=document.getElementById('productGrid');
  box.innerHTML=list.length?list.map(p=>`<article class="product"><div class="product-image">${p.badge?`<span class="badge">${p.badge}</span>`:''}${initials(p.brand)}</div><div class="product-body"><div class="product-brand">${p.brand}</div><h3>${p.name}</h3><div><span class="price">${p.price} ₪</span>${p.oldPrice?`<span class="old">${p.oldPrice} ₪</span>`:''}</div><small>الدرجات: ${p.shade}</small><button class="add" data-id="${p.id}" ${p.stock<1?'disabled':''}>${p.stock<1?'نفد من المخزون':'إضافة للسلة'}</button></div></article>`).join(''):'<div class="empty">لا توجد منتجات مطابقة.</div>';
  box.querySelectorAll('.add').forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.id)));
}
function addToCart(id){
  const p=state.products.find(x=>x.id===id), item=cart.find(x=>x.id===id);
  if(item)item.qty++;else cart.push({...p,qty:1});
  saveCart(); openCart();
}
function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart()}
function renderCart(){
  document.getElementById('cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);
  const box=document.getElementById('cartItems');
  box.innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-row"><div><b>${p.name}</b><br><small>${p.brand} — ${p.shade}</small></div><div><div>${p.price*p.qty} ₪</div><div class="qty"><button data-a="minus" data-i="${i}">−</button><span>${p.qty}</span><button data-a="plus" data-i="${i}">+</button><button data-a="remove" data-i="${i}">×</button></div></div></div>`).join(''):'<p>السلة فارغة.</p>';
  document.getElementById('cartTotal').textContent=cart.reduce((s,p)=>s+p.price*p.qty,0);
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i),a=b.dataset.a;if(a==='plus')cart[i].qty++;if(a==='minus')cart[i].qty=Math.max(1,cart[i].qty-1);if(a==='remove')cart.splice(i,1);saveCart()});
}
function openCart(){document.getElementById('cartDrawer').classList.add('open')}
function createOrder(){
  const name=document.getElementById('name').value.trim(),phone=document.getElementById('phone').value.trim(),address=document.getElementById('address').value.trim(),notes=document.getElementById('notes').value.trim();
  if(!cart.length)return alert('السلة فارغة');
  if(!name||!phone||!address)return alert('عبّي الاسم ورقم الهاتف والعنوان');
  const orderNo='AZ-'+Date.now().toString().slice(-6);
  const total=cart.reduce((s,p)=>s+p.price*p.qty,0);
  const order={orderNo,name,phone,address,notes,total,items:cart,createdAt:new Date().toISOString(),status:'بانتظار التأكيد'};
  const orders=JSON.parse(localStorage.getItem(ORDERS_KEY)||'[]');orders.unshift(order);localStorage.setItem(ORDERS_KEY,JSON.stringify(orders));
  const details=cart.map(p=>`• ${p.name} — ${p.brand} ×${p.qty} — ${p.price*p.qty}₪`).join('\n');
  const msg=`مرحبًا AZURIA 💙\nأريد تأكيد الطلب رقم ${orderNo}\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\n${notes?'ملاحظات: '+notes+'\n':''}\nالمنتجات:\n${details}\n\nالمجموع: ${total}₪`;
  const wa=state.settings.whatsapp||'';
  const url=`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  const success=document.getElementById('success');success.style.display='block';success.innerHTML=`تم إنشاء الطلب بنجاح<br><b>${orderNo}</b><br><br><a class="btn" href="${url}" target="_blank">تأكيد عبر واتساب</a>`;
}
function bind(){
  document.getElementById('shopNow').onclick=()=>document.getElementById('brands').scrollIntoView({behavior:'smooth'});
  document.getElementById('cartButton').onclick=openCart;
  document.getElementById('closeCart').onclick=()=>document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('createOrder').onclick=createOrder;
  ['search','brandFilter','categoryFilter'].forEach(id=>document.getElementById(id).oninput=renderProducts);
}
document.addEventListener('DOMContentLoaded',init);
