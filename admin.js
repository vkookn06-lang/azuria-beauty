
const DATA_KEY='azuria_store_data_v1', ORDERS_KEY='azuria_orders_v1', PASS='azuria2026';
let data={products:[],settings:{}};
async function start(){
  if(localStorage.getItem(DATA_KEY))data=JSON.parse(localStorage.getItem(DATA_KEY));
  else{data=await (await fetch('data.json')).json();localStorage.setItem(DATA_KEY,JSON.stringify(data))}
  document.getElementById('login').onclick=login;
}
function login(){if(document.getElementById('password').value!==PASS)return alert('كلمة المرور غير صحيحة');document.getElementById('loginPanel').style.display='none';document.getElementById('admin').style.display='block';render()}
function save(){localStorage.setItem(DATA_KEY,JSON.stringify(data));render()}
function render(){
 document.getElementById('wa').value=data.settings.whatsapp||'';document.getElementById('ann').value=data.settings.announcement||'';document.getElementById('hero').value=data.settings.heroTitle||'';document.getElementById('heroTextAdmin').value=data.settings.heroText||'';
 document.getElementById('rows').innerHTML=data.products.map((p,i)=>`<tr><td>${p.name}</td><td>${p.brand}</td><td>${p.price}₪</td><td>${p.stock}</td><td><button class="btn secondary" onclick="editP(${i})">تعديل</button> <button class="btn danger" onclick="delP(${i})">حذف</button></td></tr>`).join('');
 const orders=JSON.parse(localStorage.getItem(ORDERS_KEY)||'[]');document.getElementById('orders').innerHTML=orders.length?orders.map(o=>`<tr><td>${o.orderNo}</td><td>${o.name}</td><td>${o.total}₪</td><td>${o.status}</td><td>${new Date(o.createdAt).toLocaleString('ar')}</td></tr>`).join(''):'<tr><td colspan="5">لا توجد طلبات بعد.</td></tr>';
}
function saveSettings(){data.settings={...data.settings,whatsapp:wa.value.trim(),announcement:ann.value.trim(),heroTitle:hero.value.trim(),heroText:heroTextAdmin.value.trim()};save();alert('تم حفظ الإعدادات')}
function addP(){const p={id:Date.now(),name:pName.value.trim(),brand:pBrand.value.trim(),category:pCat.value.trim(),price:Number(pPrice.value),oldPrice:Number(pOld.value||0),shade:pShade.value.trim(),badge:pBadge.value.trim(),stock:Number(pStock.value||0)};if(!p.name||!p.brand||!p.price)return alert('عبّي الاسم والبراند والسعر');data.products.push(p);save();['pName','pBrand','pCat','pPrice','pOld','pShade','pBadge','pStock'].forEach(x=>document.getElementById(x).value='')}
function delP(i){if(confirm('حذف المنتج؟')){data.products.splice(i,1);save()}}
function editP(i){const p=data.products[i],name=prompt('اسم المنتج',p.name);if(name===null)return;p.name=name;p.price=Number(prompt('السعر',p.price)||p.price);p.stock=Number(prompt('الكمية',p.stock)||p.stock);save()}
document.addEventListener('DOMContentLoaded',start);
