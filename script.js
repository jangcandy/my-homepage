/* =========================================================
   1. 설정 - 구글 시트 연결 주소
   구글 Apps Script를 "웹 앱"으로 배포한 뒤 받은 주소를 따옴표 안에 붙여넣으세요.
   비워 두면 "미리보기 모드"로 동작합니다(주문이 시트로 가지 않고 이 브라우저에만 저장됨).
   ========================================================= */
const SCRIPT_URL = "";   // 예: "https://script.google.com/macros/s/AKfy.../exec"

const SHOP = {
  name: "별빛 리본 크리스마스샵",
  phone: "010-1234-5678",
  address: "서울시 ○○구 ○○로 12, 1층",
  hours: "매일 11:00 ~ 20:00 (월요일 휴무)",
};

/* =========================================================
   2. 상세페이지(카테고리) 3장과 상품 목록
   가격·설명·이미지는 여기 한 곳에서만 고치면 모든 페이지에 반영됩니다.
   ========================================================= */
const CATEGORIES = [
  { id: "ornament", name: "오너먼트", image: "images/gold-ball.svg",
    desc: "트리에 반짝임을 더하는 손바느질 리본과 골드 장식" },
  { id: "light", name: "캔들 · 조명", image: "images/candle.svg",
    desc: "겨울밤을 포근하게 밝혀 줄 캔들과 전구 소품" },
  { id: "wreath", name: "리스 · 미니트리", image: "images/ribbon-wreath.svg",
    desc: "현관과 책상을 크리스마스로 물들이는 리스와 트리" },
];

const PRODUCTS = [
  { id: "gold-ball",     cat: "ornament", name: "골드 볼 오너먼트",   price: 8000,  image: "images/gold-ball.svg",
    desc: "지름 8cm 유리 볼에 빨간 띠를 둘렀어요. 트리 어디에 걸어도 반짝입니다." },
  { id: "red-ribbon",    cat: "ornament", name: "레드 리본 오너먼트", price: 6000,  image: "images/red-ribbon.svg",
    desc: "벨벳 리본을 하나하나 손으로 묶었어요. 선물 포장 장식으로도 좋아요." },
  { id: "gold-star",     cat: "ornament", name: "골드 별 오너먼트",   price: 9000,  image: "images/gold-star.svg",
    desc: "트리 꼭대기용 큰 별. 가볍고 튼튼한 금속 소재입니다." },

  { id: "candle",        cat: "light",    name: "시나몬 향 캔들",     price: 15000, image: "images/candle.svg",
    desc: "시나몬·오렌지 향 소이 캔들. 약 30시간 연소됩니다." },
  { id: "garland",       cat: "light",    name: "무드 전구 가랜드",   price: 22000, image: "images/garland.svg",
    desc: "3m 길이 따뜻한 색 LED 전구줄. 건전지로 켜져 어디든 걸 수 있어요." },
  { id: "lantern",       cat: "light",    name: "그린 랜턴",          price: 28000, image: "images/lantern.svg",
    desc: "LED 촛불이 들어 있는 철제 랜턴. 테이블이나 현관에 두기 좋아요." },

  { id: "pinecone-wreath", cat: "wreath", name: "솔방울 리스",        price: 35000, image: "images/pinecone-wreath.svg",
    desc: "지름 30cm. 진짜 솔방울과 빨간 열매로 만든 수제 리스입니다." },
  { id: "mini-tree",     cat: "wreath",   name: "미니 트리",          price: 32000, image: "images/mini-tree.svg",
    desc: "높이 40cm 탁상용 트리. 별과 작은 장식이 함께 들어 있어요." },
  { id: "ribbon-wreath", cat: "wreath",   name: "리본 리스",          price: 39000, image: "images/ribbon-wreath.svg",
    desc: "큰 레드 리본과 골드 방울로 꾸민 대표 리스. 문 장식으로 인기 최고!" },
];

