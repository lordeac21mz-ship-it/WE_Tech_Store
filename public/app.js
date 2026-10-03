const $=s=>document.querySelector(s);
let products=[],cart=JSON.parse(localStorage.getItem("we_cart")||"[]"),me=null;

function toast(t){const e=$("#toast");e.textContent=t;e.style.display="block";setTimeout(()=>e.style.display="none",2600)}
function money(v){return `${Number(v).toFixed(2)} MT`}
async function api(url,opt={}){const r=await fetch(url,{headers:{"Content-Type":"application/json",...(opt.headers||{})},...opt});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Erro");return d}

async function load(){
  products=await api("/api/products"); renderProducts();
  const m=await api("/api/me"); me=m.loggedIn?m.user:null; updateAccountButton(); updateCart();
}
function renderProducts(){
  $("#products").innerHTML=products.map(p=>`
    <article class="card">
      <div class="productImage">${p.image_url?`<img src="${p.image_url}" alt="">`:`<div class="productIcon">${p.icon||"🎮"}</div>`}</div>
      <div class="cardBody">
        <h3>${esc(p.name)}</h3><div class="desc">${esc(p.description||"")}</div>
        <div class="price">${money(p.price)}</div><div class="stock">${p.stock>0?`${p.stock} disponível(is)`:"Esgotado"}</div>
        <button class="buy" ${p.stock<1?"disabled":""} onclick="add(${p.id})">Adicionar ao carrinho</button>
      </div>
    </article>`).join("")||`<p class="muted">Ainda não existem produtos.</p>`;
}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function add(id){const p=products.find(x=>x.id===id);if(!p)return;const x=cart.find(x=>x.id===id);if(x)x.q++;else cart.push({id,q:1});saveCart();toast("Produto adicionado ao carrinho.")}
function saveCart(){localStorage.setItem("we_cart",JSON.stringify(cart));updateCart()}
function updateCart(){$("#cartMini").innerHTML=`🛒 <span>${cart.reduce((a,x)=>a+x.q,0)}</span>`}
$("#cartMini").onclick=()=>openCart();

function updateAccountButton(){$("#accountBtn").textContent=me?`Olá, ${me.name.split(" ")[0]}`:"Conta"}
$("#accountBtn").onclick=()=>openAccount();
$("#shareBtn").onclick=async()=>{
  try{
    const d=await api("/api/share",{method:"POST"});
    if(navigator.share) await navigator.share({title:"WE Tech",text:"Conhece a WE Tech",url:location.href});
    else {await navigator.clipboard.writeText(location.href);toast("Link copiado para partilhar!")}
  }catch(e){toast("Não foi possível partilhar.")}
};
$("#gearBtn").onclick=()=>openAdmin();
document.querySelectorAll("[data-close]").forEach(x=>x.onclick=()=>x.closest(".modal").classList.add("hidden"));

function openAccount(){
  $("#accountModal").classList.remove("hidden");
  if(me) showAccount();
  else showLogin();
}
function showLogin(){
  $("#accountContent").innerHTML=`<h2>Entrar</h2><p class="muted">Entra na tua conta para acompanhar compras.</p>
  <form class="form" id="loginForm"><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Palavra-passe" required><button class="primary">Entrar</button></form>
  <p class="muted">Ainda não tens conta? <button class="smallBtn" onclick="showRegister()">Criar conta</button></p>`;
  $("#loginForm").onsubmit=async e=>{e.preventDefault();try{const f=new FormData(e.target);const d=await api("/api/login",{method:"POST",body:JSON.stringify(Object.fromEntries(f))});me=d.user;updateAccountButton();showAccount();toast("Sessão iniciada.")}catch(x){toast(x.message)}};
}
function showRegister(){
  $("#accountContent").innerHTML=`<h2>Criar conta</h2><p class="muted">Os teus dados ficam associados às tuas compras.</p>
  <form class="form" id="regForm"><input name="name" placeholder="Nome completo" required><input name="email" type="email" placeholder="Email" required><input name="phone" placeholder="Telefone / WhatsApp"><input name="password" type="password" placeholder="Palavra-passe (mín. 6)" required><button class="primary">Criar conta</button></form>
  <p class="muted">Já tens conta? <button class="smallBtn" onclick="showLogin()">Entrar</button></p>`;
  $("#regForm").onsubmit=async e=>{e.preventDefault();try{const f=new FormData(e.target);const d=await api("/api/register",{method:"POST",body:JSON.stringify(Object.fromEntries(f))});me=d.user;updateAccountButton();showAccount();toast("Conta criada.")}catch(x){toast(x.message)}};
}
async function showAccount(){
  const orders=await api("/api/my/orders");
  $("#accountContent").innerHTML=`<h2>Minha conta</h2><p>Olá, <b>${esc(me.name)}</b></p><p class="muted">${esc(me.email)} ${me.phone?`• ${esc(me.phone)}`:""}</p>
  <h3>Histórico de compras</h3><div class="orders">${orders.length?orders.map(o=>`<div class="order"><b>Compra #${o.id}</b> — ${money(o.total)}<div class="muted">${new Date(o.created_at).toLocaleString("pt-MZ")} • ${esc(o.status)}</div><div>${o.items.map(i=>`${esc(i.product_name)} × ${i.quantity}`).join("<br>")}</div>
  ${o.feedback?`<div class="feedbackBox"><span class="rating">${"★".repeat(o.feedback.rating)}${"☆".repeat(5-o.feedback.rating)}</span><br>${esc(o.feedback.comment||"")}</div>`:`<div class="feedbackBox"><button class="smallBtn" onclick="feedback(${o.id})">Deixar feedback</button></div>`}
  </div>`).join(""):"<p class='muted'>Ainda não tens compras registadas.</p>"}</div>
  <button class="smallBtn" onclick="logout()">Sair da conta</button>`;
}
async function feedback(id){
  const rating=prompt("Classifica a compra de 1 a 5:");
  if(!rating)return;
  const comment=prompt("Escreve o teu feedback:");
  try{await api("/api/feedback",{method:"POST",body:JSON.stringify({orderId:id,rating:Number(rating),comment:comment||""})});showAccount();toast("Obrigado pelo feedback!")}catch(e){toast(e.message)}
}
async function logout(){await api("/api/logout",{method:"POST"});me=null;updateAccountButton();showLogin();toast("Sessão terminada.")}

function openCart(){
  $("#accountModal").classList.remove("hidden");
  const lines=cart.map(x=>{const p=products.find(p=>p.id===x.id);return p?`<div class="cartLine"><span>${esc(p.name)} × ${x.q}</span><b>${money(p.price*x.q)}</b></div>`:""}).join("");
  const total=cart.reduce((a,x)=>{const p=products.find(p=>p.id===x.id);return a+(p?Number(p.price)*x.q:0)},0);
  $("#accountContent").innerHTML=`<h2>O teu carrinho</h2>${lines||"<p class='muted'>Carrinho vazio.</p>"}<h3>Total: ${money(total)}</h3>
  ${cart.length?`<button class="primary" onclick="checkout()">Registar compra</button>`:""}<button class="smallBtn" onclick="$('#accountModal').classList.add('hidden')">Continuar a comprar</button>`;
}
async function checkout(){
  if(!me){toast("Cria uma conta ou entra antes de comprar.");openAccount();return}
  try{
    const d=await api("/api/orders",{method:"POST",body:JSON.stringify({items:cart.map(x=>({productId:x.id,quantity:x.q}))})});
    cart=[];saveCart();await load();
    const msg=encodeURIComponent(`Olá WE Tech! Registei a compra #${d.order.id}. Gostaria de confirmar os próximos passos.`);
    $("#accountContent").innerHTML=`<h2>Compra registada! 🎉</h2><p>O pedido <b>#${d.order.id}</b> foi guardado na tua conta.</p><p>Para combinar pagamento/entrega, fala connosco:</p><a class="whatsapp" target="_blank" href="https://wa.me/${"258871570592"}?text=${msg}">Abrir WhatsApp</a><br><br><button class="smallBtn" onclick="showAccount()">Ver minhas compras</button>`;
  }catch(e){toast(e.message)}
}

async function openAdmin(){
  $("#adminModal").classList.remove("hidden");
  const s=await api("/api/admin/me");
  if(!s.admin){showAdminLogin();return}
  showAdmin();
}
function showAdminLogin(){
 $("#adminContent").innerHTML=`<p class="eyebrow">WE TECH ADMIN</p><h2>Área administrativa</h2><p class="muted">Esta área não aparece na navegação principal.</p><form class="form" id="adminLogin"><input type="password" name="password" placeholder="Palavra-passe do Admin" required><button class="primary">Entrar no Admin</button></form>`;
 $("#adminLogin").onsubmit=async e=>{e.preventDefault();try{const f=new FormData(e.target);await api("/api/admin/login",{method:"POST",body:JSON.stringify(Object.fromEntries(f))});showAdmin();toast("Admin autenticado.")}catch(x){toast(x.message)}};
}
async function showAdmin(){
 const [stats,ps,orders,feedback]=await Promise.all([api("/api/admin/stats"),api("/api/products"),api("/api/admin/orders"),api("/api/admin/feedback")]);
 $("#adminContent").innerHTML=`<div class="row" style="justify-content:space-between"><div><p class="eyebrow">PAINEL</p><h2>Administração WE Tech</h2></div><button class="smallBtn" onclick="adminLogout()">Sair</button></div>
 <div class="adminGrid"><div class="stat">Clientes<strong>${stats.customers}</strong></div><div class="stat">Compras<strong>${stats.orders}</strong></div><div class="stat">Receita<strong>${money(stats.revenue)}</strong></div><div class="stat">Feedbacks<strong>${stats.feedbacks}</strong></div></div>
 <h3>Adicionar produto</h3><form class="form" id="productForm">
 <input name="name" placeholder="Nome do produto" required><textarea name="description" placeholder="Descrição"></textarea>
 <div class="row"><input name="price" type="number" step="0.01" placeholder="Preço MT" required><input name="stock" type="number" placeholder="Stock" required><input name="icon" placeholder="Ícone (ex.: 🎮)" value="🎮"></div>
 <label class="muted">Imagem/ícone do produto<input name="image" type="file" accept="image/png,image/jpeg,image/webp"></label>
 <button class="primary">Adicionar produto</button></form>
 <h3>Produtos</h3><div>${ps.map(p=>`<div class="adminProduct">${p.image_url?`<img src="${p.image_url}">`:`<div class="miniIcon">${p.icon||"🎮"}</div>`}<div class="grow"><b>${esc(p.name)}</b><div class="muted">${money(p.price)} • stock ${p.stock}</div></div><button class="smallBtn" onclick='editProduct(${JSON.stringify(p)})'>Editar</button><button class="smallBtn danger" onclick="deleteProduct(${p.id})">Apagar</button></div>`).join("")||"<p class='muted'>Nenhum produto.</p>"}</div>
 <h3>Compras recentes</h3><div class="orders">${orders.slice(0,20).map(o=>`<div class="order"><b>#${o.id}</b> — ${esc(o.customer_name)} — ${money(o.total)}<div class="muted">${esc(o.customer_phone||"")} • ${new Date(o.created_at).toLocaleString("pt-MZ")}</div><div>${o.items.map(i=>`${esc(i.product_name)} × ${i.quantity}`).join("<br>")}</div></div>`).join("")||"<p class='muted'>Sem compras.</p>"}</div>
 <h3>Feedback dos clientes</h3><div class="orders">${feedback.slice(0,20).map(f=>`<div class="order"><b>${esc(f.customer_name||"Cliente")}</b> <span class="rating">${"★".repeat(f.rating)}${"☆".repeat(5-f.rating)}</span><div>${esc(f.comment||"")}</div><div class="muted">${new Date(f.created_at).toLocaleString("pt-MZ")}</div></div>`).join("")||"<p class='muted'>Ainda sem feedback.</p>"}</div>`;
 $("#productForm").onsubmit=async e=>{
   e.preventDefault();
   const f=new FormData(e.target), obj=Object.fromEntries(f);
   const file=f.get("image"); if(file?.size){obj.imageData=await readFile(file);obj.imageType=file.type}
   delete obj.image;
   try{await api("/api/admin/products",{method:"POST",body:JSON.stringify(obj)});toast("Produto adicionado.");showAdmin();load()}catch(x){toast(x.message)}
 };
}
function readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
async function editProduct(p){
 const name=prompt("Nome:",p.name);if(name===null)return;
 const price=prompt("Preço MT:",p.price);if(price===null)return;
 const stock=prompt("Stock:",p.stock);if(stock===null)return;
 const icon=prompt("Ícone/emoji:",p.icon||"🎮");if(icon===null)return;
 try{await api(`/api/admin/products/${p.id}`,{method:"PUT",body:JSON.stringify({name,description:p.description,price,stock,icon})});showAdmin();load();toast("Produto atualizado.")}catch(e){toast(e.message)}
}
async function deleteProduct(id){if(!confirm("Apagar este produto?"))return;try{await api(`/api/admin/products/${id}`,{method:"DELETE"});showAdmin();load();toast("Produto apagado.")}catch(e){toast(e.message)}}
async function adminLogout(){await api("/api/admin/logout",{method:"POST"});showAdminLogin()}

load().catch(e=>toast(e.message));
