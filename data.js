
window.MENU = [
  {id:"espresso", name:"Эспрессо", category:"Кофе", price:150, stock:10, image:"01_espresso.png"},
  {id:"americano", name:"Американо", category:"Кофе", price:240, stock:15, image:"02_americano.png"},
  {id:"cappuccino", name:"Капучино", category:"Кофе", price:290, stock:10, image:"03_cappuccino.png"},
  {id:"raf", name:"Раф Cinnabon", category:"Кофе", price:350, stock:10, image:"04_raf_cinnabon.png"},
  {id:"mulled", name:"неГлинтвейн Wildberry", category:"Горячие напитки", price:380, stock:20, image:"05_neglintwein_wildberry.png"},
  {id:"tea_black", name:"Чай листовой чёрный", category:"Чай", price:290, stock:10, image:"06_tea_black.png"},
  {id:"tea_green", name:"Чай листовой зелёный", category:"Чай", price:290, stock:10, image:"07_tea_green.png"},
  {id:"corn_dog", name:"Корн-дог", category:"Еда", price:280, stock:15, image:"08_corn_dog.png"},
  {id:"water_still", name:"Вода без газа", category:"Вода", price:150, stock:30, image:"09_water_still.png"},
  {id:"water_sparkling", name:"Вода газированная", category:"Вода", price:150, stock:15, image:"10_water_sparkling.png"},
  {id:"sandwich_turkey", name:"Сэндвич Индейка + моцарелла", category:"Еда", price:440, stock:10, image:"11_sandwich_turkey_mozzarella.png"},
  {id:"sandwich_caesar", name:"Сэндвич Цезарь", category:"Еда", price:440, stock:10, image:"12_sandwich_caesar.png"},
  {id:"sandwich_ham", name:"Сэндвич Ветчина + сыр", category:"Еда", price:260, stock:10, image:"13_sandwich_ham_cheese.png"},
  {id:"tube", name:"Трубочка со сгущёнкой", category:"Еда", price:200, stock:10, image:"14_condensed_tube.png"}
];

window.STORE_KEY = "sdm_preorder_store_v4";

window.ensureStore = function(){
  let store = JSON.parse(localStorage.getItem(window.STORE_KEY) || "null");
  if(!store){
    store = {
      products: Object.fromEntries(window.MENU.map(p => [p.id, {stock:p.stock, enabled:true}])),
      orders: []
    };
    localStorage.setItem(window.STORE_KEY, JSON.stringify(store));
  }
  return store;
}

window.saveStore = function(store){
  localStorage.setItem(window.STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new StorageEvent("storage", {key: window.STORE_KEY, newValue: JSON.stringify(store)}));
}