/* =========================================================
   3. 공통 도우미
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const won = (n) => Number(n).toLocaleString("ko-KR") + "원";
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
const findCategory = (id) => CATEGORIES.find((c) => c.id === id);

// 페이지 이동 (미리보기 합본에서는 #주소로 이동)
function go(url) {
  if (window.PREVIEW) location.hash = url;
  else location.href = url;
}

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeSnow() {
  const box = $(".snow");
  if (!box || box.childElementCount) return;
  for (let i = 0; i < 36; i++) {
    const s = el("span", {}, Math.random() < .5 ? "❄" : "•");
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 8 + Math.random() * 14 + "px";
    s.style.animationDuration = 7 + Math.random() * 10 + "s";
    s.style.animationDelay = -Math.random() * 15 + "s";
    box.appendChild(s);
  }
}

function markMenu(page) {
  document.querySelectorAll(".site-header nav a").forEach((a) => {
    a.classList.toggle("current", a.dataset.nav === page);
  });
}

/* =========================================================
   4. 메인: 상세 카드 3장
   ========================================================= */
function initHome() {
  const box = $("#category-cards");
  box.innerHTML = "";
  CATEGORIES.forEach((c) => {
    const a = el("a", { class: "card", href: `product.html?cat=${c.id}` });
    a.appendChild(el("img", { src: c.image, alt: c.name }));
    const body = el("div", { class: "body" });
    body.appendChild(el("h3", {}, c.name));
    body.appendChild(el("p", {}, c.desc));
    body.appendChild(el("span", { class: "more" }, "구경하기 →"));
    a.appendChild(body);
    box.appendChild(a);
  });
}

/* =========================================================
   5. 상세페이지: 품목 버튼 → 가격·상세이미지 → 주문 버튼
   ========================================================= */
function initProduct(params) {
  const cat = findCategory(params.get("cat")) || CATEGORIES[0];

  // 상세페이지 3장 이동 탭
  const tabs = $("#cat-tabs");
  tabs.innerHTML = "";
  CATEGORIES.forEach((c) => {
    tabs.appendChild(el("a", { class: "tab" + (c.id === cat.id ? " active" : ""), href: `product.html?cat=${c.id}` }, c.name));
  });
  $("#cat-title").textContent = cat.name;
  $("#cat-desc").textContent = cat.desc;

  // 품목 버튼
  const btnBox = $("#item-buttons");
  btnBox.innerHTML = "";
  const items = PRODUCTS.filter((p) => p.cat === cat.id);
  items.forEach((p) => {
    const b = el("button", { type: "button", class: "item-btn", "data-id": p.id }, p.name);
    b.onclick = () => showItem(p);
    btnBox.appendChild(b);
  });

  $("#item-detail").hidden = true;
  $("#pick-hint").hidden = false;
  const pre = findProduct(params.get("item"));
  if (pre && pre.cat === cat.id) showItem(pre);
}

function showItem(p) {
  document.querySelectorAll(".item-btn").forEach((b) => b.classList.toggle("active", b.dataset.id === p.id));
  $("#pick-hint").hidden = true;

  const box = $("#item-detail");
  box.hidden = false;
  box.style.animation = "none"; void box.offsetWidth; box.style.animation = "";

  $("#detail-img").src = p.image;
  $("#detail-img").alt = p.name + " 상세 이미지";
  $("#detail-name").textContent = p.name;
  $("#detail-price").textContent = won(p.price);
  $("#detail-desc").textContent = p.desc;

  let qty = 1;
  const update = () => {
    $("#qty-out").textContent = qty;
    $("#detail-sum").textContent = "합계 " + won(p.price * qty);
  };
  $("#qty-minus").onclick = () => { if (qty > 1) qty--; update(); };
  $("#qty-plus").onclick = () => { if (qty < 50) qty++; update(); };
  $("#order-btn").onclick = () => go(`order.html?item=${p.id}&qty=${qty}`);
  update();
}

/* =========================================================
   6. 예약 주문: 폼 → 구글 시트 전송 → 접수 완료 화면
   ========================================================= */
