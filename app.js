// Configure aqui o WhatsApp comercial da Maia Balloons, somente números com DDI + DDD.
const WHATSAPP_NUMBER = "5511952909882"; // +55 11 95290-9882 (WhatsApp comercial da Maia Balloons)
const categoryLabels = {baloes:"Balões", cafe:"Café da manhã", cestas:"Cestas personalizadas", casal:"Presentes para casal", kids:"Kids"};
const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
let activeFilter = "todos";
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function renderProducts(){
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const list = window.PRODUCTS.filter(p => (activeFilter === "todos" || p.cat === activeFilter) &&
    `${p.name} ${p.desc} ${categoryLabels[p.cat]}`.toLocaleLowerCase("pt-BR").includes(query));
  resultsCount.textContent = `${list.length} ${list.length === 1 ? "presente" : "presentes"}`;
  emptyState.hidden = list.length !== 0;
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <button class="product-photo" type="button" data-product="${p.id}" aria-label="Ampliar imagem de ${p.name}">
        <img src="assets/${p.page}" alt="${p.name}" loading="lazy">
        <span class="product-category">${categoryLabels[p.cat]}</span>${p.best ? '<span class="product-badge">♡ Melhor presente!</span>' : ""}
        <span class="photo-zoom" aria-hidden="true">⌕</span>
      </button>
      <div class="product-info">
        <h3>${p.name}</h3><p>${p.desc}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}</span>
          <button class="order-button" data-order="${p.id}">Quero esse ↗</button>
        </div>
      </div>
    </article>`).join("");
}
function selectFilter(filter){
  activeFilter = filter;
  document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active",btn.dataset.filter === filter));
  renderProducts();
}
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click",()=>selectFilter(btn.dataset.filter)));
document.querySelectorAll("[data-filter]").forEach(link => {
  if(link.classList.contains("filter")) return;
  link.addEventListener("click",()=>{selectFilter(link.dataset.filter || "todos");document.getElementById("mainNav").classList.remove("open");document.getElementById("menuToggle").setAttribute("aria-expanded","false");});
});
searchInput.addEventListener("input",renderProducts);
const productModal = document.getElementById("productModal");
const modalImage = document.getElementById("modalImage");
const modalImageWrap = document.getElementById("modalImageWrap");
let modalProduct = null;
let zoom = 1;

function setModalZoom(nextZoom){
  zoom = Math.min(3, Math.max(1, nextZoom));
  modalImage.style.transform = `scale(${zoom})`;
  document.getElementById("zoomReset").textContent = `${Math.round(zoom * 100)}%`;
  modalImageWrap.classList.toggle("is-zoomed", zoom > 1);
}

function openProductModal(product){
  modalProduct = product;
  modalImage.src = `assets/${product.page}`;
  modalImage.alt = product.name;
  document.getElementById("modalCategory").textContent = categoryLabels[product.cat];
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalDescription").textContent = product.desc;
  document.getElementById("modalPrice").textContent = money(product.price);
  document.getElementById("modalOrder").dataset.order = product.id;
  setModalZoom(1);
  productModal.showModal();
  document.body.classList.add("modal-open");
}

function closeProductModal(){
  if(productModal.open) productModal.close();
}

function sendWhatsApp(product){
  const message = `Olá! Gostaria de consultar disponibilidade para: ${product.name} — ${money(product.price)}. Poderia me passar os detalhes, por favor?`;
  if(!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "5511999999999"){
    const toast = document.getElementById("toast");
    toast.textContent = "Antes de publicar, configure o número de WhatsApp em app.js.";
    toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),3500);
    return;
  }
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

grid.addEventListener("click",event=>{
  const btn = event.target.closest("[data-order]");
  if(btn){
    event.stopPropagation();
    const product = window.PRODUCTS.find(p=>p.id===btn.dataset.order);
    if(product) sendWhatsApp(product);
    return;
  }
  const photo = event.target.closest("[data-product]");
  if(!photo) return;
  event.stopPropagation();
  const product = window.PRODUCTS.find(p=>p.id===photo.dataset.product);
  if(product) openProductModal(product);
});

document.getElementById("modalClose").addEventListener("click",closeProductModal);
document.getElementById("zoomIn").addEventListener("click",()=>setModalZoom(zoom + .25));
document.getElementById("zoomOut").addEventListener("click",()=>setModalZoom(zoom - .25));
document.getElementById("zoomReset").addEventListener("click",()=>setModalZoom(1));
document.getElementById("modalOrder").addEventListener("click",event=>{
  event.stopPropagation();
  if(modalProduct) sendWhatsApp(modalProduct);
});
modalImageWrap.addEventListener("dblclick",()=>setModalZoom(zoom === 1 ? 2 : 1));
modalImageWrap.addEventListener("wheel",event=>{event.preventDefault(); setModalZoom(zoom + (event.deltaY < 0 ? .25 : -.25));},{passive:false});
productModal.addEventListener("click",event=>{if(event.target === productModal) closeProductModal();});
productModal.addEventListener("close",()=>document.body.classList.remove("modal-open"));
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click",()=>{
  const nav=document.getElementById("mainNav");
  const open=nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
});
renderProducts();