function initOrder(params) {
  const form = $("#order-form");
  const select = form.elements.product;

  // 품목 선택 상자 채우기
  select.innerHTML = '<option value="">품목을 골라 주세요</option>';
  CATEGORIES.forEach((c) => {
    const g = el("optgroup", { label: c.name });
    PRODUCTS.filter((p) => p.cat === c.id).forEach((p) => g.appendChild(el("option", { value: p.id }, `${p.name} (${won(p.price)})`)));
    select.appendChild(g);
  });

  form.reset();
  form.hidden = false;
  $("#order-done").hidden = true;
  $("#order-msg").hidden = true;

  if (findProduct(params.get("item"))) select.value = params.get("item");
  const q = parseInt(params.get("qty"), 10);
  form.elements.qty.value = q >= 1 && q <= 50 ? q : 1;

  // 픽업 날짜는 내일부터
  const t = new Date(); t.setDate(t.getDate() + 1);
  form.elements.date.min = t.toISOString().slice(0, 10);

  const total = () => {
    const p = findProduct(select.value);
    const n = parseInt(form.elements.qty.value, 10) || 0;
    $("#order-total").textContent = p ? won(p.price * n) : "0원";
  };
  select.onchange = total;
  form.elements.qty.oninput = total;
  total();

  $("#preview-note").hidden = !!SCRIPT_URL;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const p = findProduct(select.value);
    const qty = parseInt(form.elements.qty.value, 10);
    const now = new Date();
    const order = {
      orderNo: "XS" + now.toISOString().slice(2, 10).replace(/-/g, "") + "-" + String(Math.floor(Math.random() * 9000) + 1000),
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      item: p.name,
      qty,
      total: p.price * qty,
      date: form.elements.date.value,
      memo: form.elements.memo.value.trim(),
    };

    const btn = $("#submit-btn");
    btn.disabled = true;
    btn.textContent = "접수 중…";
    $("#order-msg").hidden = true;

    try {
      if (SCRIPT_URL) {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(order) });
      }
      saveLocal(order);
      showDone(order);
    } catch (err) {
      const m = $("#order-msg");
      m.textContent = `인터넷 연결 문제로 접수하지 못했어요. 잠시 후 다시 시도하시거나 ${SHOP.phone}로 전화 주세요.`;
      m.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = "예약 주문 보내기";
    }
  };
}

// 손님 브라우저에도 사본을 남겨 둠(내 주문 확인용)
function saveLocal(order) {
  try {
    const list = JSON.parse(localStorage.getItem("xshop-orders") || "[]");
    list.push({ ...order, savedAt: new Date().toISOString() });
    localStorage.setItem("xshop-orders", JSON.stringify(list));
  } catch (e) { /* 저장이 막힌 브라우저면 건너뜀 */ }
}

function showDone(o) {
  $("#order-form").hidden = true;
  const dl = $("#done-list");
  dl.innerHTML = "";
  [["주문번호", o.orderNo], ["이름", o.name], ["연락처", o.phone], ["품목", `${o.item} × ${o.qty}`],
   ["금액", won(o.total)], ["픽업 희망일", o.date], ["요청사항", o.memo || "없음"]].forEach(([k, v]) => {
    dl.appendChild(el("dt", {}, k));
    dl.appendChild(el("dd", {}, v));
  });
  $("#done-preview").hidden = !!SCRIPT_URL;
  $("#order-done").hidden = false;
  window.scrollTo(0, 0);
}

/* =========================================================
   7. 시작
   ========================================================= */
const PAGE_INIT = { home: initHome, product: initProduct, order: initOrder };

function fillShopInfo() {
  document.querySelectorAll("[data-shop]").forEach((n) => { n.textContent = SHOP[n.dataset.shop]; });
}

document.addEventListener("DOMContentLoaded", () => {
  makeSnow();
  fillShopInfo();
  if (window.PREVIEW) return;           // 미리보기 합본은 아래쪽 라우터가 처리
  const page = document.body.dataset.page;
  markMenu(page);
  PAGE_INIT[page] && PAGE_INIT[page](new URLSearchParams(location.search));
});
